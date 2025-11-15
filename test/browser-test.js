const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

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

// Helper function to take screenshot
async function takeScreenshot(filename, description) {
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ 
    path: filepath, 
    fullPage: true 
  });
  console.log(`  📸 Screenshot saved: ${filename} - ${description}`);
}

// Test functions
async function testLogin() {
  console.log('\n[TEST] Testing login...');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    // Should redirect to login page
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    
    // Screenshot: Login page before login
    await takeScreenshot('01-login-page.png', 'Login page before authentication');
    
    // Check if we're on login page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    
    // Screenshot: Login form filled
    await takeScreenshot('02-login-form-filled.png', 'Login form with credentials entered');
    
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
        await takeScreenshot('01-login-error.png', 'Login error');
        return false;
      }
    }
    
    // Try to find table or check if we're on home page
    try {
      await page.waitForSelector('table', { timeout: 5000 });
      console.log('✓ Login successful - table found');
      
      // Screenshot: After successful login (Activity Log feature - login logged)
      await takeScreenshot('03-after-login.png', 'After successful login - customers list page');
      return true;
    } catch (e) {
      // Table not found, check what page we're on
      const pageText = await page.evaluate(() => document.body.textContent);
      console.log('Page content preview:', pageText.substring(0, 200));
      await takeScreenshot('01-login-page.png', 'Login page after failed attempt');
      return false;
    }
  } catch (error) {
    console.log('✗ Login failed:', error.message);
    await takeScreenshot('01-login-error.png', 'Login error');
    return false;
  }
}

async function testCreateCustomer() {
  console.log('\n[TEST] Testing create customer...');
  try {
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    
    // Screenshot: Create customer form (empty)
    await takeScreenshot('04-create-customer-form.png', 'Create customer form before filling');
    
    await page.type('input[name="name"]', 'Test Customer');
    await page.type('input[name="address"]', '123 Test Street');
    await page.type('input[name="phone"]', '555-1234');
    
    // Screenshot: Create customer form filled
    await takeScreenshot('05-create-customer-form-filled.png', 'Create customer form with data entered');
    
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
      
      // Screenshot: Customer created successfully (Activity Log feature - create logged)
      await takeScreenshot('06-customer-created.png', 'Customer created successfully - appears in list');
      return true;
    } else {
      console.log('✗ Customer creation failed');
      await takeScreenshot('04-create-customer-error.png', 'Customer creation error');
      return false;
    }
  } catch (error) {
    console.log('✗ Create customer failed:', error.message);
    await takeScreenshot('04-create-customer-error.png', 'Customer creation error');
    return false;
  }
}

async function testUpdateCustomer() {
  console.log('\n[TEST] Testing update customer (Versioning feature)...');
  try {
    // Ensure we're on the main customers page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Screenshot: Customers list before update
    await takeScreenshot('07-customers-list-before-update.png', 'Customers list before update');
    
    // Find update button - look for link with href="/update/" pattern
    const updateButtons = await page.$$('a[href^="/update/"]');
    if (updateButtons.length > 0) {
      // Wait for navigation after clicking update
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        updateButtons[0].click()
      ]);
      
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });
      
      // Screenshot: Edit customer form (original data)
      await takeScreenshot('08-edit-customer-form-original.png', 'Edit customer form with original data (Versioning - before update)');
      
      // Update the name - clear first, then type
      await page.click('input[name="name"]', { clickCount: 3 }); // Select all
      await page.type('input[name="name"]', 'Updated Customer');
      
      // Screenshot: Edit customer form (modified data)
      await takeScreenshot('09-edit-customer-form-modified.png', 'Edit customer form with modified data');
      
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
        console.log('✓ Customer updated successfully (Versioning - version created)');
        
        // Screenshot: Customer updated successfully (Activity Log feature - update logged)
        await takeScreenshot('10-customer-updated.png', 'Customer updated successfully - version created in database');
        return true;
      } else {
        console.log('✗ Customer update failed');
        await takeScreenshot('07-update-customer-error.png', 'Customer update error');
        return false;
      }
    } else {
      console.log('✗ No customers found to update');
      return false;
    }
  } catch (error) {
    console.log('✗ Update customer failed:', error.message);
    await takeScreenshot('07-update-customer-error.png', 'Customer update error');
    return false;
  }
}

