const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database connection
const dbPath = path.join(__dirname, '..', '..', 'database', 'crudnodejsmysql.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema if tables don't exist
const initDb = () => {
    return new Promise((resolve, reject) => {
        const sqlPath = path.join(__dirname, '..', '..', 'database', 'db.sql');
        if (!fs.existsSync(sqlPath)) {
            console.error('SQL file not found at:', sqlPath);
            resolve();
            return;
        }

        let sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Remove single-line comments (-- ...) but preserve newlines
        sql = sql.replace(/--.*$/gm, '');
        
        // Split by semicolons and clean up
        const statements = sql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.match(/^\s*$/));
        
        if (statements.length === 0) {
            resolve();
            return;
        }
        
        // Execute statements sequentially
        let completed = 0;
        let hasError = false;
        
        const executeNext = (index) => {
            if (index >= statements.length) {
                // Verify tables were created
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
                    if (err) {
                        console.error('Error verifying tables:', err);
                        reject(err);
                        return;
                    }
                    if (!row) {
                        console.error('Tables were not created successfully');
                        reject(new Error('Database initialization failed - tables not created'));
                        return;
                    }
                    console.log('Database initialized successfully');
                    resolve();
                });
                return;
            }
            
            const statement = statements[index];
            if (!statement || statement.trim().length === 0) {
                executeNext(index + 1);
                return;
            }
            
            db.run(statement, (err) => {
                if (err) {
                    // Ignore "already exists" errors, but log others
                    if (!err.message.includes('already exists') && 
                        !err.message.includes('duplicate') &&
                        !err.message.includes('UNIQUE constraint')) {
                        console.error(`Error executing statement ${index + 1}/${statements.length}:`, err.message);
                        console.error('Statement:', statement.substring(0, 200));
                        hasError = true;
                    }
                }
                executeNext(index + 1);
            });
        };
        
        executeNext(0);
    });
};

// Wait for database to be ready
let dbReady = false;
let initPromise = null;

// Synchronously check if tables exist and initialize if needed
const checkAndInit = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
            if (err) {
                console.error('Error checking tables:', err);
                initDb().then(resolve).catch(reject);
            } else if (!row) {
                console.log('Initializing database...');
                initDb().then(() => {
                    console.log('Database ready');
                    resolve();
                }).catch(reject);
            } else {
                console.log('Database already initialized');
                resolve();
            }
        });
    });
};

// Initialize database synchronously before module exports
initPromise = checkAndInit();
initPromise.then(() => {
    dbReady = true;
    console.log('Database ready flag set to true');
}).catch(err => {
    console.error('Failed to initialize database:', err);
    dbReady = true; // Still allow requests, but log error
});

// Middleware to attach database to request
const dbMiddleware = (req, res, next) => {
    req.db = db;
    // Create a getConnection method that mimics express-myconnection API
    req.getConnection = (callback) => {
        // Wait for database initialization if needed
        if (!dbReady && initPromise) {
            initPromise.then(() => {
                dbReady = true;
                attachConnection(req, callback);
            }).catch(err => {
                console.error('Database initialization error in middleware:', err);
                callback(err);
            });
        } else if (dbReady) {
            attachConnection(req, callback);
        } else {
            // If no init promise yet, wait a bit and try again
            setTimeout(() => {
                if (dbReady) {
                    attachConnection(req, callback);
                } else {
                    callback(new Error('Database not ready'));
                }
            }, 100);
        }
    };
    next();
};

function attachConnection(req, callback) {
    callback(null, {
        query: (sql, params, cb) => {
            if (typeof params === 'function') {
                cb = params;
                params = [];
            }
            
            // Handle different query types
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params || [], (err, rows) => {
                    if (err) {
                        console.error('SQL Query Error:', err);
                        console.error('SQL:', sql);
                        console.error('Params:', params);
                    }
                    if (cb) cb(err, rows || []);
                });
            } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
                // Handle INSERT ... SET syntax (MySQL style)
                if (sql.toLowerCase().includes('set ?')) {
                    const data = params[0];
                    const tableMatch = sql.match(/INTO\s+(\w+)\s+SET/i);
                    if (tableMatch) {
                        const table = tableMatch[1];
                        const keys = Object.keys(data);
                        const values = Object.values(data);
                        const placeholders = keys.map(() => '?').join(', ');
                        const newSql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
                        db.run(newSql, values, function(err) {
                            if (err) {
                                console.error('SQL Query Error:', err);
                                console.error('SQL:', newSql);
                                console.error('Params:', values);
                            }
                            if (cb) cb(err, { insertId: this.lastID });
                        });
                    } else {
                        db.run(sql, params || [], function(err) {
                            if (err) {
                                console.error('SQL Query Error:', err);
                                console.error('SQL:', sql);
                                console.error('Params:', params);
                            }
                            if (cb) cb(err, { insertId: this.lastID });
                        });
                    }
                } else {
                    db.run(sql, params || [], function(err) {
                        if (err) {
                            console.error('SQL Query Error:', err);
                            console.error('SQL:', sql);
                            console.error('Params:', params);
                        }
                        if (cb) cb(err, { insertId: this.lastID });
                    });
                }
            } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
                // Handle UPDATE ... SET ? syntax (MySQL style)
                if (sql.toLowerCase().includes('set ?')) {
                    const data = params[0];
                    const id = params[1];
                    const keys = Object.keys(data);
                    const values = Object.values(data);
                    const setClause = keys.map(k => `${k} = ?`).join(', ');
                    const newSql = sql.replace(/set \?/i, `SET ${setClause}`);
                    db.run(newSql, [...values, id], function(err) {
                        if (cb) cb(err, { affectedRows: this.changes });
                    });
                } else {
                    db.run(sql, params || [], function(err) {
                        if (cb) cb(err, { affectedRows: this.changes });
                    });
                }
            } else {
                // DELETE, etc.
                db.run(sql, params || [], function(err) {
                    if (cb) cb(err, { affectedRows: this.changes });
                });
            }
        }
    });
}

module.exports = dbMiddleware;
module.exports.initPromise = initPromise;
module.exports.dbReady = () => dbReady;

