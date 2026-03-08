# Library Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Bootstrap UI Implementation](#bootstrap-ui-implementation)
3. [RESTful API Design](#restful-api-design)
4. [Database Schema](#database-schema)
5. [Installation Guide](#installation-guide)

---

## Project Overview

This is a complete Library Management System built with Laravel 11, demonstrating professional RESTful API design and modern Bootstrap 5 UI implementation.

### Features
- Full CRUD operations for Books and Members
- RESTful resource routing
- Responsive Bootstrap 5 interface
- Form validation and error handling
- Pagination support
- Flash message notifications
- Hierarchical URI structure demonstration

---

## Bootstrap UI Implementation

### Grid System
The application uses Bootstrap's 12-column grid system for responsive layouts:

- **Listing Pages**: 3-column grid on medium+ screens (`row-cols-md-3`)
- **Forms**: Centered 6-column layout (`col-lg-6`)
- **Documentation**: 10-column centered layout (`col-lg-10`)

### Components Used

#### Navbar
- Responsive navbar with collapse functionality
- Active link highlighting
- Primary color scheme (`navbar-dark bg-primary`)
- Quick action buttons in navbar

#### Cards
- Books and Members displayed in Bootstrap cards
- Shadow effects (`shadow-sm`)
- Full-height cards (`h-100`)
- Flexbox layout for button positioning

#### Forms
- `form-control` classes for inputs
- `form-group` for proper spacing
- `form-label` for accessibility
- Validation feedback with `is-invalid` and `invalid-feedback`

#### Buttons
- `btn-primary` for main actions
- `btn-success` for create actions
- `btn-danger` for delete actions
- `btn-secondary` for cancel/back actions
- `btn-outline-*` for secondary actions

#### Alerts
- Success messages with `alert-success`
- Info messages with `alert-info`
- Dismissible alerts for user feedback

---

## RESTful API Design

### HTTP Methods Mapping

| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Retrieve resources | Yes |
| POST | Create new resources | No |
| PUT/PATCH | Update existing resources | Yes |
| DELETE | Remove resources | Yes |

### Statelessness

The API follows REST's stateless constraint:
- Each request contains all necessary information
- No client context stored on server between requests
- Session data used only for web UI flash messages

### Idempotency Explained

**Idempotent Operations** (same result regardless of repetition):
- `GET /books/1` - Reading the same book multiple times returns identical data
- `PUT /books/1` - Updating with same data produces same final state
- `DELETE /books/1` - Deleting multiple times has same effect (resource deleted)

**Non-Idempotent Operations**:
- `POST /books` - Creating multiple times produces multiple resources

### API Endpoints

#### Books Resource
```
GET    /books              - List all books
GET    /books/create       - Show create form
POST   /books              - Store new book
GET    /books/{id}         - Show specific book
GET    /books/{id}/edit    - Show edit form
PUT    /books/{id}         - Update book
DELETE /books/{id}         - Delete book
```

#### Members Resource
```
GET    /members                        - List all members
GET    /members/create                 - Show create form
POST   /members                        - Store new member
GET    /members/{id}                   - Show specific member
GET    /members/{id}/edit              - Show edit form
PUT    /members/{id}                   - Update member
DELETE /members/{id}                   - Delete member
GET    /members/{id}/borrowed-books    - Hierarchical resource example
```

### URI Design Principles

1. **Plural Nouns**: Resources use plural nouns (`/books`, `/members`)
2. **No Verbs**: Actions defined by HTTP methods, not URIs
3. **Hierarchical Structure**: Nested resources show relationships (`/members/{id}/borrowed-books`)
4. **Consistent Naming**: Lowercase with hyphens for multi-word resources

---

## Database Schema

### Books Table
```sql
- id (primary key)
- title (string)
- author (string)
- isbn (string, unique)
- published_year (integer)
- timestamps
```

### Members Table
```sql
- id (primary key)
- name (string)
- email (string, unique)
- membership_date (date)
- timestamps
```

---

## Installation Guide

### Prerequisites
- PHP 8.2 or higher
- Composer
- MySQL 8.0 or higher
- Node.js & npm (optional, for asset compilation)

### Setup Steps

1. **Clone/Extract the project**
   ```bash
   cd library-system
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set database credentials:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=library_db
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

4. **Generate application key**
   ```bash
   php artisan key:generate
   ```

5. **Create database**
   ```sql
   CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed sample data**
   ```bash
   php artisan db:seed
   ```

8. **Start development server**
   ```bash
   php artisan serve
   ```

9. **Access the application**
   - Open browser: `http://localhost:8000`
   - View API Documentation: `http://localhost:8000/api-documentation`

### Testing the Application

1. Navigate to Books page and add a new book
2. Navigate to Members page and add a new member
3. Test edit and delete functionality
4. View API documentation page
5. Test responsive design by resizing browser

---

## Code Quality Features

- Type hints for all controller methods
- Request validation with custom rules
- Eloquent ORM for database operations
- Route model binding for automatic model resolution
- Blade templating with component reuse
- CSRF protection on all forms
- Mass assignment protection
- Proper HTTP status codes
- Consistent code formatting
- Comprehensive comments

---

## Project Structure

```
library-system/
├── app/
│   ├── Http/Controllers/
│   │   ├── BookController.php
│   │   └── MemberController.php
│   └── Models/
│       ├── Book.php
│       └── Member.php
├── database/
│   ├── migrations/
│   │   ├── 2026_03_08_000001_create_books_table.php
│   │   └── 2026_03_08_000002_create_members_table.php
│   └── seeders/
│       ├── BookSeeder.php
│       └── MemberSeeder.php
├── resources/
│   └── views/
│       ├── layouts/
│       │   └── app.blade.php
│       ├── books/
│       │   ├── index.blade.php
│       │   ├── create.blade.php
│       │   ├── edit.blade.php
│       │   └── show.blade.php
│       ├── members/
│       │   ├── index.blade.php
│       │   ├── create.blade.php
│       │   ├── edit.blade.php
│       │   ├── show.blade.php
│       │   └── borrowed-books.blade.php
│       ├── home.blade.php
│       └── api-documentation.blade.php
└── routes/
    └── web.php
```

---

## Support

For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs
- Bootstrap Documentation: https://getbootstrap.com/docs
