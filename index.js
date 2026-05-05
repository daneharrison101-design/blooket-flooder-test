// Use 'puppeteer-extra' instead of standard puppeteer
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function runBot(gameId, name) {
    console.log(`[System] Starting Stealth Bot for ID: ${gameId}...`);
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        // Navigate with a slightly longer timeout for Cloudflare to process
        await page.goto('https://play.blooket.com/play', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });

        // Check if we passed the wall
        const title = await page.title();
        console.log(`[Bot] Page Title: ${title}`);

        if (title.includes("Just a moment")) {
            console.log("!!! STILL BLOCKED: Trying a 10-second 'Human Wait'...");
            await new Promise(r => setTimeout(r, 10000));
        }

        // Standard Join Logic
        await page.waitForSelector('input', { timeout: 15000 });
        await page.type('input', gameId, { delay: 150 });
        await page.keyboard.press('Enter');

        await new Promise(r => setTimeout(r, 3000)); 

        await page.type('input', name, { delay: 150 });
        await page.keyboard.press('Enter');

        console.log(`[Bot ${name}] Join request sent! Check lobby.`);
        await new Promise(r => setTimeout(r, 60000)); 

    } catch (e) {
        console.log(`[Error] ${e.message}`);
    } finally {
        await browser.close();
    }
}

runBot("996247", "StealthTester_1");
