const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function runBot(gameId, name) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        await page.goto('https://play.blooket.com/play', { waitUntil: 'networkidle2' });
        
        await page.waitForSelector('input', { timeout: 10000 });
        await page.type('input', gameId, { delay: 100 });
        await page.keyboard.press('Enter');

        await new Promise(r => setTimeout(r, 3000)); 

        await page.waitForSelector('input', { timeout: 10000 });
        await page.type('input', name, { delay: 100 });
        await page.keyboard.press('Enter');

        console.log(`[+] ${name} joined!`);
        await new Promise(r => setTimeout(r, 60000)); 
    } catch (e) {
        console.log(`[!] ${name} failed: ${e.message}`);
    } finally {
        await browser.close();
    }
}

// These lines read from the Railway "Variables" tab
const GAME_ID = process.env.GAME_ID || "000000";
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 1;
const BASE_NAME = process.env.BOT_NAME || "CloudBot";

console.log(`[System] Flooding Game ${GAME_ID} with ${BOT_COUNT} bots...`);

async function start() {
    for (let i = 1; i <= BOT_COUNT; i++) {
        runBot(GAME_ID, `${BASE_NAME}_${i}`);
        // Wait 2 seconds between bots so Blooket doesn't block the IP
        await new Promise(r => setTimeout(r, 2000)); 
    }
}

start();