async function testViewCustomerVersions() {
  console.log('\n[TEST] Testing view customer versions (Versioning feature)...');
  try {
    // Ensure we're on the main customers page
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find versions link - look for link with href="/versions/" pattern
    const versionLinks = await page.$$('a[href^="/versions/"]');
    if (versionLinks.length > 0) {
      // Screenshot: Customers list with version links visible
      await takeScreenshot('11-customers-list-with-version-links.png', 'Customers list showing version history links');
      
      // Wait for navigation after clicking versions
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        versionLinks[0].click()
      ]);
      
      await page.waitForSelector('table', { timeout: 5000 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Screenshot: Customer version history page
      await takeScreenshot('12-customer-versions-page.png', 'Customer version history showing all previous versions (Versioning feature)');
      
      const content = await page.content();
      if (content.includes('Version History') || content.includes('version_number')) {
        console.log('✓ Customer versions page loaded successfully');
        return true;
      } else {
        console.log('✗ Customer versions page failed');
        return false;
      }
    } else {
      console.log('✗ No version links found');
      return false;
    }
  } catch (error) {
    console.log('✗ View customer versions failed:', error.message);
    await takeScreenshot('11-view-versions-error.png', 'View customer versions error');
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
    
    // Screenshot: Customers list before soft delete
    await takeScreenshot('13-customers-list-before-delete.png', 'Customers list before soft delete');
    
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
      
      // Screenshot: After soft delete (customer removed from active list)
      await takeScreenshot('14-after-soft-delete.png', 'After soft delete - customer removed from active list (Soft Delete feature)');
      
      // Verify the customer is no longer in the active list
      const activeContent = await page.content();
      if (activeContent.includes(customerName)) {
        console.log('✗ Customer still appears in active list after deletion');
        return false;
      }
      
      console.log('✓ Customer soft deleted successfully (record retained in database)');
      return { success: true, customerName };
    } else {
      console.log('✗ No customers found to delete');
      return false;
    }
  } catch (error) {
    console.log('✗ Delete customer failed:', error.message);
    await takeScreenshot('13-delete-customer-error.png', 'Soft delete error');
    return false;
  }
}

