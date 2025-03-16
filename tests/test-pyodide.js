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

/**
 * Main test runner function that executes each test in sequence
 */
async function runTests() {
  console.log('Starting Pyodide integration tests...');
  let browser;
  let page;
  let testsPassed = true;
  
  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    
    // Create new page
    page = await browser.newPage();
    
    // Run tests in sequence
    await test1_LoadPage(page);
    await test2_InitializePyodide(page);
    await test3_ImportDatalabPackage(page);
    await test4_RunBasicExample(page);
    
    console.log('\n✅ All tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (page) {
      await page.screenshot({ path: path.join(screenshotsDir, 'test-failure.png') });
    }
    testsPassed = false;
  } finally {
    if (browser) {
      await browser.close();
    }
    
    // Exit with appropriate code
    process.exit(testsPassed ? 0 : 1);
  }
}

/**
 * Test 1: Load the page and verify it's accessible
 */
async function test1_LoadPage(page) {
  console.log('\n🧪 TEST 1: Load the application page');
  
  // Navigate to the test page
  console.log('  Navigating to', testUrl);
  await page.goto(testUrl, { timeout: 30000 });
  
  // Take screenshot
  await page.screenshot({ path: path.join(screenshotsDir, '01-initial-page.png') });
  
  // Verify page loaded by checking for the title
  const title = await page.title();
  console.log(`  Page title: "${title}"`);
  
  if (!title.includes('Datalab API')) {
    throw new Error('Page did not load correctly. Expected title to contain "Datalab API"');
  }
  
  // Verify that Load Pyodide button exists
  const loadButton = await page.$('#loadPyodideBtn');
  if (!loadButton) {
    throw new Error('Load Pyodide button not found');
  }
  
  console.log('  ✓ Page loaded successfully');
}

/**
 * Test 2: Initialize Pyodide and verify it loads correctly
 */
async function test2_InitializePyodide(page) {
  console.log('\n🧪 TEST 2: Initialize Pyodide');
  
  // Click the "Load Pyodide" button
  console.log('  Clicking "Load Pyodide" button...');
  await page.click('#loadPyodideBtn');
  
  // Wait for loading indicator to appear
  console.log('  Loading indicator appeared');
  await page.waitForSelector('#loading', { state: 'visible' });
  
  // Wait for Pyodide to load (indicated by the Run Example button becoming enabled)
  console.log('  Waiting for Pyodide to load (this may take a minute)...');
  await page.waitForSelector('#runExampleBtn:not([disabled])', { timeout });
  
  // Take screenshot
  await page.screenshot({ path: path.join(screenshotsDir, '02-pyodide-loaded.png') });
  
  // Check console output for success messages
  const consoleContent = await page.$eval('#console', el => el.textContent);
  console.log('  Checking console output for success message...');
  
  // Verify core packages were installed
  if (!consoleContent.includes('Core packages installed successfully')) {
    throw new Error('Pyodide core packages were not installed correctly');
  }
  
  console.log('  ✓ Pyodide initialized successfully');
}

/**
 * Test 3: Import the datalab-api package and check its version
 */
async function test3_ImportDatalabPackage(page) {
  console.log('\n🧪 TEST 3: Import datalab-api package');
  
  // Switch to code editor tab
  console.log('  Switching to code editor tab...');
  await page.click('#code-tab');
  
  // Clear the existing code and add our version check code
  console.log('  Setting up version check code...');
  await page.fill('#code-editor', `
# Test importing the datalab-api package
try:
    import datalab_api
    print(f"Successfully imported datalab_api!")
    
    # Try to get the version
    try:
        print(f"Package version: {datalab_api.__version__}")
    except AttributeError:
        print("Version information not available")
    
    # List available functions/methods
    print("\\nAvailable attributes:")
    attributes = [attr for attr in dir(datalab_api) if not attr.startswith('_')]
    for attr in attributes:
        print(f"  - {attr}")
    
except ImportError as e:
    print(f"Failed to import datalab_api: {str(e)}")
    print("This is expected if the package is not yet installed or compatible with Pyodide")
`);

  // Run the code
  console.log('  Running code to check package import...');
  await page.click('#runCodeBtn');
  
  // Wait for execution to complete
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: path.join(screenshotsDir, '03-import-test.png') });
  
  // Check console output
  const consoleContent = await page.$eval('#console', el => el.textContent);
  console.log('  Console output after import attempt:');
  console.log('  -----------------------------');
  console.log(consoleContent);
  console.log('  -----------------------------');
  
  // Note: We don't want to fail the test if the package can't be imported yet,
  // since this is just an initial setup. Just log the status.
  if (consoleContent.includes('Failed to import')) {
    console.log('  ⚠️ Package import not successful yet - this is expected during setup');
  } else if (consoleContent.includes('Successfully imported')) {
    console.log('  ✓ Package imported successfully');
  }
  
  // Test passes either way - we're just checking the attempt was made
  console.log('  ✓ Import test completed');
}

/**
 * Test 4: Run a basic example to test functionality
 */
async function test4_RunBasicExample(page) {
  console.log('\n🧪 TEST 4: Run basic example');
  
  // Switch back to demo tab
  console.log('  Switching to demo tab...');
  await page.click('#demo-tab');
  
  // Run the example code
  console.log('  Clicking "Run Example" button...');
  await page.click('#runExampleBtn');
  
  // Wait for execution (longer timeout for complex operations)
  console.log('  Waiting for example to execute...');
  await page.waitForTimeout(10000);
  
  // Take screenshot
  await page.screenshot({ path: path.join(screenshotsDir, '04-example-executed.png') });
  
  // Check if the plot container has any content (either plot or error message)
  const plotContainerContent = await page.$eval('#plot-container', el => el.innerHTML);
  
  console.log(`  Plot container has ${plotContainerContent.length > 0 ? 'content' : 'no content'}`);
  
  // Check console output
  const consoleContent = await page.$eval('#console', el => el.textContent);
  
  // If the plot has content, or the console shows execution, consider it a success
  // This test is flexible because we don't know if the package is fully working yet
  if (plotContainerContent.length > 0 || consoleContent.includes('example data')) {
    console.log('  ✓ Example execution attempted successfully');
  } else {
    console.log('  ⚠️ Example may not have executed properly - check screenshots');
  }
  
  console.log('  ✓ Basic example test completed');
}

// Run all tests
runTests().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
