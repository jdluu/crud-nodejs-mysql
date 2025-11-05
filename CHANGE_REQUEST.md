# Change Request Form

## Change Request Information

**Change Request ID:** CR-001  
**Date Submitted:** 2025-01-XX  
**Submitted By:** [Your Name]  
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
- `src/utils/activityLogger.js` - Activity logging utility
- `src/utils/versioning.js` - Versioning utility
- `src/controllers/authController.js` - Authentication controller
- `src/views/login.ejs` - Login page
- `src/views/customers_deleted.ejs` - Deleted customers view
- `src/views/customer_versions.ejs` - Version history view
- `src/views/activity_log.ejs` - Activity log view

**Modified Files:**
- `src/app.js` - Added session management
- `src/controllers/customerController.js` - Implemented soft delete, versioning, logging
- `src/routes/customer.js` - Added authentication routes and new endpoints
- `src/views/customers.ejs` - Added navigation to new features
- `src/views/customer_edit.ejs` - Added version history link
- `database/db.sql` - Updated schema with new tables
- `package.json` - Added bcrypt and express-session dependencies
- `README.md` - Updated documentation

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
- Database schema changes require migration
- Existing records will need `deleted_at` column update

**Dependencies Added:**
- `bcrypt` - Password hashing (noted but plain text used for development)
- `express-session` - Session management

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

**Manual Testing:**
- ✅ Create customer
- ✅ Update customer (verifies versioning)
- ✅ Delete customer (verifies soft delete)
- ✅ Restore deleted customer
- ✅ View version history
- ✅ View activity log
- ✅ Login/logout

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
- Password hashing with bcrypt is implemented but not used in development version
- Session secret should be changed in production environment
- Activity log is limited to 100 most recent entries (can be adjusted)

