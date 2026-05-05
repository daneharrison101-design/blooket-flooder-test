const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const GAME_ID = process.env.GAME_ID;
const BOT_COUNT = parseInt(process.env.BOT_COUNT);
const BASE_NAME = process.env.BOT_NAME;

async function runBot(id, name, index) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-gpu']
    });
    try {
        const page = await browser.newPage();
        // Block images/styles for max speed
        await page.setRequestInterception(true);
        page.on('request', r => ['image', 'media', 'font', 'stylesheet'].includes(r.resourceType()) ? r.abort() : r.continue());

        await page.goto('https://play.blooket.com/play', { waitUntil: 'domcontentloaded' });
        
        await page.waitForSelector('input');
        await page.type('input', id);
        await page.keyboard.press('Enter');
        
        await new Promise(r => setTimeout(r, 2000)); // Short wait for name screen
        
        await page.waitForSelector('input');
        await page.type('input', name + Math.floor(Math.random() * 9999));
        await page.keyboard.press('Enter');
        
        console.log(`[🚀] ${name} Joined!`);
        await new Promise(r => setTimeout(r, 900000)); // Keep in lobby
    } catch (e) {
        await browser.close();
    }
}

async function start() {
    for (let i = 1; i <= BOT_COUNT; i++) {
        runBot(GAME_ID, BASE_NAME, i);
        await new Promise(r => setTimeout(r, 1000)); // 1 bot per second!
    }
}
start();
