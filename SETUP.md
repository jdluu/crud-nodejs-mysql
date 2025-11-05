# Quick Setup Guide

## Prerequisites

- **Node.js** (v14 or higher)
- **MySQL Server** (v5.7 or higher)
- **npm** or **yarn**

## Step 1: Database Setup

**IMPORTANT:** MySQL databases are server-based, not file-based. You must have MySQL server running.

### Install MySQL Server (if not installed)

**Windows:**
- Download from: https://dev.mysql.com/downloads/installer/
- Run installer and remember your root password

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### Create Database and Tables

1. Open MySQL command line:
   ```bash
   mysql -u root -p
   ```

2. Execute the SQL file:
   ```bash
   mysql -u root -p < database/db.sql
   ```

   Or in MySQL:
   ```sql
   source database/db.sql;
   ```

3. Verify creation:
   ```sql
   SHOW DATABASES;
   USE crudnodejsmysql;
   SHOW TABLES;
   ```

## Step 2: Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_PASSWORD=your_mysql_root_password
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production
```

**Replace `your_mysql_root_password` with your actual MySQL root password.**

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start the Application

```bash
npm run dev
```

Or for production:

```bash
npm start
```

## Step 5: Access the Application

1. Open browser: `http://localhost:3000`
2. **Login** with default credentials:
   - Username: `admin`
   - Password: `admin123`

⚠️ **Important:** Change these credentials in production!

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change these credentials in production!

## Features Overview

- **Soft Delete:** Records are marked as deleted but retained in database
- **Versioning:** Complete history of all changes to customer records
- **Activity Logging:** Tracks all user activities (login, logout, create, update, delete)
- **Authentication:** Secure login/logout with session management

## Navigation

- `/` - Main customer list (requires login)
- `/login` - Login page
- `/deleted` - View soft-deleted customers
- `/versions/:id` - View version history for a customer
- `/activity-log` - View activity log

## Troubleshooting

### Database Connection Error

If you see "Database connection error" or "Database error occurred":

1. **Check MySQL is running:**
   - Windows: Open Services → Check MySQL service
   - Mac/Linux: `sudo systemctl status mysql` or `brew services list`

2. **Verify database exists:**
   ```bash
   mysql -u root -p
   ```
   ```sql
   SHOW DATABASES;
   ```

3. **Check .env file:**
   - Ensure `.env` file exists in project root
   - Verify `DATABASE_PASSWORD` matches your MySQL root password

4. **Recreate database:**
   ```bash
   mysql -u root -p < database/db.sql
   ```

### Port Already in Use

If port 3000 is already in use:
- Change `PORT` in `.env` file
- Or stop the process using port 3000

### Module Not Found Errors

```bash
npm install
```

### Tables Don't Exist

Run the SQL file again:
```bash
mysql -u root -p < database/db.sql
```

