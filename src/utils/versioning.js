// Versioning utility
const createVersion = (req, customerId, customerData) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Database connection error in versioning:', err);
            return;
        }

        // Get the current max version number for this customer
        conn.query(
            'SELECT MAX(version_number) as max_version FROM customer_versions WHERE customer_id = ?',
            [customerId],
            (err, result) => {
                if (err) {
                    console.error('Error getting max version:', err);
                    return;
                }

                const nextVersion = (result[0]?.max_version || 0) + 1;
                const userId = req.session ? req.session.userId : null;

                const versionData = {
                    customer_id: customerId,
                    name: customerData.name,
                    address: customerData.address,
                    phone: customerData.phone,
                    version_number: nextVersion,
                    changed_by: userId
                };

                // SQLite INSERT syntax
                const keys = Object.keys(versionData);
                const values = Object.values(versionData);
                const placeholders = keys.map(() => '?').join(', ');
                const sql = `INSERT INTO customer_versions (${keys.join(', ')}) VALUES (${placeholders})`;

                conn.query(sql, values, (err) => {
                    if (err) {
                        console.error('Error creating version:', err);
                    }
                });
            }
        );
    });
};

module.exports = {
    createVersion
};

