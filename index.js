const axios = require('axios');
const cheerio = require('cheerio');

const DOMAIN = 'https://www.otomoto.pl';
const URL =
    'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc';

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
                    const ads = $page('main article[data-testid="listing-ad"]');
                    console.log('Found ' + ads.length + ' items');
                    numItems += ads.length;
                })
                .catch((error) => console.log(error.message));
        });
    })
    .catch((error) => console.log(error.message));

// function to iterate over pages
function getNextPageUrl() {}

// function that fetches item urls + item ids
function addItems() {}

// function that shows how many total ads exist for the provided initial url
function getTotalAdsCount() {}

// function that scrapes the actual ads and parses into the format: item id, title, price, registration date, production date, mileage, power
function scrapeTruckItem() {}
