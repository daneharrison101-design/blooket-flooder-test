const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function runBot(gameId, name) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--window-size=1920,1080'
        ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        await page.goto('https://play.blooket.com/play', { waitUntil: 'networkidle2' });

        // Wait for ID input and click it first
        await page.waitForSelector('input');
        await page.click('input');
        await page.type('input', gameId, { delay: 150 });
        await page.keyboard.press('Enter');

        // WAIT LONGER: 5 seconds for the name screen to fully slide in
        await new Promise(r => setTimeout(r, 5000)); 

        // Type Name
        await page.waitForSelector('input');
        await page.click('input');
        await page.type('input', name, { delay: 150 });
        await page.keyboard.press('Enter');

        // Success check
        console.log(`[+] ${name} sent join request to ${gameId}`);
        
        // Hold the connection open for 10 minutes so they stay in the lobby
        await new Promise(r => setTimeout(r, 600000)); 
    } catch (e) {
        console.log(`[!] ${name} Error: ${e.message}`);
    } finally {
        await browser.close();
    }
}

const GAME_ID = process.env.GAME_ID || "000000";
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 1;
const BASE_NAME = process.env.BOT_NAME || "oli";

async function start() {
    for (let i = 1; i <= BOT_COUNT; i++) {
        runBot(GAME_ID, `${BASE_NAME}_${i}`);
        // Increase delay between bots to 4 seconds to avoid IP bans
        await new Promise(r => setTimeout(r, 4000)); 
    }
}
start();
