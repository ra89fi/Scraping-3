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

## Instructions

1. Clone the repo
2. Run `'npm install'`
3. Uncomment line 105 or 106
4. Run 'npm start'

## Thoughts

1. Error handling mechanism is needed to handle errors generated while scraping. We could queue up an Url if error occurs for re-try or stop altogether. Depends on the scenario.
2. Re-try strategies needed to re-try fetching a page after failing. Max number of re-tries and waiting period between them needs to be configured accordingly. We can queue up a failed Url and retry after a certain period. We stop if we exceed max number of re-tries.
3. Rate limiting is necessary to avoid getting blocked, together with lowering maximum number of requests that can be carried out at a time. node-crawler is a package that provides this out of the box.
4. Puppeteer has lots of features but its memory footprint is high and slower. If we dont't need those extra features, Puppeteer is an overkill.
   Playwright is reliable, fast and efficient. The main difference with Puppeteer is its cross browser support.
5. Using worker threads or other means to improve performance
6. Be self-restraining and slow to stay under radar and behave like a regular browser.
7. Accessing more content than the set limit could be achieved by switching browser agents and proxy service.

## Work in Progress
1. Re-try mechanism
