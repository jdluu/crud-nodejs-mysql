# Maintenance Documentation

## Type of Maintenance

**Maintenance Type:** **Perfective** (Primary) and **Adaptive** (Secondary)

### Classification Details

1. **Perfective Maintenance:**

   * Added soft delete, versioning, and activity logging
   * Enhanced CRUD operations with auditing
   * Improved data retention and compliance features
   * Added authentication system

2. **Adaptive Maintenance:**

   * Updated application to meet new requirements
   * Modified database schema to support new features
   * Ensured compliance with data retention needs

---

## Maintenance Activities Performed

### 1. Requirements Analysis

* Reviewed original codebase
* Identified missing features (soft delete, versioning, logging)
* Confirmed the original repository did not include these features

### 2. Database Design

* Created versioning table
* Created activity log table
* Updated customer table for soft delete
* Added users table for authentication

### 3. Code Implementation

* Implemented authentication (login and logout)
* Added soft delete
* Added versioning
* Added activity logging
* Created authentication middleware
* Updated all controllers and routes

### 4. User Interface Development

* Created login page
* Added views for deleted customers, version history, and activity logs
* Updated existing views with new features

### 5. Testing

* Manual testing of all CRUD operations
* Authentication flow testing
* Soft delete and restore testing
* Version history testing
* Activity logging testing
* Integration testing for database operations
* Browser automation testing with Puppeteer
* End-to-end verification

### 6. Documentation

* Updated README.md
* Created change request documentation
* Added code comments
* Documented all schema changes

---

## Activities Not Performed

1. **Automated Testing**

   * Reason: Time constraints
   * Impact: Low
   * Recommendation: Add Jest or Mocha and Supertest

2. **Performance Testing**

   * Reason: Not in project scope
   * Impact: Low
   * Recommendation: Add load testing if user base grows

3. **Security Penetration Testing**

   * Reason: Only basic authentication added
   * Impact: Medium
   * Recommendation: Conduct full security audit

4. **Code Coverage Analysis**

   * Reason: No automated tests implemented
   * Impact: Low
   * Recommendation: Add coverage tools later

5. **Database Migration Scripts**

   * Reason: Manual SQL script used
   * Impact: Low
   * Recommendation: Add migration scripts for production

6. **CI/CD Pipeline Setup**

   * Reason: Out of scope
   * Impact: Low
   * Recommendation: Implement CI/CD in future updates

---

## Challenges and Resolutions

### 1. Database Schema Migration

* **Challenge:** Updating customer table without data loss
* **Solution:** Used ALTER TABLE with safe defaults and indexing
* **Impact:** Medium

### 2. Session Management

* **Challenge:** Integrating session handling with existing middleware
* **Solution:** Implemented express-session with proper configuration
* **Impact:** Low

### 3. Activity Logging in Async Operations

* **Challenge:** Ensuring logs do not block main operations
* **Solution:** Created a dedicated logging utility with error handling
* **Impact:** Medium

### 4. Version Number Management

* **Challenge:** Maintaining correct version sequencing
* **Solution:** Queried MAX version and incremented atomically
* **Impact:** Low

### 5. Soft Delete Query Filtering

* **Challenge:** Preventing deleted records from appearing in results
* **Solution:** Updated queries to exclude soft deleted entries
* **Impact:** Medium

### 6. Route Protection

* **Challenge:** Securing routes without duplicating authentication logic
* **Solution:** Implemented authentication middleware
* **Impact:** Low

### 7. Password Security

* **Challenge:** Introducing secure password hashing
* **Solution:** Implemented bcrypt, updated login logic, and stored hashed passwords
* **Impact:** Low

### 8. Version History Display

* **Challenge:** Presenting version history clearly
* **Solution:** Created dedicated view with user attribution
* **Impact:** Low

### 9. Activity Log Performance

* **Challenge:** Preventing unbounded log growth
* **Solution:** Limited query results and added indexes
* **Impact:** Low

### 10. Original Repository Tracking

* **Challenge:** Maintaining proper attribution
* **Solution:** Documented original repository in README.md
* **Impact:** Low

---

## Recommendations for Future Maintenance

* Implement automated unit and integration tests
* Enhance security with CSRF protection, rate limiting, and HTTPS
* Improve performance with connection pooling, caching, and pagination
* Add monitoring for errors, health checks, and log growth
* Expand documentation with API specifications, deployment guide, and user documentation

---

## Maintenance Summary

* Lines of Code Added: approximately 1000
* New Files: 9
* Modified Files: 8
* New Tables: 3
* Modified Tables: 1
* New Dependencies: bcrypt, express-session, puppeteer
* Test Files: Browser automation suite
* Time Spent: 8 to 12 hours
* Complexity: Medium to high
* Risk Level: Low to medium

---

## Conclusion

All required features were successfully implemented, including soft delete, versioning, activity logging, and user authentication.
