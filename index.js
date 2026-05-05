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
            '--no-zygote',
            '--single-process' 
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Block only the heaviest items to save RAM and speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'media', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Use 'domcontentloaded' to start typing before the music/heavy scripts load
        await page.goto('https://play.blooket.com/play', { waitUntil: 'domcontentloaded' });

        // Enter Game ID
        await page.waitForSelector('input');
        await page.type('input', gameId, { delay: 50 });
        await page.keyboard.press('Enter');

        // Human-like pause to let the name input appear
        await new Promise(r => setTimeout(r, 4000)); 

        // Enter Random Name
        await page.waitForSelector('input');
        await page.type('input', name, { delay: 50 });
        await page.keyboard.press('Enter');

        console.log(`[🚀] ${name} joined successfully!`);
        
        // Keep the bot alive in the lobby for 15 minutes
        await new Promise(r => setTimeout(r, 900000)); 
    } catch (e) {
        console.log(`[!] ${name} Error: ${e.message}`);
    } finally {
        await browser.close();
    }
}

// Variables pulled from Railway Dashboard
const GAME_ID = process.env.GAME_ID || "000000";
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 1;
const BASE_NAME = process.env.BOT_NAME || "Student";

async function start() {
    console.log(`[System] Initializing Flood for Game: ${GAME_ID}`);
    for (let i = 1; i <= BOT_COUNT; i++) {
        // Generates names like Student842, Student109, etc.
        const uniqueName = `${BASE_NAME}${Math.floor(Math.random() * 9999)}`;
        
        runBot(GAME_ID, uniqueName);
        
        // 5-second gap: The "Sweet Spot" to avoid Blooket's IP-based shadow ban
        console.log(`[System] Bot ${i} deploying...`);
        await new Promise(r => setTimeout(r, 5000)); 
    }
}

start();
