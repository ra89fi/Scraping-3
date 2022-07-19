const axios = require('axios');
const cheerio = require('cheerio');

const URL =
    'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc';

axios
    .get(URL)
    .then((response) => {
        console.log(response.data.length);
        const $ = cheerio.load(response.data);
        console.log($('title').text());
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
