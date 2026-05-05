const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

async function runBot(gameId, name, index) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });
    const page = await browser.newPage();
    
    // Pick a random identity for this bot
    await page.setUserAgent(userAgents[index % userAgents.length]);

    try {
        await page.goto('https://play.blooket.com/play', { waitUntil: 'networkidle2' });

        await page.waitForSelector('input');
        // Random typing speed (between 100ms and 300ms)
        await page.type('input', gameId, { delay: Math.floor(Math.random() * 200) + 100 });
        await page.keyboard.press('Enter');

        await new Promise(r => setTimeout(r, 6000)); 

        await page.waitForSelector('input');
        await page.type('input', name, { delay: Math.floor(Math.random() * 200) + 100 });
        await page.keyboard.press('Enter');

        console.log(`[+] ${name} reported joined.`);
        await new Promise(r => setTimeout(r, 900000)); 
    } catch (e) {
        console.log(`[!] ${name} error.`);
    }
}

const GAME_ID = process.env.GAME_ID || "000000";
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 1;
const BASE_NAME = process.env.BOT_NAME || "oli";

async function start() {
    for (let i = 1; i <= BOT_COUNT; i++) {
        runBot(GAME_ID, `${BASE_NAME}_${i}`, i);
        // Wait a random time between 30 and 45 seconds
        const waitTime = Math.floor(Math.random() * 15000) + 30000;
        console.log(`[System] Bot ${i} deployed. Waiting ${waitTime/1000}s...`);
        await new Promise(r => setTimeout(r, waitTime)); 
    }
}
start();
