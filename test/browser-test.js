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
      console.log(output); // Log all output for debugging
      if (output.includes('Server on port')) {
        console.log('✓ Server started');
        // Wait longer for database initialization
        setTimeout(resolve, 3000); // Wait 3 seconds for database to fully initialize
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
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    // Wait for page to load and table to appear
    await page.waitForSelector('table', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  try {
    // Ensure we're on the main customers page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find update button - look for link with href="/update/" pattern
    const updateButtons = await page.$$('a[href^="/update/"]');
    if (updateButtons.length > 0) {
      // Wait for navigation after clicking update
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        updateButtons[0].click()
      ]);
      
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });
      
      // Update the name - clear first, then type
      await page.click('input[name="name"]', { clickCount: 3 }); // Select all
      await page.type('input[name="name"]', 'Updated Customer');
      
      // Submit form and wait for navigation
      const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      await page.click('button[type="submit"]');
      await navigationPromise.catch(() => {
        // If navigation promise fails, check if we're already on the right page
        return page.waitForSelector('table', { timeout: 2000 }).catch(() => {});
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit more
      
      const content = await page.content();
      if (content.includes('Updated Customer')) {
        console.log('✓ Customer updated successfully');
        return true;
      } else {
        console.log('✗ Customer update failed');
        await page.screenshot({ path: 'test-update-error.png' });
        return false;
      }
    } else {
      console.log('✗ No customers found to update');
      return false;
    }
  } catch (error) {
    console.log('✗ Update customer failed:', error.message);
    await page.screenshot({ path: 'test-update-error.png' });
    return false;
  }
}

async function testDeleteCustomer() {
  console.log('\n[TEST] Testing soft delete...');
  try {
    // Ensure we're on the main customers page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and click delete button for first customer
    const deleteButtons = await page.$$('a.btn-danger');
    if (deleteButtons.length > 0) {
      // Get the customer name before deleting for verification
      const customerName = await page.evaluate(() => {
        const firstRow = document.querySelector('table tbody tr');
        if (firstRow) {
          const nameCell = firstRow.querySelector('td:nth-child(2)');
          return nameCell ? nameCell.textContent.trim() : null;
        }
        return null;
      });
      
      if (!customerName) {
        console.log('✗ Could not find customer name');
        return false;
      }
      
      // Handle confirm dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        deleteButtons[0].click()
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the customer is no longer in the active list
      const activeContent = await page.content();
      if (activeContent.includes(customerName)) {
        console.log('✗ Customer still appears in active list after deletion');
        return false;
      }
      
      console.log('✓ Customer soft deleted successfully');
      return { success: true, customerName };
    } else {
      console.log('✗ No customers found to delete');
      return false;
    }
  } catch (error) {
    console.log('✗ Delete customer failed:', error.message);
    await page.screenshot({ path: 'test-delete-error.png' });
    return false;
  }
}

async function testViewDeletedCustomers() {
  console.log('\n[TEST] Testing view deleted customers...');
  try {
    // Navigate back to main page first to find the link
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('a[href="/deleted"]', { timeout: 5000 });
    const deletedLink = await page.$('a[href="/deleted"]');
    if (deletedLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        deletedLink.click()
      ]);
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
  } catch (error) {
    console.log('✗ View deleted customers failed:', error.message);
    await page.screenshot({ path: 'test-deleted-error.png' });
    return false;
  }
}

async function testVerifyDeletedItemAppears() {
  console.log('\n[TEST] Verifying deleted item appears in deleted items list...');
  try {
    // Navigate to deleted customers page
    await page.goto(`${BASE_URL}/deleted`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Check if "Updated Customer" or "Test Customer" appears in the deleted list
    const content = await page.content();
    const pageText = await page.evaluate(() => document.body.textContent);
    
    // More specific check - look for the customer name in the table body
    const hasDeletedCustomer = await page.evaluate(() => {
      const tableRows = Array.from(document.querySelectorAll('table tbody tr'));
      const rowTexts = tableRows.map(row => row.textContent);
      return rowTexts.some(text => 
        text.includes('Updated Customer') || 
        text.includes('Test Customer')
      );
    });
    
    if (hasDeletedCustomer) {
      console.log('✓ Deleted customer appears in deleted items list');
      return true;
    } else {
      console.log('✗ Deleted customer not found in deleted items list');
      console.log('Page content preview:', pageText.substring(0, 500));
      await page.screenshot({ path: 'test-deleted-verification-error.png' });
      return false;
    }
  } catch (error) {
    console.log('✗ Verify deleted item failed:', error.message);
    await page.screenshot({ path: 'test-deleted-verification-error.png' });
    return false;
  }
}

async function testViewActivityLog() {
  console.log('\n[TEST] Testing view activity log...');
  try {
    await page.waitForSelector('a[href="/activity-log"]', { timeout: 5000 });
    const activityLink = await page.$('a[href="/activity-log"]');
    if (activityLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        activityLink.click()
      ]);
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
  } catch (error) {
    console.log('✗ View activity log failed:', error.message);
    await page.screenshot({ path: 'test-activity-error.png' });
    return false;
  }
}

async function testLogout() {
  console.log('\n[TEST] Testing logout...');
  try {
    await page.waitForSelector('a[href="/logout"]', { timeout: 5000 });
    const logoutLink = await page.$('a[href="/logout"]');
    if (logoutLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        logoutLink.click()
      ]);
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
  } catch (error) {
    console.log('✗ Logout failed:', error.message);
    await page.screenshot({ path: 'test-logout-error.png' });
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
    const deleteResult = result;
    results.tests.push({ name: 'Delete Customer', passed: deleteResult && (deleteResult.success || deleteResult === true), skipped: false });
    if (deleteResult && (deleteResult.success || deleteResult === true)) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Verify deleted item appears in deleted items list
    result = await testVerifyDeletedItemAppears();
    results.tests.push({ name: 'Verify Deleted Item Appears', passed: result, skipped: false });
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

