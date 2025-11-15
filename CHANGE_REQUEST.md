# CHANGE REQUEST FORM

---

## Change Description

<div style="border: 1px solid black; padding: 8px; margin-bottom: 10px;">

| Project Name                   | Change Name                                   | Number |
| :----------------------------- | :-------------------------------------------- | :----- |
| CRUD Node.js MySQL Application | Soft Delete, Versioning, and Activity Logging | CR-001 |

</div>

<div style="border: 1px solid black; padding: 8px; margin-bottom: 10px;">

| Requested By | Contact               | Date       |
| :----------- | :-------------------- | :--------- |
| Jeffrey Luu  | [Contact Information] | 2025-11-04 |

</div>

**Description of Change**

<div style="border: 1px solid black; padding: 10px; min-height: 70px; margin-bottom: 15px;">

1. Soft delete functionality to retain deleted records.
2. Versioning system to preserve modification history.
3. Activity logging to track all actions and user operations.

</div>

**Reason for Change**

<div style="border: 1px solid black; padding: 10px; min-height: 70px; margin-bottom: 15px;">

These features are required for applications that must meet compliance, auditing, and accountability standards. They ensure proper data retention, historical reference, security logging, and integrity of user actions.

</div>

**Priority [Circle One]:**

1. High ✓ 2. Medium 3. Low

---

## Impact on Deliverables

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

The following deliverables are affected:

* Database schema updates and new tables.
* Backend controllers updated and new authentication controller added.
* Routes updated to include authentication.
* New frontend views and navigation changes.
* New authentication and database middleware.
* Migration from MySQL to SQLite for development.
* Updated documentation and testing suite.

</div>

---

## Impact of Not Responding to Change

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

Failure to implement this change will result in compliance risks, lack of audit trails, potential data loss, and insufficient security logging. The application will not meet requirements for environments that mandate full auditability and data retention.

</div>

<div style="border: 1px solid black; padding: 8px; margin-bottom: 10px;">

| Date Needed | Approval of Request | Date       |
| :---------- | :------------------ | :--------- |
| 2025-11-04  | Pending             | 2025-11-14 |

</div>

---

# Change Impact

**Tasks and Scope Affected**

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Component           | Tasks Affected                                                                                                                                                                         |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database Schema** | • Create tables: `users`, `customer_versions`, `activity_log`<br>• Modify `customer` table: add `deleted_at`, `created_at`, `updated_at`<br>• Add indexes for performance              |
| **Backend Code**    | • Implement authentication<br>• Implement soft delete<br>• Implement versioning<br>• Implement activity logging<br>• Add route protection middleware<br>• Migrate from MySQL to SQLite |
| **Frontend Views**  | • Create login page<br>• Create deleted customers view<br>• Create version history view<br>• Create activity log view<br>• Update existing navigation                                  |
| **Testing**         | • Manual CRUD testing<br>• Puppeteer browser tests<br>• Integration testing<br>• End-to-end workflow testing                                                                           |

</div>

---

## Cost Evaluation

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Cost Type        | Details                                             |
| :--------------- | :-------------------------------------------------- |
| Development Time | Estimated 8 to 12 hours                             |
| Testing Time     | 2 to 3 hours                                        |
| Dependencies     | bcrypt, express-session, sqlite3, puppeteer         |
| Infrastructure   | No additional cost. SQLite is file-based.           |
| Maintenance      | Minimal due to structured design and error handling |

</div>

---

## Risk Evaluation

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Risk                          | Level  | Mitigation                                                |
| :---------------------------- | :----- | :-------------------------------------------------------- |
| Database Migration            | Medium | Validate SQLite compatibility and run complete test suite |
| Authentication Implementation | Low    | Use bcrypt for hashing and secure session handling        |
| Data Loss During Migration    | Low    | Schema changes are additive and tested                    |
| Breaking Changes              | Medium | Documented route restrictions and migration steps         |

</div>

---

## Quality Evaluation

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Quality Aspect   | Assessment                                                               |
| :--------------- | :----------------------------------------------------------------------- |
| Code Quality     | Structured, consistent patterns, and error handling                      |
| Testing Coverage | Manual, automated, and integration tests included                        |
| Documentation    | Updated README and inline comments                                       |
| Security         | Password hashing, session management, route protection, activity logging |

</div>

---

## Additional Resources

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Resource Type           | Requirements                           |
| :---------------------- | :------------------------------------- |
| Development Tools       | Node.js, SQLite, IDE                   |
| Testing Tools           | Puppeteer, manual testing              |
| Documentation           | Markdown editor                        |
| No Additional Resources | All dependencies available through npm |

</div>

---

## Duration

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Phase                    | Duration       |
| :----------------------- | :------------- |
| Requirements Analysis    | 1 hour         |
| Database Design          | 1 hour         |
| Code Implementation      | 6 to 8 hours   |
| Testing                  | 2 to 3 hours   |
| Documentation            | 1 hour         |
| Total Estimated Duration | 11 to 14 hours |

</div>

---

## Additional Effort

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Activity          | Effort Required |
| :---------------- | :-------------- |
| Authentication    | Moderate        |
| Versioning System | Moderate        |
| Activity Logging  | Low             |
| Testing           | Moderate        |

</div>

---

## Impact on Deadline

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Impact               | Details                             |
| :------------------- | :---------------------------------- |
| Timeline Impact      | No deadline impact                  |
| Development Schedule | Can be completed within 1 to 2 days |
| Deployment           | No delays expected                  |

</div>

---

## Alternatives and Recommendations

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Alternative          | Evaluation                                              |
| :------------------- | :------------------------------------------------------ |
| Keep MySQL           | Not recommended for local development workflow          |
| Skip Versioning      | Not recommended due to audit requirements               |
| Basic Logging Only   | Not recommended due to compliance needs                 |
| Recommended Approach | Implement soft delete, versioning, and activity logging |

</div>

---

## Comments

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

* Default admin credentials are provided for testing and must be changed in production.
* Password hashing and session handling are in place.
* Activity log retains the most recent 100 entries.
* SQLite database file is created automatically and can be reset by deletion.
* Automated tests available through npm test.
* Original repository reference included for context.

</div>

---

# Sign Offs

<div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">

| Role        | Name               | Date            | Signature          |
| :---------- | :----------------- | :-------------- | :----------------- |
| Developer   | [Your Name]        | 2025-01-XX      | __________________ |
| Reviewed By | __________________ | _______________ | __________________ |
| Approved By | __________________ | _______________ | __________________ |

</div>
