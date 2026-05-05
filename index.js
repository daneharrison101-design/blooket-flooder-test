const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Pull variables from Railway
const GAME_ID = process.env.GAME_ID || "000000";
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 5;
const BASE_NAME = process.env.BOT_NAME || "aye";

async function start() {
    console.log(`[System] Launching Master Browser for ${BOT_COUNT} bots...`);
    
    // Launch ONE browser instance to save RAM
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ]
    });

    for (let i = 1; i <= BOT_COUNT; i++) {
        const uniqueName = `${BASE_NAME}${Math.floor(Math.random() * 9999)}`;
        
        // Launch a lightweight "Context" (like a private tab) instead of a new browser
        runBotInContext(browser, GAME_ID, uniqueName, i);
        
        // Wait 7 seconds between each to prevent Railway from crashing
        await new Promise(r => setTimeout(r, 7000));
    }
}

async function runBotInContext(browser, gameId, name, index) {
    try {
        // Create an isolated context so Blooket doesn't see them as the same user
        const context = await browser.createBrowserContext();
        const page = await context.newPage();

        // Block everything heavy (Images, CSS, Fonts) to save memory
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'media', 'font', 'stylesheet'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto('https://play.blooket.com/play', { waitUntil: 'domcontentloaded' });

        // Enter ID
        await page.waitForSelector('input');
        await page.type('input', gameId);
        await page.keyboard.press('Enter');

        // Wait for name screen
        await new Promise(r => setTimeout(r, 4000));

        // Enter Name
        await page.waitForSelector('input');
        await page.type('input', name);
        await page.keyboard.press('Enter');

        console.log(`[🚀] Bot ${index} (${name}) is in!`);

        // Stay alive for 20 minutes
        await new Promise(r => setTimeout(r, 1200000));

    } catch (e) {
        console.log(`[!] Bot ${index} failed: ${e.message}`);
    }
}

start();
