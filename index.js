const axios = require('axios');
const cheerio = require('cheerio');

// customizable configurations to pass to the constructor
const configObj = {
    // url to scrape
    initUrl:
        'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc',
    // what specifies the page number in subsequent urls
    urlPageSpecifier: '&page=',
    // function to find out if the next page exists
    hasNextPage: function () {
        const elem = this._$(
            '.pagination-list li[data-testid="pagination-step-forwards"]'
        )[0];
        if (elem && elem.attribs['aria-disabled'] === 'false') return true;
        else return false;
    },
    // specifies an item in a page
    itemSpecifier: 'main article[data-testid="listing-ad"]',
    // specifies item url inside the item container
    itemUrlSpecifier: 'h2[data-testid="ad-title"] a',
};

// class to bind the functionaliy together inside an object
// create multiple instances with different configurations
class Scraper {
    constructor(configObj) {
        this.initUrl = configObj.initUrl;
        this.urlPageSpecifier = configObj.urlPageSpecifier;
        this.hasNextPage = configObj.hasNextPage.bind(this);
        this.itemSpecifier = configObj.itemSpecifier;
        this.itemUrlSpecifier = configObj.itemUrlSpecifier;
        this._nextUrl = configObj.initUrl;
        this._domain = configObj.initUrl.split('/').slice(0, 3).join('/');
        // cheerio
        this._$ = null;
        // holds current page items only
        this.pageItemIds = [];
        // holds all items
        this.allItemIds = [];
    }

    // load html from an url into cheerio
    async _loadUrlData(url) {
        try {
            const { data } = await axios.get(url);
            this._$ = cheerio.load(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // function to iterate over pages
    async getNextPageUrl() {
        if (!this._nextUrl) return;
        console.log(`Processing -> ${this._nextUrl}`);
        if (await this._loadUrlData(this._nextUrl)) {
            if (this.hasNextPage()) {
                const pageNumber = this._nextUrl.split(this.urlPageSpecifier);
                if (pageNumber.length === 2) {
                    // page number is specified in url
                    // increment to get next page url
                    pageNumber[1] = parseInt(pageNumber[1]) + 1;
                    this._nextUrl = pageNumber.join(this.urlPageSpecifier);
                } else {
                    // this is first page, create url for 2nd page
                    this._nextUrl = this.initUrl + this.urlPageSpecifier + '2';
                }
            } else {
                // no next page
                this._nextUrl = null;
            }
            return true;
        } else {
            // could not load data into cheerio from url
            return false;
        }
    }

    // function that fetches item urls + item ids
    addItems() {
        const pageItems = this._$(this.itemSpecifier);
        console.log(`${pageItems.length} items fetched`);
        // reset pageItems to empty array
        this.pageItems = [];
        pageItems.each((_, el) => {
            const obj = {};
            obj.id = this._$(el).attr('id');
            const link = this._$(this.itemUrlSpecifier, el)[0];
            if (link) obj.url = this._$(link).attr('href');
            this.pageItemIds.push(obj);
            this.allItemIds.push(obj);
        });
    }

    // function that shows how many total ads exist for the provided initial url
    async getTotalAdsCount() {
        // iterate over the pages and fetch items
        while (await this.getNextPageUrl()) {
            this.addItems();
        }
        console.log(`${this.allItemIds.length} items in total`);
    }

    // function that scrapes the actual ads and parses into the format: item id, title, price, registration date, production date, mileage, power
    scrapeTruckItem() {}
}

const scraper = new Scraper(configObj);
scraper.getTotalAdsCount().then(() => {});
