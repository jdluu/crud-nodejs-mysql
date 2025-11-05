-- creating the database
CREATE DATABASE crudnodejsmysql;

use crudnodejsmysql;

-- creating users table for authentication
CREATE TABLE users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- creating the customer table with soft delete support
CREATE TABLE customer (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_deleted_at (deleted_at)
);

-- creating customer_versions table for versioning
CREATE TABLE customer_versions (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT(6) UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    version_number INT NOT NULL,
    changed_by INT(6) UNSIGNED,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_version_number (version_number)
);

-- creating activity_log table for tracking user activities
CREATE TABLE activity_log (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(6) UNSIGNED,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT,
    table_name VARCHAR(50),
    record_id INT(6) UNSIGNED,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user (password: admin123 - hash using bcrypt in production)
-- For development purposes, password is plain text 'admin123'
INSERT INTO users (username, password, email) VALUES ('admin', 'admin123', 'admin@example.com');

-- Show all tables
SHOW TABLES;

-- To describe the tables
DESCRIBE customer;
DESCRIBE customer_versions;
DESCRIBE activity_log;
DESCRIBE users;