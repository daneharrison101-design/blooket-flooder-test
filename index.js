const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const GAME_ID = process.env.GAME_ID;
const BOT_COUNT = parseInt(process.env.BOT_COUNT);
const BASE_NAME = process.env.BOT_NAME;

async function runBot(id, name, index) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--window-size=1280,720' // Real window size
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Set a realistic browser identity
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Only block Images and Media (Keep CSS so the page "looks" real)
        await page.setRequestInterception(true);
        page.on('request', r => ['image', 'media', 'font'].includes(r.resourceType()) ? r.abort() : r.continue());

        await page.goto('https://play.blooket.com/play', { waitUntil: 'networkidle2' });
        
        // Type ID slowly like a human
        await page.waitForSelector('input');
        await page.type('input', id, { delay: 150 }); 
        await page.keyboard.press('Enter');
        
        // Wait for the transition animation (Crucial for Blooket)
        await new Promise(r => setTimeout(r, 5000)); 
        
        // Type Name slowly
        await page.waitForSelector('input');
        await page.type('input', name + Math.floor(Math.random() * 9999), { delay: 150 });
        await page.keyboard.press('Enter');
        
        console.log(`[🚀] ${name} successfully bypassed and joined!`);
        
        // Keep the browser alive
        await new Promise(r => setTimeout(r, 900000)); 
    } catch (e) {
        console.log(`[!] Bot ${index} kicked by anti-cheat.`);
        await browser.close();
    }
}

async function start() {
    for (let i = 1; i <= BOT_COUNT; i++) {
        runBot(GAME_ID, BASE_NAME, i);
        // Wait 4 seconds between bots so they don't look like a "flood"
        await new Promise(r => setTimeout(r, 4000)); 
    }
}
start();
