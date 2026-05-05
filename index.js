const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function runBot(gameId, name) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process' // Uses significantly less memory
        ]
    });
    const page = await browser.newPage();

    // BLOCK IMAGES & CSS: This is the secret to running many bots on a small server
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    try {
        console.log(`[Bot ${name}] Launching...`);
        await page.goto('https://play.blooket.com/play', { waitUntil: 'networkidle0' });

        await page.waitForSelector('input');
        await page.type('input', gameId, { delay: 50 });
        await page.keyboard.press('Enter');

        await new Promise(r => setTimeout(r, 4000)); 

        await page.waitForSelector('input');
        await page.type('input', name, { delay: 50 });
        await page.keyboard.press('Enter');

        console.log(`[+] ${name} is in the lobby.`);
        
        // Keep this bot alive for 15 minutes
        await new Promise(r => setTimeout(r, 900000)); 
    } catch (e) {
        console.log(`[!] ${name} Error: ${e.message}`);
    } 
    // We don't close the browser here anymore; we keep it open!
}

const GAME_ID = process.env.GAME_ID || "000000";
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 1;
const BASE_NAME = process.env.BOT_NAME || "oli";

async function start() {
    console.log(`[System] Starting Ultra-Light Flood...`);
    for (let i = 1; i <= BOT_COUNT; i++) {
        // We use "runBot" but don't "await" it so they can all run at the same time
        runBot(GAME_ID, `${BASE_NAME}_${i}`);
        
        // Wait 12 seconds before starting the next one to let the server recover
        console.log(`[System] Slot ${i} filled. Cooling down...`);
        await new Promise(r => setTimeout(r, 12000)); 
    }
}

start();
