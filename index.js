const axios = require('axios');
const cheerio = require('cheerio');

const URL =
    'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc';

function initTest() {
    const DOMAIN = 'https://www.otomoto.pl';
    axios
        .get(URL)
        .then((response) => {
            const $ = cheerio.load(response.data);
            let numItems = 0;
            // load this page items
            const ads = $('main article[data-testid="listing-ad"]');
            console.log('Found ' + ads.length + ' items');
            numItems += ads.length;
            // then process next pages
            const pageLinks = $('.pagination-list .pagination-item a');
            let numPages = 1;
            pageLinks.each((_, link) => {
                // page 1 already processed, skip it
                if (_ === 0) return;
                // get href of each link
                let url = $(link).attr('href');
                // add domain if relative url
                if (url.charAt(0) === '/') url = DOMAIN + url;
                numPages++;
                axios
                    .get(url)
                    .then((respose) => {
                        let $page = cheerio.load(respose.data);
                        // load this page items
                        const ads = $page(
                            'main article[data-testid="listing-ad"]'
                        );
                        console.log('Found ' + ads.length + ' items');
                        numItems += ads.length;
                    })
                    .catch((error) => console.log(error.message));
            });
        })
        .catch((error) => console.log(error.message));
}

class Scraper {
    constructor(initUrl) {
        this.initUrl = initUrl;
        this._nextUrl = initUrl;
        this._domain = initUrl.split('/').slice(0, 3).join('/');
        this._$currentPage = null;
        this.pageItemIds = [];
        this.allItemIds = [];
    }

    async _loadUrlData(url) {
        try {
            const { data } = await axios.get(url);
            this._$currentPage = cheerio.load(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // function to iterate over pages
    async getNextPageUrl() {
        if (!this._nextUrl) return;
        console.log(`processing ${this._nextUrl}`);
        if (await this._loadUrlData(this._nextUrl)) {
            const hasNextPage = this._$currentPage(
                '.pagination-list li[data-testid="pagination-step-forwards"]'
            )[0];
            if (
                hasNextPage &&
                hasNextPage.attribs['aria-disabled'] === 'false'
            ) {
                const pageNumber = this._nextUrl.split('&page=');
                if (pageNumber.length === 2) {
                    // page number is specified in url
                    pageNumber[1] = parseInt(pageNumber[1]) + 1;
                    this._nextUrl = pageNumber.join('&page=');
                } else {
                    // this is first page, next is second page
                    this._nextUrl = this.initUrl + '&page=2';
                }
            } else {
                this._nextUrl = null;
            }
            return true;
            // const activeLink = this._$currentPage(
            //     '.pagination-list .pagination-item__active'
            // )[0];
            // if (activeLink) {
            //     const nextLink =
            //         this._$currentPage(activeLink).nextAll('li')[0];
            //     if (nextLink) {
            //         let href =
            //             this._$currentPage(nextLink).children('a')[0]?.attribs
            //                 ?.href;
            //         if (href) {
            //             if (href.charAt(0) === '/') href = this._domain + href;
            //             this._nextUrl = href;
            //             return true;
            //         } else {
            //             this._nextUrl = null;
            //             return false;
            //         }
            //     }
            // }
        } else {
            return false;
        }
    }

    // function that fetches item urls + item ids
    addItems() {
        const pageItems = this._$currentPage(
            'main article[data-testid="listing-ad"]'
        );
        pageItems.each((_, el) => {
            const obj = {};
            obj.id = this._$currentPage(el).attr('id');
            const link = this._$currentPage(
                'h2[data-testid="ad-title"] a',
                el
            )[0];
            if (link) obj.url = this._$currentPage(link).attr('href');
            this.pageItemIds.push(obj);
            this.allItemIds.push(obj);
        });
    }

    // function that shows how many total ads exist for the provided initial url
    async getTotalAdsCount() {
        // console.log(`${this._nextUrl} has ->`);
        while (await this.getNextPageUrl()) {
            this.addItems();
            // console.log(`<- ${this.pageItemIds.length} items`);
        }
        console.log(`${this.allItemIds.length} items in total`);
    }

    // function that scrapes the actual ads and parses into the format: item id, title, price, registration date, production date, mileage, power
    scrapeTruckItem() {}
}

const scraper = new Scraper(URL);
scraper.getTotalAdsCount().then(() => {});
