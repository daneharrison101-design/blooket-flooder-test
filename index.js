const puppeteer = require('puppeteer');

async function runBot(gameId, name) {
    console.log(`[System] Starting bot for Game ID: ${gameId}...`);
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled' // Helps hide that it's a bot
        ]
    });

    const page = await browser.newPage();

    // Trick Blooket into thinking this is a real Windows Chrome browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    try {
        console.log(`[Bot ${name}] Navigating to Blooket...`);
        await page.goto('https://play.blooket.com/play', { waitUntil: 'networkidle2' });

        // Check if we hit a "Verify you are human" wall
        const title = await page.title();
        console.log(`[Bot ${name}] Page Title: ${title}`);

        if (title.includes("Cloudflare") || title.includes("Just a moment")) {
            console.log("!!! BLOCKED: Blooket is showing a reCAPTCHA/Cloudflare screen.");
            return;
        }

        // 1. Enter Game ID
        console.log(`[Bot ${name}] Entering Game ID...`);
        await page.waitForSelector('input');
        await page.type('input', gameId, { delay: 100 }); // Typing slowly like a human
        await page.keyboard.press('Enter');

        // 2. Wait for the name input screen to appear
        await new Promise(r => setTimeout(r, 3000)); 

        // 3. Enter Nickname
        console.log(`[Bot ${name}] Entering Nickname...`);
        // We look for the input again on the second screen
        await page.waitForSelector('input');
        await page.type('input', name, { delay: 100 });
        await page.keyboard.press('Enter');

        console.log(`[Bot ${name}] Successfully sent Join Request!`);
        console.log(`[Bot ${name}] Final URL: ${page.url()}`);

        // Keep the bot "alive" in the lobby for 5 minutes
        await new Promise(r => setTimeout(r, 300000)); 

    } catch (e) {
        console.log(`[Bot ${name}] Error: ${e.message}`);
    } finally {
        await browser.close();
        console.log(`[Bot ${name}] Process finished.`);
    }
}

// UPDATE THIS WITH YOUR LIVE LOBBY ID
const LOBBY_ID = "198261"; 
runBot(LOBBY_ID, "CloudTester_1");
