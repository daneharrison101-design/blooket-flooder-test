const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// --- CONFIGURATION ---
const GAME_ID = "814683"; // Put your ID here
const BOT_COUNT = 15;      // Codespaces can easily handle 15-20
const BASE_NAME = "oliver";   // Your bot prefix
// ---------------------

async function runBot(gameId, name, index) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    try {
        const page = await browser.newPage();
        
        // We don't need to block CSS here because Codespaces is powerful
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'media', 'font'].includes(req.resourceType())) req.abort();
            else req.continue();
        });

        await page.goto('https://play.blooket.com/play', { waitUntil: 'networkidle2' });

        await page.waitForSelector('input');
        await page.type('input', gameId, { delay: 50 });
        await page.keyboard.press('Enter');

        await new Promise(r => setTimeout(r, 3000)); 

        await page.waitForSelector('input');
        await page.type('input', name, { delay: 50 });
        await page.keyboard.press('Enter');

        console.log(`[🚀] Bot ${index} (${name}) joined the lobby!`);

        // Keep connection open for 20 mins
        await new Promise(r => setTimeout(r, 1200000)); 

    } catch (e) {
        console.log(`[!] Bot ${index} failed: ${e.message}`);
        await browser.close();
    }
}

async function start() {
    console.log(`[System] Codespace Flooder Active. Target: ${GAME_ID}`);
    for (let i = 1; i <= BOT_COUNT; i++) {
        const uniqueName = `${BASE_NAME}${Math.floor(Math.random() * 9999)}`;
        runBot(GAME_ID, uniqueName, i);
        
        // 3-second delay is perfect for Codespaces
        await new Promise(r => setTimeout(r, 3000)); 
    }
}

start();
