const res = require("express/lib/response");
const { logActivity } = require('../utils/activityLogger');
const { createVersion } = require('../utils/versioning');

const controller = {};

// List all active (non-deleted) customers
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer WHERE deleted_at IS NULL ORDER BY id DESC', (err, customers) => {
            if (err) {
                res.json(err);
                return;
            }

            res.render('customers', {
                data: customers,
                username: req.session ? req.session.username : null
            });
        });
    });
};

// List soft-deleted customers
controller.listDeleted = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC', (err, customers) => {
            if (err) {
                res.json(err);
                return;
            }

            res.render('customers_deleted', {
                data: customers,
                username: req.session ? req.session.username : null
            });
        });
    });
};

// View version history for a customer
controller.viewVersions = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        conn.query(
            `SELECT cv.*, u.username as changed_by_username 
             FROM customer_versions cv 
             LEFT JOIN users u ON cv.changed_by = u.id 
             WHERE cv.customer_id = ? 
             ORDER BY cv.version_number DESC`,
            [id],
            (err, versions) => {
                if (err) {
                    res.json(err);
                    return;
                }

                conn.query('SELECT * FROM customer WHERE id = ?', [id], (err, customerResult) => {
                    if (err) {
                        res.json(err);
                        return;
                    }

                    res.render('customer_versions', {
                        customer: customerResult[0],
                        versions: versions,
                        username: req.session ? req.session.username : null
                    });
                });
            }
        );
    });
};

// View activity log
controller.viewActivityLog = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query(
            `SELECT al.*, u.username 
             FROM activity_log al 
             LEFT JOIN users u ON al.user_id = u.id 
             ORDER BY al.created_at DESC 
             LIMIT 100`,
            (err, activities) => {
                if (err) {
                    res.json(err);
                    return;
                }

                res.render('activity_log', {
                    activities: activities,
                    username: req.session ? req.session.username : null
                });
            }
        );
    });
};

// Create new customer
controller.save = (req, res) => {
    const data = req.body;

    req.getConnection((err, conn) => {
        conn.query('INSERT INTO customer set ?', [data], (err, result) => {
            if (err) {
                res.json(err);
                return;
            }

            // Log activity
            logActivity(req, 'CREATE', `Created customer: ${data.name}`, 'customer', result.insertId);

            res.redirect('/');
        });
    });
};

// Soft delete customer
controller.delete = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        // First get customer data for logging
        conn.query('SELECT * FROM customer WHERE id = ?', [id], (err, customer) => {
            if (err) {
                res.json(err);
                return;
            }

            if (customer.length === 0) {
                res.redirect('/');
                return;
            }

            // Soft delete: set deleted_at timestamp
            conn.query('UPDATE customer SET deleted_at = datetime(\'now\') WHERE id = ?', [id], (err, rows) => {
                if (err) {
                    res.json(err);
                    return;
                }

                // Log activity
                logActivity(req, 'DELETE', `Soft deleted customer: ${customer[0].name} (ID: ${id})`, 'customer', id);

                res.redirect('/');
            });
        });
    });
};

// Restore soft-deleted customer
controller.restore = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer WHERE id = ?', [id], (err, customer) => {
            if (err) {
                res.json(err);
                return;
            }

            conn.query('UPDATE customer SET deleted_at = NULL WHERE id = ?', [id], (err, rows) => {
                if (err) {
                    res.json(err);
                    return;
                }

                // Log activity
                logActivity(req, 'RESTORE', `Restored customer: ${customer[0].name} (ID: ${id})`, 'customer', id);

                res.redirect('/deleted');
            });
        });
    });
};

// Edit customer page
controller.edit = (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM customer WHERE id = ? AND deleted_at IS NULL', [id], (err, customer) => {
            if (err) {
                res.json(err);
                return;
            }

            if (customer.length === 0) {
                res.redirect('/');
                return;
            }
            
            res.render('customer_edit', {
                data: customer[0],
                username: req.session ? req.session.username : null
            });
        });
    });
};

// Update customer with versioning
controller.update = (req, res) => {
    const { id } = req.params;
    const newCustomer = req.body;
    
    req.getConnection((err, conn) => {
        // First get old customer data for versioning
        conn.query('SELECT * FROM customer WHERE id = ?', [id], (err, oldCustomer) => {
            if (err) {
                res.json(err);
                return;
            }

            if (oldCustomer.length === 0) {
                res.redirect('/');
                return;
            }

            // Create version before updating
            createVersion(req, id, oldCustomer[0]);

            // Update customer
            conn.query('UPDATE customer set ? WHERE id = ?', [newCustomer, id], (err, rows) => {
                if (err) {
                    res.json(err);
                    return;
                }

                // Log activity
                logActivity(req, 'UPDATE', `Updated customer: ${newCustomer.name} (ID: ${id})`, 'customer', id);

                res.redirect('/');
            });
        });
    });
};

module.exports = controller;