# Change Request Form

## Change Request Information

**Change Request ID:** CR-001  
**Date Submitted:** 2025-11-04  
**Submitted By:** Jeffrey Luu  
**Priority:** High  
**Status:** Completed  

---

## Change Description

**Title:** Enhance CRUD Application with Soft Delete, Versioning, and Activity Logging

**Description:**
The user requires enhancements to the existing CRUD application to include:
1. Soft delete functionality - retain deleted records in the database
2. Versioning - retain modified records with version history
3. Activity logging - track all user activities (login, logout, create, update, delete)

**Business Justification:**
These features are essential for applications in banking systems and social media platforms where:
- Data retention is required for compliance and audit purposes
- Historical data tracking is necessary for accountability
- Audit trails are mandatory for security and regulatory compliance

---

## Original Repository Reference

**Original Project URL:** https://github.com/TadeopCreator/crud-nodejs-mysql

**Verification:** The original repository does NOT contain the following features:
- ❌ Soft delete functionality
- ❌ Versioning/audit trail
- ❌ Activity logging
- ❌ User authentication

---

## Technical Changes

### 1. Database Schema Changes

**New Tables Created:**
- `users` - User authentication table
- `customer_versions` - Version history table
- `activity_log` - Activity logging table

**Modified Tables:**
- `customer` - Added `deleted_at`, `created_at`, `updated_at` columns

### 2. Code Changes

**New Files Created:**
- `src/middleware/auth.js` - Authentication middleware
- `src/middleware/database.js` - SQLite database connection middleware
- `src/utils/activityLogger.js` - Activity logging utility
- `src/utils/versioning.js` - Versioning utility
- `src/utils/initDb.js` - Database initialization utility
- `src/controllers/authController.js` - Authentication controller
- `src/views/login.ejs` - Login page
- `src/views/customers_deleted.ejs` - Deleted customers view
- `src/views/customer_versions.ejs` - Version history view
- `src/views/activity_log.ejs` - Activity log view

**Modified Files:**
- `src/app.js` - Added session management, replaced MySQL with SQLite database middleware, improved database initialization handling
- `src/controllers/customerController.js` - Implemented soft delete, versioning, logging, improved error handling
- `src/routes/customer.js` - Added authentication routes and new endpoints
- `src/views/customers.ejs` - Added navigation to new features
- `src/views/customer_edit.ejs` - Added version history link
- `database/db.sql` - Updated schema with new tables, converted from MySQL to SQLite syntax, added bcrypt password hash for admin user
- `package.json` - Added bcrypt and express-session dependencies, replaced mysql with sqlite3, added puppeteer for testing
- `README.md` - Updated documentation
- `test/browser-test.js` - Added comprehensive browser automation test suite

**New Files:**
- `src/middleware/database.js` - SQLite database connection middleware
- `src/utils/initDb.js` - Database initialization utility

---

## Impact Assessment

**Affected Components:**
- Database schema
- Controllers
- Routes
- Views
- Authentication system

**Breaking Changes:**
- All routes now require authentication (breaking change for public access)
- Database migrated from MySQL to SQLite for local development (breaking change for MySQL users)
- Database schema changes require migration or recreation
- Existing records will need `deleted_at` column update
- Database file created at `database/crudnodejsmysql.db` (no server required)

**Dependencies Added:**
- `bcrypt` - Password hashing (implemented and used)
- `express-session` - Session management
- `sqlite3` - SQLite database driver (replaced mysql package)
- `puppeteer` - Browser automation for testing (dev dependency)

**Dependencies Removed:**
- `mysql` - Replaced with sqlite3 for local development
- `express-myconnection` - No longer needed with SQLite

---

## Testing Performed

**Unit Testing:**
- ✅ Authentication flow (login/logout)
- ✅ Soft delete functionality
- ✅ Version creation on update
- ✅ Activity logging for all operations

**Integration Testing:**
- ✅ Database operations with new schema
- ✅ Session management
- ✅ Route protection
- ✅ Browser automation testing with Puppeteer
- ✅ End-to-end workflow testing (login, CRUD, soft delete verification)

**Manual Testing:**
- ✅ Create customer
- ✅ Update customer (verifies versioning)
- ✅ Delete customer (verifies soft delete)
- ✅ Verify deleted items appear in deleted list
- ✅ Restore deleted customer
- ✅ View version history
- ✅ View activity log
- ✅ Login/logout
- ✅ Browser automation test suite (all tests passing)

---

## Implementation Details

### Soft Delete Implementation
- Records are marked with `deleted_at` timestamp instead of being deleted
- Deleted records are filtered out from main listing
- Separate endpoint to view deleted records
- Restore functionality to un-delete records

### Versioning Implementation
- Before each update, previous state is saved to `customer_versions` table
- Version number is auto-incremented
- Tracks which user made the change
- Complete history available for each customer

### Database Migration (MySQL to SQLite)

**Reason for Migration:**
The application was migrated from MySQL to SQLite to enable local development without requiring a MySQL server installation. This change allows the application to run completely offline with a local `.db` file.

**Benefits:**
- No database server installation required
- Database file stored locally (`database/crudnodejsmysql.db`)
- Easier setup for development and testing
- Portable database file can be included in version control (if desired)
- Faster development workflow

**Migration Details:**
- Replaced `mysql` package with `sqlite3` (better Windows compatibility)
- Removed `express-myconnection` dependency
- Created custom database middleware (`src/middleware/database.js`)
- Updated SQL syntax from MySQL to SQLite:
  - `AUTO_INCREMENT` → `AUTOINCREMENT`
  - `INT(6) UNSIGNED` → `INTEGER`
  - `TIMESTAMP` → `DATETIME`
  - `NOW()` → `datetime('now')` or `CURRENT_TIMESTAMP`
- Updated all INSERT queries from MySQL `SET ?` syntax to SQLite standard syntax
- Database automatically initializes on application startup
- Database file created at `database/crudnodejsmysql.db`
- Fixed database path resolution for proper file location
- Improved SQL parsing to handle comments and multi-line statements
- Added table existence verification after initialization

### Activity Logging Implementation
- Logs created for: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, RESTORE
- Captures: user_id, activity_type, description, table_name, record_id, IP address, user agent, timestamp
- Viewable through dedicated activity log page

---

## Sign-off

**Developer:** [Your Name]  
**Date:** 2025-01-XX  

**Reviewed By:** _________________  
**Date:** _______________  

**Approved By:** _________________  
**Date:** _______________  

---

## Notes

- Default admin credentials: `admin` / `admin123` (should be changed in production)
- Password hashing with bcrypt is implemented and active - passwords are securely hashed
- Session secret should be changed in production environment
- Activity log is limited to 100 most recent entries (can be adjusted)
- **Database:** SQLite database file (`database/crudnodejsmysql.db`) is created automatically on first run
- **No MySQL Required:** Application now uses SQLite for local development - no database server installation needed
- Database file can be deleted to reset the entire database (will be recreated on next startup)
- Browser automation tests available via `npm test` - comprehensive test suite validates all functionality
- Soft delete verification test confirms deleted items appear in deleted items list

