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
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process' // Crucial for speed on small servers
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Speed Hack 1: Block all images, css, and fonts
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Speed Hack 2: Lower the timeout and wait for nothing
        await page.goto('https://play.blooket.com/play', { waitUntil: 'domcontentloaded' });

        await page.waitForSelector('input');
        // Type instantly (0 delay)
        await page.type('input', gameId);
        await page.keyboard.press('Enter');

        // Shortest possible wait for name screen
        await new Promise(r => setTimeout(r, 2500)); 

        await page.waitForSelector('input');
        await page.type('input', name);
        await page.keyboard.press('Enter');

        console.log(`[🚀] ${name} BLASTED in.`);
        
        // Keep open for 15 mins
        await new Promise(r => setTimeout(r, 900000)); 
    } catch (e) {
        // Silently fail to keep the logs clean
    }
}

const GAME_ID = process.env.GAME_ID || "000000";
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 5;
const BASE_NAME = process.env.BOT_NAME || "oli";

async function start() {
    console.log(`[System] Initializing High-Speed Launch for ${BOT_COUNT} bots...`);
    
    // Speed Hack 3: Launch ALL bots at once with a tiny staggered delay
    for (let i = 1; i <= BOT_COUNT; i++) {
        const uniqueName = `${BASE_NAME}${Math.floor(Math.random() * 9999)}`;
        runBot(GAME_ID, uniqueName);
        
        // Only wait 1 second between starts instead of 60
        await new Promise(r => setTimeout(r, 1000)); 
    }
}

start();
