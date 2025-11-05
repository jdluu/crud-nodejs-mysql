# Quick Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_PASSWORD=your_mysql_password
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production
```

## Database Setup

1. Make sure MySQL is running
2. Execute the SQL script in `database/db.sql` to create the database and tables:

```bash
mysql -u root -p < database/db.sql
```

Or manually run the SQL commands in your MySQL client.

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change these credentials in production!

## Installation Steps

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file)

3. Set up database (run `database/db.sql`)

4. Start the application:
```bash
npm run dev
```

5. Access the application at `http://localhost:3000`

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

