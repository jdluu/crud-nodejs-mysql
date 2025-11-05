-- SQLite Database Schema
-- Run this file to create the database and tables

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create customer table with soft delete support
CREATE TABLE IF NOT EXISTS customer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    deleted_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for deleted_at
CREATE INDEX IF NOT EXISTS idx_deleted_at ON customer(deleted_at);

-- Create customer_versions table for versioning
CREATE TABLE IF NOT EXISTS customer_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    version_number INTEGER NOT NULL,
    changed_by INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for customer_versions
CREATE INDEX IF NOT EXISTS idx_customer_id ON customer_versions(customer_id);
CREATE INDEX IF NOT EXISTS idx_version_number ON customer_versions(version_number);

-- Create activity_log table for tracking user activities
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT,
    table_name VARCHAR(50),
    record_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for activity_log
CREATE INDEX IF NOT EXISTS idx_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_created_at ON activity_log(created_at);

-- Insert default admin user (password: admin123)
-- Password hash: $2b$10$rVxQDfIglhsf/aM9RDmYAOTGdMDdkVWTizdVSWCKiQaJ3NDrbuavS
INSERT OR IGNORE INTO users (username, password, email) VALUES ('admin', '$2b$10$rVxQDfIglhsf/aM9RDmYAOTGdMDdkVWTizdVSWCKiQaJ3NDrbuavS', 'admin@example.com');