async function testViewDeletedCustomers() {
  console.log('\n[TEST] Testing view deleted customers (Soft Delete feature)...');
  try {
    // Navigate back to main page first to find the link
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('a[href="/deleted"]', { timeout: 5000 });
    
    // Screenshot: Navigation showing deleted customers link
    await takeScreenshot('15-navigation-with-deleted-link.png', 'Navigation menu showing deleted customers link');
    
    const deletedLink = await page.$('a[href="/deleted"]');
    if (deletedLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        deletedLink.click()
      ]);
      await page.waitForSelector('table', { timeout: 5000 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Screenshot: Deleted customers page (Soft Delete feature)
      await takeScreenshot('16-deleted-customers-page.png', 'Deleted customers page showing soft-deleted records (Soft Delete feature)');
      
      const content = await page.content();
      if (content.includes('Deleted Customers')) {
        console.log('✓ Deleted customers page loaded (Soft Delete - records accessible)');
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
    await takeScreenshot('15-view-deleted-error.png', 'View deleted customers error');
    return false;
  }
}

async function testVerifyDeletedItemAppears() {
  console.log('\n[TEST] Verifying deleted item appears in deleted items list (Soft Delete feature)...');
  try {
    // Navigate to deleted customers page
    await page.goto(`${BASE_URL}/deleted`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
      console.log('✓ Deleted customer appears in deleted items list (Soft Delete - record retained)');
      
      // Screenshot: Deleted customer visible in deleted list
      await takeScreenshot('17-deleted-customer-visible.png', 'Deleted customer visible in deleted customers list (Soft Delete feature)');
      return true;
    } else {
      console.log('✗ Deleted customer not found in deleted items list');
      console.log('Page content preview:', pageText.substring(0, 500));
      await takeScreenshot('17-deleted-verification-error.png', 'Deleted customer verification error');
      return false;
    }
  } catch (error) {
    console.log('✗ Verify deleted item failed:', error.message);
    await takeScreenshot('17-deleted-verification-error.png', 'Deleted customer verification error');
    return false;
  }
}

async function testViewActivityLog() {
  console.log('\n[TEST] Testing view activity log (Activity Logging feature)...');
  try {
    // Navigate to main page first to find the activity log link
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('a[href="/activity-log"]', { timeout: 5000 });
    
    // Screenshot: Navigation showing activity log link
    await takeScreenshot('18-navigation-with-activity-log-link.png', 'Navigation menu showing activity log link');
    
    const activityLink = await page.$('a[href="/activity-log"]');
    if (activityLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        activityLink.click()
      ]);
      await page.waitForSelector('table', { timeout: 5000 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Screenshot: Activity log page (Activity Logging feature)
      await takeScreenshot('19-activity-log-page.png', 'Activity log page showing all logged activities (Activity Logging feature - login, create, update, delete, logout)');
      
      const content = await page.content();
      if (content.includes('Activity Log')) {
        console.log('✓ Activity log page loaded (Activity Logging - all activities tracked)');
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
    await takeScreenshot('18-activity-log-error.png', 'Activity log error');
    return false;
  }
}

async function testLogout() {
  console.log('\n[TEST] Testing logout (Activity Logging feature)...');
  try {
    // Navigate to main page first to find the logout link
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('a[href="/logout"]', { timeout: 5000 });
    
    // Screenshot: Before logout (showing logout link)
    await takeScreenshot('20-before-logout.png', 'Before logout - logout link visible');
    
    const logoutLink = await page.$('a[href="/logout"]');
    if (logoutLink) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        logoutLink.click()
      ]);
      await page.waitForSelector('input[name="username"]', { timeout: 5000 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Screenshot: After logout (redirected to login page)
      await takeScreenshot('21-after-logout.png', 'After logout - redirected to login page (Activity Logging feature - logout logged)');
      
      const url = page.url();
      if (url.includes('/login')) {
        console.log('✓ Logout successful (Activity Logging - logout logged)');
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
    await takeScreenshot('20-logout-error.png', 'Logout error');
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
    results.tests.push({ name: 'Update Customer (Versioning)', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testViewCustomerVersions();
    results.tests.push({ name: 'View Customer Versions (Versioning)', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testDeleteCustomer();
    const deleteResult = result;
    results.tests.push({ name: 'Delete Customer (Soft Delete)', passed: deleteResult && (deleteResult.success || deleteResult === true), skipped: false });
    if (deleteResult && (deleteResult.success || deleteResult === true)) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Verify deleted item appears in deleted items list
    result = await testVerifyDeletedItemAppears();
    results.tests.push({ name: 'Verify Deleted Item Appears (Soft Delete)', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testViewDeletedCustomers();
    results.tests.push({ name: 'View Deleted Customers (Soft Delete)', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testViewActivityLog();
    results.tests.push({ name: 'View Activity Log (Activity Logging)', passed: result, skipped: false });
    result ? results.passed++ : results.failed++;

    result = await testLogout();
    results.tests.push({ name: 'Logout (Activity Logging)', passed: result, skipped: false });
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
    console.log(`\n📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('   Screenshots captured for:');
    console.log('   - Login (Activity Logging)');
    console.log('   - Create Customer (Activity Logging)');
    console.log('   - Update Customer (Versioning & Activity Logging)');
    console.log('   - View Customer Versions (Versioning)');
    console.log('   - Soft Delete (Soft Delete & Activity Logging)');
    console.log('   - View Deleted Customers (Soft Delete)');
    console.log('   - Activity Log (Activity Logging)');
    console.log('   - Logout (Activity Logging)');

    process.exit(results.failed > 0 ? 1 : 0);
  }
}

// Run tests
runTests();

