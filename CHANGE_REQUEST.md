# CHANGE REQUEST FORM

---

## Change Description

<div style="border: 1px solid black; padding: 8px; margin-bottom: 10px;">

| Project Name: | Change Name: | Number: |
|:--------------|:-------------|:--------|
| CRUD Node.js MySQL Application | Soft Delete, Versioning, and Activity Logging | CR-001 |

</div>

<div style="border: 1px solid black; padding: 8px; margin-bottom: 10px;">

| Requested By: | Contact: | Date: |
|:--------------|:---------|:------|
| Jeffrey Luu | [Contact Information] | 2025-11-04 |

</div>

**Description of Change:**

<div style="border: 1px solid black; padding: 10px; min-height: 80px; margin-bottom: 15px;">

1. **Soft delete functionality** - Retain deleted records in the database instead of permanently removing them
2. **Versioning** - Retain modified records with complete version history for audit purposes
3. **Activity logging** - Track all user activities including login, logout, create, update, delete, and restore operations

</div>

**Reason for Change:**

<div style="border: 1px solid black; padding: 10px; min-height: 80px; margin-bottom: 15px;">

These changes are necessary for applications in banking systems and social media platforms where:

- Data retention is required for compliance and audit purposes
- Historical data tracking is necessary for accountability
- Audit trails are mandatory for security and regulatory compliance
- Version history is needed to track changes and maintain data integrity
- Activity logging provides security monitoring and user accountability

</div>

**Priority [Circle One]:**

1. High ✓    2. Medium    3. Low

**Impact on Deliverables:**

<div style="border: 1px solid black; padding: 10px; min-height: 60px; margin-bottom: 15px;">

The following deliverables are affected by this change:

- **Database Schema:** New tables created (`users`, `customer_versions`, `activity_log`), existing `customer` table modified with additional columns
- **Backend Controllers:** Updated `customerController.js` with soft delete, versioning, and logging functionality; new `authController.js` for authentication
- **Routes:** New authentication routes added; existing routes now require authentication
- **Views:** New views created for login, deleted customers, version history, and activity log; existing views updated with new navigation
- **Middleware:** New authentication middleware and database middleware for SQLite
- **Database:** Migration from MySQL to SQLite for local development
- **Documentation:** README.md updated with new features and setup instructions
- **Testing:** Comprehensive browser automation test suite added

</div>

**Impact of Not Responding to Change (and Reason Why):**

<div style="border: 1px solid black; padding: 10px; min-height: 60px; margin-bottom: 15px;">

If this change is not implemented:

- **Compliance Risk:** The application will not meet regulatory requirements for data retention and audit trails in banking and financial applications
- **Security Gaps:** Lack of activity logging prevents security monitoring and incident investigation
- **Data Loss:** Permanent deletion of records without version history makes it impossible to recover or audit changes
- **Accountability Issues:** No tracking of who made changes or when, making it difficult to maintain data integrity
- **Business Impact:** The application cannot be used in environments requiring audit trails and compliance documentation

</div>

<div style="border: 1px solid black; padding: 8px; margin-bottom: 10px;">

| Date Needed: | Approval of Request: | Date: |
|:-------------|:---------------------|:------|
| 2025-11-04 | Pending | 2025-11-14 |

</div>

---

## Change Impact

**Tasks/Scope Affected:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Component | Tasks Affected |
|:----------|:---------------|
| **Database Schema** | • Create new tables: `users`, `customer_versions`, `activity_log`<br>• Modify `customer` table: Add `deleted_at`, `created_at`, `updated_at` columns<br>• Create indexes for performance optimization |
| **Backend Code** | • Implement authentication system (login/logout)<br>• Implement soft delete functionality<br>• Implement versioning system<br>• Implement activity logging<br>• Create middleware for route protection<br>• Migrate from MySQL to SQLite |
| **Frontend Views** | • Create login page<br>• Create deleted customers view<br>• Create version history view<br>• Create activity log view<br>• Update existing views with new navigation |
| **Testing** | • Manual testing of all CRUD operations<br>• Browser automation testing with Puppeteer<br>• Integration testing of database operations<br>• End-to-end workflow testing |

</div>

**Cost Evaluation:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Cost Type | Details |
|:----------|:--------|
| **Development Time** | Estimated 8-12 hours of development work |
| **Testing Time** | 2-3 hours for comprehensive testing and validation |
| **Dependencies** | New packages added: `bcrypt`, `express-session`, `sqlite3`, `puppeteer` (all open-source, no licensing costs) |
| **Infrastructure** | No additional infrastructure costs - SQLite is file-based, no server required |
| **Maintenance** | Minimal additional maintenance - well-structured code with proper error handling |

