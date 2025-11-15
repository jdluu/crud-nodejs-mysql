const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
function initializeDatabase() {
    const dbPath = path.join(__dirname, '..', '..', 'database', 'crudnodejsmysql.db');
    const db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Read and execute SQL file
    const fs = require('fs');
    const sqlPath = path.join(__dirname, '..', '..', 'database', 'db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL statements
    db.exec(sql);
    
    console.log('Database initialized successfully');
    return db;
}

// Initialize if this file is run directly
if (require.main === module) {
    initializeDatabase();
    process.exit(0);
}

module.exports = initializeDatabase;

