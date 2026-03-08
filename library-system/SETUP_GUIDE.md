# Library Management System - Setup Guide

This guide will walk you through setting up the Library Management System step by step.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] PHP 8.2 or higher installed
- [ ] Composer installed
- [ ] MySQL 8.0 or higher installed and running
- [ ] A text editor or IDE
- [ ] Terminal/Command Prompt access

### Verify Prerequisites

Check your PHP version:
```bash
php -v
```

Check Composer:
```bash
composer --version
```

Check MySQL:
```bash
mysql --version
```

---

## Step-by-Step Installation

### Step 1: Navigate to Project Directory

```bash
cd library-system
```

### Step 2: Install Dependencies

Install all PHP packages using Composer:

```bash
composer install
```

This will download Laravel and all required packages. It may take a few minutes.

### Step 3: Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

**For Windows Command Prompt:**
```cmd
copy .env.example .env
```

### Step 4: Edit Database Configuration

Open the `.env` file in your text editor and update these lines:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=library_db
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

**Common MySQL credentials:**
- Username: `root`
- Password: (leave empty if no password, or enter your MySQL root password)

### Step 5: Generate Application Key

```bash
php artisan key:generate
```

This creates a unique encryption key for your application.

### Step 6: Create the Database

**Option A: Using MySQL Command Line**

```bash
mysql -u root -p
```

Then in MySQL prompt:
```sql
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Option B: Using phpMyAdmin**
1. Open phpMyAdmin in your browser
2. Click "New" in the left sidebar
3. Enter database name: `library_db`
4. Choose collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Option C: One-line command**
```bash
mysql -u root -p -e "CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 7: Run Database Migrations

Create all database tables:

```bash
php artisan migrate
```

You should see output like:
```
Migration table created successfully.
Migrating: 2026_03_08_000001_create_books_table
Migrated:  2026_03_08_000001_create_books_table
Migrating: 2026_03_08_000002_create_members_table
Migrated:  2026_03_08_000002_create_members_table
```

### Step 8: Seed Sample Data

Populate the database with sample books and members:

```bash
php artisan db:seed
```

This will create:
- 10 sample books
- 10 sample members

### Step 9: Start the Development Server

```bash
php artisan serve
```

You should see:
```
INFO  Server running on [http://127.0.0.1:8000].
```

**Keep this terminal window open!** The server runs in this window.

### Step 10: Access the Application

Open your web browser and visit:

- **Homepage**: http://localhost:8000
- **Books**: http://localhost:8000/books
- **Members**: http://localhost:8000/members
- **API Documentation**: http://localhost:8000/api-documentation

---

## Testing the Application

### Test Books CRUD

1. **View Books**: Click "Books" in navbar
2. **Add Book**: 
   - Click "Add Book" button
   - Fill in: Title, Author, ISBN, Published Year
   - Click "Save Book"
3. **Edit Book**: 
   - Click "Edit" on any book card
   - Modify fields
   - Click "Update Book"
4. **View Book**: Click "View" on any book card
5. **Delete Book**: Click "Delete" and confirm

### Test Members CRUD

1. **View Members**: Click "Members" in navbar
2. **Add Member**:
   - Click "Add Member" button
   - Fill in: Name, Email, Membership Date
   - Click "Save Member"
3. **Edit Member**: Click "Edit" on any member card
4. **View Member**: Click "View" on any member card
5. **Delete Member**: Click "Delete" and confirm

### Test Responsive Design

1. Resize your browser window to mobile size
2. Verify navbar collapses to hamburger menu
3. Verify cards stack vertically on small screens

---

## Common Issues and Solutions

### Issue: "Access denied for user"

**Solution**: Check your MySQL credentials in `.env` file
```env
DB_USERNAME=root
DB_PASSWORD=your_actual_password
```

### Issue: "Database 'library_db' doesn't exist"

**Solution**: Create the database first (see Step 6)

### Issue: "Address already in use"

**Solution**: Use a different port
```bash
php artisan serve --port=8001
```
Then access at http://localhost:8001

### Issue: "Class 'PDO' not found"

**Solution**: Enable PHP PDO extension
- Edit `php.ini`
- Uncomment: `extension=pdo_mysql`
- Restart PHP

### Issue: Migration errors

**Solution**: Reset and re-run migrations
```bash
php artisan migrate:fresh --seed
```
⚠️ Warning: This deletes all data!

### Issue: "No application encryption key"

**Solution**: Generate the key
```bash
php artisan key:generate
```

---

## Resetting the Application

To start fresh with clean data:

```bash
php artisan migrate:fresh --seed
```

This will:
1. Drop all tables
2. Re-run all migrations
3. Re-seed sample data

---

## Stopping the Server

To stop the development server:
- Press `Ctrl + C` in the terminal where server is running

---

## Next Steps

After successful setup:

1. ✅ Explore the Books and Members pages
2. ✅ Test all CRUD operations
3. ✅ Review the API Documentation page
4. ✅ Read DOCUMENTATION.md for technical details
5. ✅ Review GRADING_RUBRIC.md for evaluation criteria

---

## File Locations

Important files you may need to reference:

- **Configuration**: `.env`
- **Routes**: `routes/web.php`
- **Controllers**: `app/Http/Controllers/`
- **Models**: `app/Models/`
- **Views**: `resources/views/`
- **Migrations**: `database/migrations/`
- **Seeders**: `database/seeders/`

---

## Getting Help

If you encounter issues:

1. Check this guide's "Common Issues" section
2. Review Laravel documentation: https://laravel.com/docs
3. Check MySQL connection with: `php artisan tinker` then `DB::connection()->getPdo();`
4. View Laravel logs: `storage/logs/laravel.log`

---

## Success Checklist

- [ ] Composer dependencies installed
- [ ] .env file configured
- [ ] Application key generated
- [ ] Database created
- [ ] Migrations run successfully
- [ ] Sample data seeded
- [ ] Development server running
- [ ] Application accessible in browser
- [ ] Books CRUD operations working
- [ ] Members CRUD operations working
- [ ] API documentation page accessible

---

**Congratulations! Your Library Management System is now running.**

Visit http://localhost:8000 to start using the application.
