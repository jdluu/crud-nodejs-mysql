const { logActivity } = require('../utils/activityLogger');
const bcrypt = require('bcrypt');

const authController = {};

// Login page
authController.loginPage = (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
};

// Login handler
authController.login = (req, res) => {
    const { username, password } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.render('login', { error: 'Database connection error' });
        }

        conn.query(
            'SELECT * FROM users WHERE username = ?',
            [username],
            (err, users) => {
                if (err) {
                    console.error('Database query error:', err);
                    return res.render('login', { error: 'Database error occurred: ' + err.message });
                }

                if (!users || users.length === 0) {
                    return res.render('login', { error: 'Invalid username or password' });
                }

                const user = users[0];
                
                // Compare password with bcrypt
                bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
                    if (bcryptErr) {
                        console.error('Bcrypt error:', bcryptErr);
                        return res.render('login', { error: 'Authentication error occurred' });
                    }

                    if (!isMatch) {
                        return res.render('login', { error: 'Invalid username or password' });
                    }

                    req.session.userId = user.id;
                    req.session.username = user.username;

                    // Log login activity
                    logActivity(req, 'LOGIN', `User ${username} logged in`, 'users', user.id);

                    res.redirect('/');
                });
            }
        );
    });
};

// Logout handler
authController.logout = (req, res) => {
    const username = req.session ? req.session.username : null;
    const userId = req.session ? req.session.userId : null;

    // Log logout activity before destroying session
    if (userId) {
        logActivity(req, 'LOGOUT', `User ${username} logged out`, 'users', userId);
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
};

module.exports = authController;

