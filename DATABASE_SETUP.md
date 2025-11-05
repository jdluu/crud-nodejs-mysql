# Database Setup Instructions

## MySQL Database Setup

This project uses MySQL server, not file-based databases. Follow these steps to set up the database:

### Step 1: Install MySQL (if not already installed)

**Windows:**
- Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
- Run the installer and complete the setup
- Remember your root password

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### Step 2: Create the Database

Open MySQL command line or MySQL Workbench and run:

```bash
mysql -u root -p
```

Then execute the SQL file:

```bash
mysql -u root -p < database/db.sql
```

Or manually in MySQL:

```sql
source database/db.sql;
```

### Step 3: Create .env File

Create a `.env` file in the project root:

```env
DATABASE_PASSWORD=your_mysql_root_password
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production
```

### Step 4: Verify Database Creation

Check if the database and tables were created:

```bash
mysql -u root -p
```

```sql
SHOW DATABASES;
USE crudnodejsmysql;
SHOW TABLES;
SELECT * FROM users;
```

You should see:
- Database: `crudnodejsmysql`
- Tables: `users`, `customer`, `customer_versions`, `activity_log`
- One user: `admin` / `admin123`

### Troubleshooting

**If MySQL connection fails:**
1. Check if MySQL service is running:
   - Windows: Services → MySQL
   - Mac/Linux: `sudo systemctl status mysql` or `brew services list`

2. Verify MySQL port (default: 3306)

3. Check your root password in `.env` file

4. Try connecting manually:
   ```bash
   mysql -u root -p
   ```

**If tables don't exist:**
- Run `database/db.sql` again
- Check for errors in MySQL output

**If user login fails:**
- Verify the admin user was created:
  ```sql
  SELECT * FROM users WHERE username = 'admin';
  ```

