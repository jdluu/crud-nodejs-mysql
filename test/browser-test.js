const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess;
let browser;
let page;

// Helper function to check if server is running
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Start the server
async function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting server...');
    serverProcess = spawn('node', ['src/app.js'], {
      stdio: 'pipe',
      env: { ...process.env, PORT: PORT.toString() }
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server on port')) {
        console.log('✓ Server started');
        setTimeout(resolve, 2000); // Wait 2 seconds for server to fully initialize
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    serverProcess.on('error', (error) => {
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 10000);
  });
}

// Setup browser
async function setupBrowser() {
  browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    slowMo: 100 // Slow down operations for visibility
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
}

// Test functions
async function testLogin() {
  console.log('\n[TEST] Testing login...');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    // Should redirect to login page
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    
    // Check if we're on login page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    
    // Wait for navigation after clicking submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check page content
    const content = await page.content();
    const finalUrl = page.url();
    console.log('Final URL after login:', finalUrl);
    
    // Check if we're still on login page (error) or redirected to home
    if (finalUrl.includes('/login')) {
      // Check for error message
      const errorText = await page.$eval('.alert-danger', el => el.textContent).catch(() => null);
      if (errorText) {
        console.log('Login error:', errorText);
        await page.screenshot({ path: 'test-login-error.png' });
        return false;
      }
    }
    
    // Try to find table or check if we're on home page
    try {
      await page.waitForSelector('table', { timeout: 5000 });
      console.log('✓ Login successful - table found');
      return true;
    } catch (e) {
      // Table not found, check what page we're on
      const pageText = await page.evaluate(() => document.body.textContent);
      console.log('Page content preview:', pageText.substring(0, 200));
      await page.screenshot({ path: 'test-login-page.png' });
      return false;
    }
  } catch (error) {
    console.log('✗ Login failed:', error.message);
    await page.screenshot({ path: 'test-login-error.png' });
    return false;
  }
}

async function testCreateCustomer() {
  console.log('\n[TEST] Testing create customer...');
  try {
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    await page.type('input[name="name"]', 'Test Customer');
    await page.type('input[name="address"]', '123 Test Street');
    await page.type('input[name="phone"]', '555-1234');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ]);
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if customer appears in table
    const content = await page.content();
    if (content.includes('Test Customer')) {
      console.log('✓ Customer created successfully');
      return true;
    } else {
      console.log('✗ Customer creation failed');
      await page.screenshot({ path: 'test-create-error.png' });
      return false;
    }
  } catch (error) {
    console.log('✗ Create customer failed:', error.message);
    await page.screenshot({ path: 'test-create-error.png' });
    return false;
  }
}

async function testUpdateCustomer() {
  console.log('\n[TEST] Testing update customer...');
  // Find and click update button for first customer
  const updateButtons = await page.$$('a.btn-info');
  if (updateButtons.length > 0) {
    await updateButtons[0].click();
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    
    // Update the name
    await page.evaluate(() => {
      document.querySelector('input[name="name"]').value = '';
    });
    await page.type('input[name="name"]', 'Updated Customer');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const content = await page.content();
    if (content.includes('Updated Customer')) {
      console.log('✓ Customer updated successfully');
      return true;
    } else {
      console.log('✗ Customer update failed');
      return false;
    }
  } else {
    console.log('✗ No customers found to update');
    return false;
  }
}

async function testDeleteCustomer() {
  console.log('\n[TEST] Testing soft delete...');
  // Find and click delete button for first customer
  const deleteButtons = await page.$$('a.btn-danger');
  if (deleteButtons.length > 0) {
    // Handle confirm dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await deleteButtons[0].click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✓ Customer soft deleted successfully');
    return true;
  } else {
    console.log('✗ No customers found to delete');
    return false;
  }
}

async function testViewDeletedCustomers() {
  console.log('\n[TEST] Testing view deleted customers...');
  const deletedLink = await page.$('a[href="/deleted"]');
  if (deletedLink) {
    await deletedLink.click();
    await page.waitForSelector('table', { timeout: 5000 });
    const content = await page.content();
    if (content.includes('Deleted Customers')) {
      console.log('✓ Deleted customers page loaded');
      return true;
    } else {
      console.log('✗ Deleted customers page failed');
      return false;
    }
  } else {
    console.log('✗ Deleted customers link not found');
    return false;
  }
}

