# Node.js MySQL CRUD Application

A CRUD (Create, Read, Update, Delete) application developed using Node.js and MySQL, showcasing database management and API development skills.

**Note:** This is an enhanced version of the original project. The original repository can be found at: [https://github.com/TadeopCreator/crud-nodejs-mysql](https://github.com/TadeopCreator/crud-nodejs-mysql)

---

## Table of Contents

- [Description](#description)
- [Key Features](#key-features)
- [New Enhancements](#new-enhancements)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [License](#license)

---

## Description

The Node.js MySQL CRUD Application is a dynamic and versatile project that demonstrates a proficient combination of Node.js and MySQL, highlighting the developer's prowess in database management and API development. This project offers a comprehensive solution for performing CRUD (Create, Read, Update, Delete) operations on a database, providing a solid foundation for building robust web applications.

This enhanced version includes advanced features such as soft delete, versioning, activity logging, and user authentication - essential features for production applications in banking systems, social media platforms, and other critical applications where data retention and audit trails are crucial.

---

## Key Features

- **CRUD Operations:** This project encompasses all four essential database operations - Create, Read, Update, and Delete. Users can seamlessly interact with the database through a user-friendly interface.

- **Node.js:** Powered by Node.js, this application leverages the asynchronous, event-driven architecture of Node.js for efficient and responsive server-side operations. Node.js enables real-time updates and a high level of scalability.

- **MySQL Database:** The application is deeply integrated with MySQL, a powerful and widely-used relational database management system. It showcases effective data storage, retrieval, and management techniques.

- **API Development:** The project exposes a set of well-documented APIs, enabling developers to interact programmatically with the underlying database. This makes it suitable for building both web and mobile applications that require data manipulation.

- **User-Friendly Interface:** The project includes an intuitive user interface that allows users to easily create, read, update, and delete records within the database. This interface serves as an excellent reference for frontend development.

- **Scalable and Maintainable:** Designed with scalability and maintainability in mind, the project follows best practices for code organization and separation of concerns, making it adaptable to the evolving needs of your application.

- **Open Source:** This GitHub project is open-source, providing a valuable resource for developers to learn, explore, and contribute to the world of Node.js and MySQL application development.

---

## New Enhancements

This enhanced version includes the following new features:

### 1. **Soft Delete** (Data Retention)
- Deleted records are not permanently removed from the database
- Records are marked with a `deleted_at` timestamp
- Deleted records can be viewed and restored when needed
- Perfect for compliance requirements in banking and financial systems

### 2. **Versioning** (Audit Trail)
- All customer record updates are tracked with version history
- Each version stores the previous state before modification
- Tracks who made the change and when
- View complete version history for any customer record

### 3. **Activity Logging** (Audit Trail)
- Comprehensive logging of all user activities:
  - **Login/Logout:** Track user authentication events
  - **Create:** Log when new records are created
  - **Update:** Log when records are modified
  - **Delete:** Log when records are soft-deleted
  - **Restore:** Log when deleted records are restored
- Captures IP address, user agent, timestamp, and user information
- Essential for security audits and compliance

### 4. **User Authentication**
- Secure login/logout functionality
- Session-based authentication
- Protected routes require authentication
- Default admin user credentials: `admin` / `admin123`

---

## Installation

1. Clone this repository to your local machine:

```shell
git clone <your-repository-url>
```

2. Navigate to the project directory:

```shell
cd crud-nodejs-mysql
```

3. Install the project dependencies:

```shell
npm install
```

4. Set up your MySQL database:
   - Create a MySQL database
   - Run the SQL script in `database/db.sql` to create tables
   - Create a `.env` file in the root directory with your database credentials:

```env
DATABASE_PASSWORD=your_mysql_password
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production
```

5. Run the application:

```shell
npm run dev
```

Or for production:

```shell
npm start
```

---

## Usage

1. **Access the application** through your web browser at `http://localhost:3000`
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
   - View activity logs

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
   - `id`, `username`, `password`, `email`, `created_at`

2. **customer** - Customer records with soft delete support
   - `id`, `name`, `address`, `phone`, `deleted_at`, `created_at`, `updated_at`

3. **customer_versions** - Version history for customer records
   - `id`, `customer_id`, `name`, `address`, `phone`, `version_number`, `changed_by`, `changed_at`

4. **activity_log** - Activity logging for audit trail
   - `id`, `user_id`, `activity_type`, `activity_description`, `table_name`, `record_id`, `ip_address`, `user_agent`, `created_at`

---

## License

This project is licensed under the MIT License.
