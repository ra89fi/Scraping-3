const fs = require('fs');
const Crawler = require('crawler');

// configuration for crawler
const crawlerConfig = {
    // max simultaneous connections
    maxConnections: 1,
    // size of gap between each request in milliseconds
    rateLimit: 2000,
    // max number of retries
    retries: 3,
    // number of milliseconds to wait before retrying
    retryTimeout: 10000,
};

// customizable configurations dependent on page
const configObj = {
    // crawl all page? true|false
    allPage: false,
    // url to scrape
    initUrl:
        'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc',
    // what specifies the page number in subsequent urls
    urlPageSpecifier: '&page=',
    // function to find out if the next page exists
    hasNextPage: function ($) {
        const elem = $(
            '.pagination-list li[data-testid="pagination-step-forwards"]',
            $('body')
        )[0];
        if (elem && elem.attribs['aria-disabled'] === 'false') return true;
        else return false;
    },
    // specifies an item in a page
    itemSpecifier: 'main article[data-testid="listing-ad"]',
    // specifies item url inside the item container
    itemUrlSpecifier: 'h2[data-testid="ad-title"] a',
};

// function that runs the scraper
function runScraper(useItemsFn, end) {
    // create a crawler
    const crawler = new Crawler(crawlerConfig);
    crawler.on('drain', () => {
        console.log('Empty queue');
        end();
    });
    function callback(error, res, done) {
        if (error) {
            console.log(error.message);
            if (done) done();
            return;
        }
        if (res.options.allPage)
            queueNextPage(crawler, res.$, res.request.uri.href, callback);
        // process this page
        const $ = res.$;
        const pageItems = $(configObj.itemSpecifier, $('body'));
        console.log(`${pageItems.length} items fetched`);
        // use the pageItems as needed
        useItemsFn(pageItems, $);
        if (done) done();
    }
    // make a direct request for the first page
    // if okay, queue up following pages with callback
    crawler.direct({
        uri: configObj.initUrl,
        allPage: configObj.allPage,
        callback: (error, res) => {
            if (error) {
                console.log(error.message);
            } else {
                callback(error, res);
                if (!res.options.allPage) end();
            }
        },
    });
}

// function to iterate over pages
function getNextPageUrl() {
    // create a crawler
    const crawler = new Crawler(crawlerConfig);
    crawler.on('drain', () => {
        console.log('Empty queue');
    });
    function callback(error, res, done) {
        if (error) {
            console.log(error.message);
            if (done) done();
            return;
        }
        if (res.options.allPage)
            queueNextPage(crawler, res.$, res.request.uri.href, callback);
        // process this page
        // do something with res
        console.log(res.$('title', res.$('head')).text(), 'is loaded');
        if (done) done();
    }
    // make a direct request for the first page
    // if okay, queue up following pages with callback
    crawler.direct({
        uri: configObj.initUrl,
        allPage: configObj.allPage,
        callback: (error, res) => {
            if (error) {
                console.log(error.message);
            } else {
                callback(error, res);
            }
        },
    });
}

// function that fetches item urls + item ids
function addItems() {
    // what to do with fetched items
    function useItemsFn(dest, pageItems, $) {
        pageItems.each((_, el) => {
            const obj = {};
            obj.id = $(el).attr('id');
            const link = $(configObj.itemUrlSpecifier, el)[0];
            if (link) obj.url = $(link).attr('href');
            dest.push(obj);
        });
    }
    const allItemIds = [];
    runScraper(useItemsFn.bind(null, allItemIds), () => {
        console.log(allItemIds.length, 'items in total');
    });
}

// function that shows how many total ads exist for the provided initial url
function getTotalAdsCount() {
    // what to do with fetched items
    function useItemsFn(dest, pageItems, _) {
        dest.num += pageItems.length;
    }
    let obj = { num: 0 };
    runScraper(useItemsFn.bind(null, obj), () => {
        console.log(obj.num, 'ads in total');
    });
}

// function that scrapes the actual ads and parses into the format: item id, title, price, registration date, production date, mileage, power
function scrapeTruckItem() {
    // what to do with fetched items
    function useItemsFn(dest, pageItems, $) {
        pageItems.each((_, el) => {
            const obj = {};
            obj.id = $(el).attr('id');
            let span = $('span[data-testid="financing-widget"]', el)[0];
            obj.title = span.attribs['data-title'];
            obj.price = span.attribs['data-price'];
            obj.production_year = $(el).find('ul')[0];
            obj.production_year = $(obj.production_year).find('li')[0];
            obj.mileage = $(obj.production_year).next('li');
            obj.production_year = $(obj.production_year).text();
            obj.mileage = $(obj.mileage).text();
            dest.push(obj);
        });
    }
    let items = [];
    runScraper(useItemsFn.bind(null, items), () => {
        console.log(items.length, 'trucks in total');
        fs.writeFileSync('trucks.json', JSON.stringify(items));
    });
}

// find out if next page exists and if yes, queue it
function queueNextPage(crawler, $, currentUrl, callback) {
    if (configObj.hasNextPage($)) {
        const pageNumber = currentUrl.split(configObj.urlPageSpecifier);
        console.log('Page', pageNumber[1] || 1);
        if (pageNumber.length === 2) {
            // page number is specified in url
            // increment to get next page url
            pageNumber[1] = parseInt(pageNumber[1]) + 1;
        } else pageNumber[1] = 2;
        crawler.queue({
            uri: pageNumber.join(configObj.urlPageSpecifier),
            allPage: configObj.allPage,
            callback,
        });
    } else {
        // no next page
        console.log('Last page');
    }
}

// Test run
// addItems();
// getTotalAdsCount();
// scrapeTruckItem();
// getNextPageUrl();
