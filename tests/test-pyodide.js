const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test configuration
const testUrl = 'http://localhost:8080';
const timeout = 120000; // 2 minutes - Pyodide can take a while to load

// Test function
async function testPyodideIntegration() {
  console.log('Starting Pyodide integration test...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the test page
    console.log(`Navigating to ${testUrl}...`);
    await page.goto(testUrl, { timeout });
    await page.screenshot({ path: path.join(screenshotsDir, '01-initial-page.png') });
    
    // Click the "Load Pyodide" button
    console.log('Clicking "Load Pyodide" button...');
    await page.click('#loadPyodideBtn');
    
    // Wait for Pyodide to load (this can take a while)
    console.log('Waiting for Pyodide to load...');
    await page.waitForSelector('#runExampleBtn:not([disabled])', { timeout });
    await page.screenshot({ path: path.join(screenshotsDir, '02-pyodide-loaded.png') });
    
    // Check console output for success messages
    const consoleContent = await page.$eval('#console', el => el.textContent);
    if (!consoleContent.includes('Core packages installed successfully')) {
      throw new Error('Pyodide packages were not installed correctly');
    }
    
    // Run the example code
    console.log('Running example code...');
    await page.click('#runExampleBtn');
    
    // Wait for the plot to be displayed
    console.log('Waiting for plot to render...');
    await page.waitForSelector('#plot-container img', { timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03-plot-rendered.png') });
    
    // Check if the plot was rendered
    const plotExists = await page.$('#plot-container img');
    if (!plotExists) {
      throw new Error('Plot was not rendered');
    }
    
    // Check for execution success message
    const finalConsoleContent = await page.$eval('#console', el => el.textContent);
    if (!finalConsoleContent.includes('Visualization complete')) {
      throw new Error('Example code did not complete successfully');
    }
    
    console.log('Pyodide integration test completed successfully!');
    process.exit(0); // Success
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png') });
    process.exit(1); // Failure
  } finally {
    await browser.close();
  }
}

// Run the test
testPyodideIntegration().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
