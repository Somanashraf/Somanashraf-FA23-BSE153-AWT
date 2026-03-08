# Library Management System

A complete, professional Library Management System built with Laravel 11 and Bootstrap 5, demonstrating RESTful API design principles and modern web development practices.

## Features

- **Full CRUD Operations** for Books and Members
- **RESTful Architecture** with proper HTTP method mapping
- **Bootstrap 5 UI** with responsive design
- **Resource Routing** with hierarchical URI structure
- **Form Validation** with error handling
- **Pagination** for large datasets
- **Flash Messages** for user feedback
- **API Documentation** page

## Technology Stack

- **Backend**: Laravel 11
- **Frontend**: Bootstrap 5, Blade Templates
- **Database**: MySQL 8.0+
- **PHP**: 8.2+

## Quick Start

### Prerequisites

Ensure you have the following installed:
- PHP 8.2 or higher
- Composer
- MySQL 8.0 or higher
- Git (optional)

### Installation Steps

1. **Navigate to project directory**
   ```bash
   cd library-system
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file and update database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=library_db
   DB_USERNAME=your_mysql_username
   DB_PASSWORD=your_mysql_password
   ```

4. **Generate application key**
   ```bash
   php artisan key:generate
   ```

5. **Create the database**
   
   Open MySQL and run:
   ```sql
   CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   
   Or use command line:
   ```bash
   mysql -u your_username -p -e "CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed sample data**
   ```bash
   php artisan db:seed
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   ```

9. **Access the application**
   
   Open your browser and navigate to:
   - **Home**: http://localhost:8000
   - **Books**: http://localhost:8000/books
   - **Members**: http://localhost:8000/members
   - **API Documentation**: http://localhost:8000/api-documentation

## Project Structure

```
library-system/
├── app/
│   ├── Http/Controllers/
│   │   ├── BookController.php       # Books CRUD operations
│   │   └── MemberController.php     # Members CRUD operations
│   └── Models/
│       ├── Book.php                 # Book model
│       └── Member.php               # Member model
├── database/
│   ├── migrations/
│   │   ├── 2026_03_08_000001_create_books_table.php
│   │   └── 2026_03_08_000002_create_members_table.php
│   └── seeders/
│       ├── BookSeeder.php           # Sample book data
│       └── MemberSeeder.php         # Sample member data
├── resources/views/
│   ├── layouts/
│   │   └── app.blade.php            # Main layout with navbar
│   ├── books/                       # Book views
│   ├── members/                     # Member views
│   ├── home.blade.php               # Homepage
│   └── api-documentation.blade.php  # API docs
├── routes/
│   └── web.php                      # Application routes
├── DOCUMENTATION.md                 # Complete documentation
├── GRADING_RUBRIC.md               # Grading criteria
└── README.md                        # This file
```

## RESTful API Endpoints

### Books Resource

| Method | URI | Action | Description |
|--------|-----|--------|-------------|
| GET | /books | index | List all books |
| GET | /books/create | create | Show create form |
| POST | /books | store | Create new book |
| GET | /books/{id} | show | Show specific book |
| GET | /books/{id}/edit | edit | Show edit form |
| PUT/PATCH | /books/{id} | update | Update book |
| DELETE | /books/{id} | destroy | Delete book |

### Members Resource

| Method | URI | Action | Description |
|--------|-----|--------|-------------|
| GET | /members | index | List all members |
| GET | /members/create | create | Show create form |
| POST | /members | store | Create new member |
| GET | /members/{id} | show | Show specific member |
| GET | /members/{id}/edit | edit | Show edit form |
| PUT/PATCH | /members/{id} | update | Update member |
| DELETE | /members/{id} | destroy | Delete member |
| GET | /members/{id}/borrowed-books | borrowedBooks | List borrowed books |

## Database Schema

### Books Table
- `id` - Primary key
- `title` - Book title (string)
- `author` - Author name (string)
- `isbn` - ISBN number (string, unique)
- `published_year` - Publication year (integer)
- `timestamps` - Created/updated timestamps

### Members Table
- `id` - Primary key
- `name` - Member name (string)
- `email` - Email address (string, unique)
- `membership_date` - Date of membership (date)
- `timestamps` - Created/updated timestamps

## Bootstrap UI Components

The application uses Bootstrap 5 with the following components:

- **Navbar**: Responsive navigation with collapse functionality
- **Cards**: Display books and members in card layout
- **Forms**: Styled with form-control, form-group, and validation feedback
- **Buttons**: Color-coded actions (primary, success, danger, secondary)
- **Grid System**: Responsive 12-column layout
- **Alerts**: Flash messages for user feedback
- **Pagination**: Bootstrap-styled pagination links

## RESTful Design Principles

### Statelessness
Each HTTP request contains all necessary information. The server does not store client context between requests.

### Idempotency
- **GET, PUT, DELETE**: Idempotent operations (same result on multiple executions)
- **POST**: Non-idempotent (creates new resources each time)

### Resource-Based URIs
- Uses plural nouns: `/books`, `/members`
- No verbs in URIs (actions defined by HTTP methods)
- Hierarchical structure: `/members/{id}/borrowed-books`

## Testing the Application

1. **View Books**: Navigate to Books page and browse the sample data
2. **Add Book**: Click "Add Book" and fill in the form
3. **Edit Book**: Click "Edit" on any book card
4. **Delete Book**: Click "Delete" (with confirmation)
5. **Repeat for Members**: Test all CRUD operations
6. **Check Responsiveness**: Resize browser to test mobile layout
7. **View API Docs**: Navigate to API Documentation page

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check `.env` database credentials
- Ensure `library_db` database exists

### Migration Errors
- Run `php artisan migrate:fresh` to reset database
- Check MySQL user has proper permissions

### Seeder Errors
- Ensure migrations ran successfully first
- Run `php artisan db:seed --class=BookSeeder` individually

### Port Already in Use
- Use different port: `php artisan serve --port=8001`

## Documentation

For complete documentation, see:
- **DOCUMENTATION.md** - Comprehensive technical documentation
- **GRADING_RUBRIC.md** - Evaluation criteria (100 points)
- **API Documentation Page** - Available at `/api-documentation` when running

## Requirements Met

✅ Laravel project with MySQL database  
✅ Book and Member Eloquent models  
✅ Full CRUD controllers with resource scaffolding  
✅ Database migrations with unique constraints  
✅ Sample data seeders  
✅ Bootstrap 5 integration via CDN  
✅ Responsive 12-column grid layout  
✅ Books and Members displayed in Bootstrap cards  
✅ Responsive navbar with all required links  
✅ Forms styled with Bootstrap classes  
✅ RESTful HTTP method mapping (GET, POST, PUT, DELETE)  
✅ API documentation with statelessness and idempotency explanations  
✅ Resource-based URIs with plural nouns  
✅ Hierarchical URI structure demonstration  
✅ Complete documentation and grading rubric  

## License

This project is created for educational purposes.

## Author

Created as a demonstration of Laravel and RESTful API best practices.

---

**For detailed setup instructions and API documentation, visit the application at http://localhost:8000 after installation.**
