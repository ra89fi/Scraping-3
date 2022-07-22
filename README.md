# Simple Scraping using NodeJs and Cheerio

This is a playground for Scraping using NodeJs and Cheerio.

## Resources

1. [Cheerio](https://cheerio.js.org/)
2. [Web Scraping With Node.js](https://www.smashingmagazine.com/2015/04/web-scraping-with-nodejs/)
3. [Web Scraping with Javascript and NodeJS](https://www.scrapingbee.com/blog/web-scraping-javascript/)
4. [How to Scrape Websites with Node.js and Cheerio](https://www.freecodecamp.org/news/how-to-scrape-websites-with-node-js-and-cheerio/)
5. [Node.js web scraping tutorial](https://blog.logrocket.com/node-js-web-scraping-tutorial/)
6. [Web Scraping without getting blocked](https://www.scrapingbee.com/blog/web-scraping-without-getting-blocked/)
7. [Scraping the web with Playwright](https://www.scrapingbee.com/blog/playwright-web-scraping/)
8. [node-crawler](https://github.com/bda-research/node-crawler)

## Instructions

1. Clone the repo
2. Run `'npm install'`
3. For basic, see index.js, uncomment line 105 or 106 and run 'npm start'
4. For simple retry, see retry.js file, line 22 and run 'node retry.js'
5. For retry in each function, see retry_advanced.js, lines 192-195 and run 'node retry_advanced.js'

## Thoughts

1. For error handling, retry and rate limiting, `node`-crawler package is used.
2. Puppeteer has lots of features but its memory footprint is high and slower. If we dont't need those extra features, Puppeteer is an overkill.
   Playwright is reliable, fast and efficient. The main difference with Puppeteer is its cross browser support.
3. Using worker threads or other means to improve performance?
4. Accessing more content than the set limit could be achieved by switching browser agents and proxy service?