async function testViewActivityLog() {
  console.log('\n[TEST] Testing view activity log...');
  const activityLink = await page.$('a[href="/activity-log"]');
  if (activityLink) {
    await activityLink.click();
    await page.waitForSelector('table', { timeout: 5000 });
    const content = await page.content();
    if (content.includes('Activity Log')) {
      console.log('✓ Activity log page loaded');
      return true;
    } else {
      console.log('✗ Activity log page failed');
      return false;
    }
  } else {
    console.log('✗ Activity log link not found');
    return false;
  }
}

async function testLogout() {
  console.log('\n[TEST] Testing logout...');
  const logoutLink = await page.$('a[href="/logout"]');
  if (logoutLink) {
    await logoutLink.click();
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    const url = page.url();
    if (url.includes('/login')) {
      console.log('✓ Logout successful');
      return true;
    } else {
      console.log('✗ Logout failed');
      return false;
    }
  } else {
    console.log('✗ Logout link not found');
    return false;
  }
}

// Main test runner
async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };

  try {
    // Check if server is already running
    const isRunning = await checkServerRunning();
    if (!isRunning) {
      await startServer();
    } else {
      console.log('✓ Server already running');
    }

    await setupBrowser();

    // Run tests
    let result;
    
    result = await testLogin();
    results.tests.push({ name: 'Login', passed: result, skipped: false });
    if (result === null) {
      results.skipped++;
    } else {
      result ? results.passed++ : results.failed++;
    }
    
    // If login failed due to database error, skip remaining tests
    if (result === false) {
      const pageContent = await page.content();
      if (pageContent.includes('Database error') || pageContent.includes('Database connection error')) {
        console.log('\n⚠️  DATABASE CONNECTION ERROR DETECTED');
        console.log('⚠️  Please ensure:');
        console.log('   1. MySQL server is running');
        console.log('   2. Database "crudnodejsmysql" exists');
        console.log('   3. .env file contains DATABASE_PASSWORD');
        console.log('   4. Database tables are created (run database/db.sql)');
        console.log('\n⚠️  Remaining tests skipped due to database error\n');
        
        // Mark remaining tests as skipped
        const remainingTests = [
          'Create Customer',
          'Update Customer', 
          'Delete Customer',
          'View Deleted Customers',
          'View Activity Log',
          'Logout'
        ];
        
        remainingTests.forEach(testName => {
          results.tests.push({ name: testName, passed: false, skipped: true });
          results.skipped++;
        });
        
        // Cleanup and exit
        if (browser) await browser.close();
        if (serverProcess) serverProcess.kill();
        
        // Print summary
        console.log('='.repeat(50));
        console.log('TEST SUMMARY');
        console.log('='.repeat(50));
        results.tests.forEach(test => {
          if (test.skipped) {
            console.log(`⊘ ${test.name} (SKIPPED - Database not configured)`);
          } else {
            console.log(`${test.passed ? '✓' : '✗'} ${test.name}`);
          }
        });
        console.log('='.repeat(50));
        console.log(`Total: ${results.passed + results.failed + results.skipped} | Passed: ${results.passed} | Failed: ${results.failed} | Skipped: ${results.skipped}`);
        console.log('='.repeat(50));
        console.log('\n⚠️  Set up database and run tests again');
        process.exit(1);
      }
    }

    result = await testCreateCustomer();
    results.tests.push({ name: 'Create Customer', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testUpdateCustomer();
    results.tests.push({ name: 'Update Customer', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testDeleteCustomer();
    results.tests.push({ name: 'Delete Customer', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testViewDeletedCustomers();
    results.tests.push({ name: 'View Deleted Customers', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testViewActivityLog();
    results.tests.push({ name: 'View Activity Log', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testLogout();
    results.tests.push({ name: 'Logout', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

  } catch (error) {
    console.error('\n✗ Test error:', error.message);
    results.failed++;
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    if (serverProcess) {
      serverProcess.kill();
      console.log('\n✓ Server stopped');
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    results.tests.forEach(test => {
      if (test.skipped) {
        console.log(`⊘ ${test.name} (SKIPPED)`);
      } else {
        console.log(`${test.passed ? '✓' : '✗'} ${test.name}`);
      }
    });
    console.log('='.repeat(50));
    console.log(`Total: ${results.passed + results.failed + results.skipped} | Passed: ${results.passed} | Failed: ${results.failed} | Skipped: ${results.skipped}`);
    console.log('='.repeat(50));

    process.exit(results.failed > 0 ? 1 : 0);
  }
}

// Run tests
runTests();

