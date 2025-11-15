# Node.js CRUD Application

A full-featured CRUD (Create, Read, Update, Delete) application built with Node.js and SQLite, featuring user authentication, soft delete, versioning, and comprehensive activity logging.

**Note:** This is an enhanced version of the original project, developed as part of a software re-engineering class. The original repository can be found at: [https://github.com/TadeopCreator/crud-nodejs-mysql](https://github.com/TadeopCreator/crud-nodejs-mysql)

---

## Table of Contents

- [Description](#description)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [License](#license)

---

## Description

This CRUD application demonstrates modern Node.js development practices with a focus on data integrity, security, and audit trails. Built with Express.js and SQLite, it provides a solid foundation for building production-ready web applications with features essential for banking systems, social media platforms, and other applications where data retention and audit trails are crucial.

The application automatically initializes the database on first startup, making setup seamless and straightforward.

---

## Key Features

### Core CRUD Operations
- **Create:** Add new customer records with validation
- **Read:** View active customers with pagination support
- **Update:** Modify customer information with version tracking
- **Delete:** Soft delete functionality for data retention

### Advanced Features

- **User Authentication:** Secure login/logout with bcrypt password hashing and session management
- **Soft Delete:** Deleted records are retained with a `deleted_at` timestamp for compliance and recovery
- **Versioning:** Complete audit trail of all changes to customer records
- **Activity Logging:** Comprehensive logging of all user activities including IP address, user agent, and timestamps
- **Restore Functionality:** Ability to restore soft-deleted records
- **Browser Automation Testing:** Automated testing suite using Puppeteer

---

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3
- **View Engine:** EJS
- **Authentication:** bcrypt, express-session
- **Testing:** Puppeteer
- **Logging:** Morgan

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Steps

1. **Clone the repository:**

```bash
git clone https://github.com/jdluu/crud-nodejs-mysql.git
cd crud-nodejs-mysql
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the application:**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

**Note:** The database is automatically initialized on first startup. No manual database setup or configuration files are required.

---

## Usage

1. **Access the application** at `http://localhost:3000`

2. **Login** with default credentials:
   - Username: `admin`
   - Password: `admin123`

3. **Perform CRUD operations:**
   - Create new customers
   - View active customers
   - Update customer information
   - Delete customers (soft delete)
   - Restore deleted customers
   - View version history for any customer
   - View comprehensive activity logs

---

## Testing

The project includes automated browser testing using Puppeteer. Run the test suite with:

```bash
npm test
```

The test suite will:
- Start the application server
- Perform automated browser tests for all CRUD operations
- Test authentication flow
- Test soft delete and restore functionality
- Clean up and shut down the server automatically

---

## API Endpoints

### Authentication

- `GET /login` - Display login page
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Customer Management

- `GET /` - List all active customers (requires authentication)
- `POST /add` - Create a new customer (requires authentication)
- `GET /update/:id` - Display edit form for a customer (requires authentication)
- `POST /update/:id` - Update a customer record (requires authentication)
- `GET /delete/:id` - Soft delete a customer (requires authentication)

### Additional Features

- `GET /deleted` - View all soft-deleted customers (requires authentication)
- `GET /restore/:id` - Restore a soft-deleted customer (requires authentication)
- `GET /versions/:id` - View version history for a customer (requires authentication)
- `GET /activity-log` - View activity log (requires authentication)

---

## Database Schema

### Tables

1. **users** - User authentication
   - `id` - Primary key
   - `username` - Unique username
   - `password` - Bcrypt hashed password
   - `email` - User email (optional)
   - `created_at` - Account creation timestamp

2. **customer** - Customer records with soft delete support
   - `id` - Primary key
   - `name` - Customer name
   - `address` - Customer address
   - `phone` - Customer phone number
   - `deleted_at` - Soft delete timestamp (NULL for active records)
   - `created_at` - Record creation timestamp
   - `updated_at` - Last update timestamp

3. **customer_versions** - Version history for customer records
   - `id` - Primary key
   - `customer_id` - Foreign key to customer table
   - `name` - Customer name at time of change
   - `address` - Customer address at time of change
   - `phone` - Customer phone at time of change
   - `version_number` - Sequential version number
   - `changed_by` - Username who made the change
   - `changed_at` - Timestamp of the change

4. **activity_log** - Activity logging for audit trail
   - `id` - Primary key
   - `user_id` - Foreign key to users table
   - `activity_type` - Type of activity (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, RESTORE)
   - `activity_description` - Human-readable description
   - `table_name` - Table affected
   - `record_id` - ID of the affected record
   - `ip_address` - User's IP address
   - `user_agent` - User's browser/user agent
   - `created_at` - Timestamp of the activity

---

## Project Structure

```
crud-nodejs-mysql/
├── database/
│   ├── db.sql              # Database schema definition
│   └── crudnodejsmysql.db  # SQLite database file (auto-generated)
├── src/
│   ├── app.js              # Main application entry point
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── customerController.js # Customer CRUD operations
│   ├── middleware/
│   │   ├── auth.js        # Authentication middleware
│   │   └── database.js    # Database connection and initialization
│   ├── routes/
│   │   └── customer.js    # Customer routes
│   ├── utils/
│   │   ├── activityLogger.js # Activity logging utility
│   │   ├── initDb.js      # Database initialization utility
│   │   └── versioning.js  # Version tracking utility
│   └── views/
│       ├── login.ejs
│       ├── customers.ejs
│       ├── customer_edit.ejs
│       ├── customers_deleted.ejs
│       ├── customer_versions.ejs
│       ├── activity_log.ejs
│       └── partials/
│           ├── _header.ejs
│           └── _footer.ejs
├── test/
│   └── browser-test.js    # Puppeteer browser automation tests
├── package.json
├── README.md
```

---

## Security Features

- **Password Hashing:** Passwords are hashed using bcrypt with salt rounds
- **Session Management:** Secure session handling with express-session
- **Protected Routes:** All customer management routes require authentication
- **SQL Injection Prevention:** Parameterized queries prevent SQL injection attacks
- **Input Validation:** User input is validated before database operations

---

## License

This project is licensed under the MIT License.
