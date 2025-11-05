const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const path = require('path');
const app = express();
require('dotenv').config();

// Database middleware (initializes database automatically)
const dbMiddleware = require('./middleware/database');

// Importing routes
const customerRoutes = require('./routes/customer');

// settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middlewares
app.use(morgan('dev'));
app.use(dbMiddleware);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.urlencoded({extended: false}));

// Trust proxy for accurate IP addresses (if behind reverse proxy)
app.set('trust proxy', 1);

// Routes
app.use('/', customerRoutes);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Wait for database initialization before starting server
const startServer = async () => {
    // Import database module to trigger initialization
    const dbModule = require('./middleware/database');
    
    // Wait for database initialization promise
    if (dbModule.initPromise) {
        try {
            await dbModule.initPromise;
            console.log('Database initialization complete, starting server...');
        } catch (err) {
            console.error('Database initialization failed:', err);
            throw err;
        }
    } else {
        // Fallback: wait a bit for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const PORT = app.get('port');
    app.listen(PORT, () => {
        console.log(`Server on port ${PORT}`);
    });
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});