const {getChrome} = require("./getChrome");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context, callback) => {

// Instantiate a Chrome browser
context.callbackWaitsForEmptyEventLoop = false;
const chrome = await getChrome();

const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint
  });

// CORS headers so we can make cross domain requests to our Lambda
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "access-control-allow-methods": "GET"
};

    // Bail out if there's no params
if (!event.queryStringParameters) {
    callback(null, {
        statusCode: 400,
        headers,
        body: "You need a url"
    });
}

const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
];

const options = {
    args,
    headless: true,
    ignoreHTTPSErrors: true
};

const browser = await puppeteer.launch(options);
const page = await browser.newPage();

await page.setViewport({
    width: 1280,
    height: 800
});

// await page.goto('https://www.espn.com/fantasy/', { waitUntil: 'networkidle2' })
await page.goto('https://www.espn.com/fantasy/')
await new Promise(r => setTimeout(r, 3000));
await page.click(`button.button-alt.med[tref="/members/v3_1/login"]`);
await new Promise(r => setTimeout(r, 1000));

var frames = await page.frames();
var loginIframe = frames.find(
    f =>
    f.url().indexOf("cdn.registerdisney.go.com/v2/ESPN-ONESITE.WEB-PROD") > -1);

const emailInput = await loginIframe.$(`form input[type="email"]`);
await emailInput.type("janica@outliant.com");

const passwordInput = await loginIframe.$(`form input[type="password"]`);
await passwordInput.type("yoyoyo123");

await loginIframe.click(`button[type="submit"]`);

await new Promise(r => setTimeout(r, 10000));

const cookies = await page.cookies();
console.log(JSON.stringify(cookies, null, 2));

await page.screenshot({
    path: 'screenshot.png'
});

await browser.close();
console.log('See screen shot below.');
};
