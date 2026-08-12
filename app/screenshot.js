import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set desktop viewport
  await page.setViewport({ width: 1440, height: 900 });
  
  // Navigate to local Vite dev server
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Wait a moment for WebGL scene and animations to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Capture Hero section
  await page.screenshot({ 
    path: 'C:\\Users\\Samuel\\.gemini\\antigravity\\brain\\fb380acd-31f8-4f6a-a94f-6a47a53035ec\\screenshot_hero.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });

  // Scroll down to Input Form section
  await page.evaluate(() => {
    window.scrollTo(0, 900);
  });
  
  // Wait for scroll animation/reveal
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await page.screenshot({ 
    path: 'C:\\Users\\Samuel\\.gemini\\antigravity\\brain\\fb380acd-31f8-4f6a-a94f-6a47a53035ec\\screenshot_inputs.png',
    clip: { x: 0, y: 900, width: 1440, height: 900 }
  });

  await browser.close();
  console.log('Screenshots captured successfully.');
})();
