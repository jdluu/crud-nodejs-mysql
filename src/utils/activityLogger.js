// Activity logging utility
const logActivity = (req, activityType, description, tableName = null, recordId = null) => {
    const userId = req.session ? req.session.userId : null;
    // Get IP address from request (handle forwarded headers)
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
                     'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Database connection error in activity logger:', err);
            return;
        }

        const logData = {
            user_id: userId,
            activity_type: activityType,
            activity_description: description,
            table_name: tableName,
            record_id: recordId,
            ip_address: ipAddress,
            user_agent: userAgent
        };

        conn.query('INSERT INTO activity_log SET ?', [logData], (err) => {
            if (err) {
                console.error('Error logging activity:', err);
            }
        });
    });
};

module.exports = {
    logActivity
};

