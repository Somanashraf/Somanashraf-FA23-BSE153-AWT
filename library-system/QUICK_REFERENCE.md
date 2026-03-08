# Library Management System - Quick Reference Card

One-page reference for the most important information.

---

## Installation (5 Commands)

```bash
composer install
cp .env.example .env
# Edit .env with database credentials
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Visit: http://localhost:8000

---

## Project Structure

```
app/
├── Http/Controllers/
│   ├── BookController.php      # Books CRUD
│   └── MemberController.php    # Members CRUD
└── Models/
    ├── Book.php                # Book model
    └── Member.php              # Member model

database/
├── migrations/
│   ├── *_create_books_table.php
│   └── *_create_members_table.php
└── seeders/
    ├── BookSeeder.php          # 10 sample books
    └── MemberSeeder.php        # 10 sample members

resources/views/
├── layouts/app.blade.php       # Master layout
├── books/                      # 4 book views
├── members/                    # 5 member views
└── api-documentation.blade.php # API docs

routes/web.php                  # All routes
```

---

## Routes

### Books
```
GET    /books              List
GET    /books/create       Create form
POST   /books              Store
GET    /books/{id}         Show
GET    /books/{id}/edit    Edit form
PUT    /books/{id}         Update
DELETE /books/{id}         Delete
```

### Members
```
GET    /members                        List
GET    /members/create                 Create form
POST   /members                        Store
GET    /members/{id}                   Show
GET    /members/{id}/edit              Edit form
PUT    /members/{id}                   Update
DELETE /members/{id}                   Delete
GET    /members/{id}/borrowed-books    Hierarchical
```

---

## Database Schema

### books
- id (PK)
- title (string)
- author (string)
- isbn (string, unique)
- published_year (integer)
- timestamps

### members
- id (PK)
- name (string)
- email (string, unique)
- membership_date (date)
- timestamps

---

## Key Files

| Purpose | File |
|---------|------|
| Quick Start | README.md |
| Installation | SETUP_GUIDE.md |
| Technical | DOCUMENTATION.md |
| Grading | GRADING_RUBRIC.md |
| Features | FEATURES.md |
| This Card | QUICK_REFERENCE.md |

---

## Common Commands

```bash
# Install dependencies
composer install

# Generate key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed data
php artisan db:seed

# Reset database
php artisan migrate:fresh --seed

# Start server
php artisan serve

# List routes
php artisan route:list

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

---

## Environment Setup

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=library_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

---

## Bootstrap Classes Used

### Layout
- `container` - Main container
- `row` - Grid row
- `col-*` - Grid columns
- `row-cols-md-3` - 3 columns on medium+

### Components
- `card` - Card container
- `card-body` - Card content
- `navbar` - Navigation bar
- `alert` - Messages

### Forms
- `form-control` - Input styling
- `form-group` - Form field wrapper
- `form-label` - Label styling
- `is-invalid` - Error state
- `invalid-feedback` - Error message

### Buttons
- `btn-primary` - Main actions
- `btn-success` - Create actions
- `btn-danger` - Delete actions
- `btn-secondary` - Cancel/back

---

## Validation Rules

### Book
- title: required, string, max:255
- author: required, string, max:255
- isbn: required, string, max:32, unique
- published_year: required, integer, min:1000, max:current_year

### Member
- name: required, string, max:255
- email: required, email, max:255, unique
- membership_date: required, date

---

## RESTful Principles

### HTTP Methods
- **GET**: Read (idempotent)
- **POST**: Create (not idempotent)
- **PUT/PATCH**: Update (idempotent)
- **DELETE**: Delete (idempotent)

### URI Design
- ✅ Plural nouns: /books, /members
- ✅ No verbs: Use HTTP methods
- ✅ Hierarchical: /members/{id}/borrowed-books
- ❌ Avoid: /getBooks, /createMember

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Access denied | Check .env credentials |
| Database not found | Create database first |
| Port in use | Use --port=8001 |
| Class not found | Run composer install |
| No app key | Run key:generate |
| Table not found | Run migrations |

---

## Testing Checklist

- [ ] Books list displays
- [ ] Can create book
- [ ] Can edit book
- [ ] Can delete book
- [ ] Members list displays
- [ ] Can create member
- [ ] Can edit member
- [ ] Can delete member
- [ ] Forms validate
- [ ] Responsive on mobile
- [ ] API docs accessible

---

## Grading Breakdown

| Section | Points |
|---------|--------|
| Models & Scaffolding | 25 |
| Bootstrap UI | 20 |
| RESTful Methods | 20 |
| URI Design | 20 |
| Code Quality | 15 |
| **Total** | **100** |

---

## URLs

- **Home**: http://localhost:8000
- **Books**: http://localhost:8000/books
- **Members**: http://localhost:8000/members
- **API Docs**: http://localhost:8000/api-documentation

---

## Tech Stack

- **Backend**: Laravel 11, PHP 8.2+
- **Frontend**: Bootstrap 5.3.3, Blade
- **Database**: MySQL 8.0+
- **Tools**: Composer, Artisan

---

## Support

1. Check SETUP_GUIDE.md
2. Review DOCUMENTATION.md
3. Check storage/logs/laravel.log
4. Verify prerequisites installed

---

## Quick Stats

- **Routes**: 16
- **Views**: 11
- **Controllers**: 2
- **Models**: 2
- **Migrations**: 2
- **Seeders**: 2
- **Sample Data**: 20 records
- **Documentation**: 10 files

---

**Print this page for quick reference while working!**
