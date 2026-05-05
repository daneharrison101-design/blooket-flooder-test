const puppeteer = require('puppeteer');

async function runBot(gameId, name) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for Railway
    });
    const page = await browser.newPage();

    try {
        console.log(`[Bot ${name}] Launching...`);
        await page.goto('https://play.blooket.com/play');

        // These steps mimic a human clicking
        await page.waitForSelector('input');
        await page.type('input', gameId);
        await page.keyboard.press('Enter');

        await page.waitForTimeout(2000); // Wait for name screen
        await page.type('input', name);
        await page.keyboard.press('Enter');

        console.log(`[Bot ${name}] Successfully joined lobby!`);
        
        // Keep browser open for 30 seconds to stay in lobby
        await new Promise(r => setTimeout(r, 30000)); 
    } catch (e) {
        console.log(`[Bot ${name}] Error: ${e.message}`);
    } finally {
        await browser.close();
    }
}

// For this test, we just run one bot
runBot("937657", "CloudTester_1");
