const Crawler = require('crawler');

const c = new Crawler({
    // max simultaneous connections
    maxConnections: 1,
    // size of gap between each request in milliseconds
    rateLimit: 2000,
    // max number of retries
    retries: 3,
    // number of milliseconds to wait before retrying
    retryTimeout: 10000,
    // This will be called for each crawled page
    callback: (error, res, done) => {
        if (error) {
            console.log(error.message);
        } else {
            // if allPage config is true, set up next page
            if (res.options.allPage) setupNextPage(res.$, res.request.uri.href);
            // res.$ is Cheerio by default
            // current url is loaded into cheerio
            // process this page
            addItems(res.$);
        }
        done();
    },
});

let allItemIds = [];

c.on('drain', () => {
    console.log('Total items', allItemIds.length);
});

// customizable configurations dependent on page
const configObj = {
    // crawl all page? true|false
    allPage: true,
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

// Queue just one URL, with default callback
c.queue({ uri: configObj.initUrl, allPage: configObj.allPage });

// function to iterate over pages
function getNextPageUrl() {}

// function that fetches item urls + item ids
function addItems($) {
    const pageItems = $(configObj.itemSpecifier, $('body'));
    console.log(`${pageItems.length} items fetched`);
    pageItems.each((_, el) => {
        const obj = {};
        obj.id = $(el).attr('id');
        const link = $(configObj.itemUrlSpecifier, el)[0];
        if (link) obj.url = $(link).attr('href');
        allItemIds.push(obj);
    });
}

// function that shows how many total ads exist for the provided initial url
function getTotalAdsCount() {}

// function that scrapes the actual ads and parses into the format: item id, title, price, registration date, production date, mileage, power
function scrapeTruckItem() {}

// find out if next page exists and if yes, queue it
function setupNextPage($, currentUrl) {
    if (configObj.hasNextPage($)) {
        const pageNumber = currentUrl.split(configObj.urlPageSpecifier);
        console.log('Page', pageNumber[1] || 1);
        if (pageNumber.length === 2) {
            // page number is specified in url
            // increment to get next page url
            pageNumber[1] = parseInt(pageNumber[1]) + 1;
            c.queue({
                uri: pageNumber.join(configObj.urlPageSpecifier),
                allPage: configObj.allPage,
            });
        } else {
            // this is first page, create url for 2nd page
            c.queue({
                uri: configObj.initUrl + configObj.urlPageSpecifier + '2',
                allPage: configObj.allPage,
            });
        }
    } else {
        // no next page
        console.log('Last page');
    }
}