</div>

**Risk Evaluation:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Risk | Level | Mitigation |
|:-----|:------|:-----------|
| **Database Migration** | Medium | • Thorough testing of SQLite compatibility<br>• Maintained backward compatibility where possible<br>• Comprehensive test suite validates all operations |
| **Authentication Implementation** | Low | • Used industry-standard bcrypt for password hashing<br>• Session management with express-session<br>• Proper error handling and security practices |
| **Data Loss During Migration** | Low | • Database schema changes are additive<br>• Existing data preserved with default values<br>• Migration scripts tested thoroughly |
| **Breaking Changes** | Medium | • All routes now require authentication (documented)<br>• Database migration from MySQL to SQLite (documented)<br>• Clear migration path provided |

</div>

**Quality Evaluation:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Quality Aspect | Assessment |
|:---------------|:-----------|
| **Code Quality** | • Well-structured code with proper separation of concerns<br>• Comprehensive error handling<br>• Consistent coding style and patterns |
| **Testing Coverage** | • Manual testing of all features<br>• Browser automation test suite<br>• Integration testing of database operations<br>• All tests passing |
| **Documentation** | • Updated README with new features<br>• Inline code comments<br>• Change request documentation |
| **Security** | • Password hashing with bcrypt<br>• Session management<br>• Route protection<br>• Activity logging for audit trails |

</div>

**Additional Resources:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Resource Type | Requirements |
|:--------------|:-------------|
| **Development Tools** | • Node.js environment<br>• SQLite database (file-based, no installation needed)<br>• Text editor/IDE |
| **Testing Tools** | • Puppeteer for browser automation<br>• Manual testing capabilities |
| **Documentation** | • Markdown editor for documentation updates |
| **No Additional Resources** | All required tools and dependencies are already available or can be installed via npm |

</div>

**Duration:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Phase | Duration |
|:------|:---------|
| **Requirements Analysis** | 1 hour |
| **Database Design** | 1 hour |
| **Code Implementation** | 6-8 hours |
| **Testing** | 2-3 hours |
| **Documentation** | 1 hour |
| **Total Estimated Duration** | 11-14 hours |

</div>

**Additional Effort:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Activity | Effort Required |
|:---------|:----------------|
| **Implementing Authentication** | Moderate - standard Express.js patterns |
| **Versioning System** | Moderate - requires careful state management |
| **Activity Logging** | Low - straightforward logging implementation |
| **Testing** | Moderate - comprehensive test suite development |

</div>

**Impact on Deadline:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Impact | Details |
|:-------|:--------|
| **Timeline Impact** | No impact on existing deadlines - this is an enhancement request |
| **Development Schedule** | Can be completed within 1-2 days of focused development |
| **Deployment** | No deployment delays - changes are backward compatible where possible |

</div>

**Alternative and Recommendations:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

| Alternative | Evaluation |
|:------------|:-----------|
| **Keep MySQL Database** | Not recommended - SQLite provides easier local development without server setup |
| **Skip Versioning** | Not recommended - versioning is essential for audit trails and compliance |
| **Basic Logging Only** | Not recommended - comprehensive activity logging is required for security and compliance |
| **Recommended Approach** | Implement all three features (soft delete, versioning, activity logging) as they work together to provide complete audit trail and compliance capabilities |

</div>

**Comments:**

<div style="border: 1px solid black; padding: 10px; min-height: 40px; margin-bottom: 15px;">

- Default admin credentials: `admin` / `admin123` (should be changed in production)
- Password hashing with bcrypt is implemented and active - passwords are securely hashed
- Session secret should be changed in production environment
- Activity log is limited to 100 most recent entries (can be adjusted)
- Database file (`database/crudnodejsmysql.db`) is created automatically on first run
- No MySQL server installation required - application uses SQLite for local development
- Database file can be deleted to reset the entire database (will be recreated on next startup)
- Browser automation tests available via `npm test` - comprehensive test suite validates all functionality
- Original repository reference: [https://github.com/TadeopCreator/crud-nodejs-mysql](https://github.com/TadeopCreator/crud-nodejs-mysql)
- All changes have been tested and verified to work correctly

</div>

---

## Sign Offs

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Role | Name | Date | Signature |
|:-----|:-----|:-----|:----------|
| **Developer** | [Your Name] | 2025-01-XX | _________________ |
| **Reviewed By** | _________________ | _______________ | _________________ |
| **Approved By** | _________________ | _______________ | _________________ |

</div>
