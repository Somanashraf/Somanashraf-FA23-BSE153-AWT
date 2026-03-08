# Library Management System - Instructor Evaluation Guide

This guide helps instructors quickly evaluate and grade the Library Management System project.

---

## Quick Evaluation (5 Minutes)

### 1. Setup Verification (2 minutes)
```bash
cd library-system
composer install
cp .env.example .env
# Edit .env with database credentials
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### 2. Functional Testing (3 minutes)
- Visit http://localhost:8000
- Click "Books" → Verify 10 books display in cards
- Click "Add Book" → Submit form → Verify success message
- Click "Members" → Verify 10 members display in cards
- Click "API Docs" → Verify documentation page loads

---

## Detailed Evaluation by Rubric

### 1. Models & Scaffolding (25 points)

#### Check Models (10 points)
**Location**: `app/Models/`

**Book.php** - Check for:
- [ ] Fillable: title, author, isbn, published_year (5 points)

**Member.php** - Check for:
- [ ] Fillable: name, email, membership_date (5 points)

#### Check Migrations (8 points)
**Location**: `database/migrations/`

**2026_03_08_000001_create_books_table.php**:
- [ ] title (string) (1 point)
- [ ] author (string) (1 point)
- [ ] isbn (string, unique) (1 point)
- [ ] published_year (integer) (1 point)

**2026_03_08_000002_create_members_table.php**:
- [ ] name (string) (1 point)
- [ ] email (string, unique) (1 point)
- [ ] membership_date (date) (2 points)

#### Check Seeders (4 points)
**Location**: `database/seeders/`

- [ ] BookSeeder with sample data (2 points)
- [ ] MemberSeeder with sample data (2 points)

#### Check Controllers (3 points)
**Location**: `app/Http/Controllers/`

- [ ] BookController with CRUD methods (1.5 points)
- [ ] MemberController with CRUD methods (1.5 points)

**Subtotal: _____ / 25**

---

### 2. Bootstrap UI (20 points)

#### Layout & Grid (8 points)
**Check**: `resources/views/layouts/app.blade.php`

- [ ] Bootstrap 5 CDN link present (2 points)
- [ ] 12-column grid used (check row-cols-md-3) (3 points)
- [ ] Navbar with Home, Books, Members, Add Book, Add Member (3 points)

#### Card Components (6 points)
**Check**: `resources/views/books/index.blade.php` and `resources/views/members/index.blade.php`

- [ ] Books displayed in Bootstrap cards (3 points)
- [ ] Members displayed in Bootstrap cards (3 points)

#### Form Styling (6 points)
**Check**: `resources/views/books/create.blade.php` and `resources/views/members/create.blade.php`

- [ ] form-control, form-group, form-label classes used (3 points)
- [ ] Buttons: btn-primary, btn-success, btn-danger, btn-secondary (2 points)
- [ ] Proper spacing (mb-3, mt-4, etc.) (1 point)

**Subtotal: _____ / 20**

---

### 3. RESTful Method Mapping & Documentation (20 points)

#### HTTP Methods (10 points)
**Check**: `routes/web.php` and controllers

- [ ] GET for reading/listing (2 points)
- [ ] POST for creating (2 points)
- [ ] PUT/PATCH for updating (3 points)
- [ ] DELETE for deleting (3 points)

#### API Documentation (10 points)
**Check**: `resources/views/api-documentation.blade.php` or DOCUMENTATION.md

- [ ] Complete endpoints table with HTTP methods (4 points)
- [ ] Statelessness explanation (3 points)
- [ ] Idempotency explanation with examples (3 points)

**Subtotal: _____ / 20**

---

### 4. URI/Resource Design (20 points)

#### Resource Naming (8 points)
**Check**: `routes/web.php`

- [ ] Plural nouns used (/books, /members) (4 points)
- [ ] Lowercase naming (2 points)
- [ ] Proper resource identification (/books/{id}) (2 points)

#### Hierarchical Structure (8 points)
**Check**: `routes/web.php` for nested route

- [ ] /members/{id}/borrowed-books route exists (5 points)
- [ ] Route demonstrates parent-child relationship (3 points)

#### Route Implementation (4 points)
**Check**: `routes/web.php`

- [ ] Resource routes defined (Route::resource) (2 points)
- [ ] Route model binding used (check controller parameters) (2 points)

**Subtotal: _____ / 20**

---

### 5. Code Quality, Responsiveness & Documentation (15 points)

#### Code Quality (6 points)
**Check**: Controllers

- [ ] Type hints on methods (2 points)
- [ ] Request validation (2 points)
- [ ] Error handling and flash messages (2 points)

#### Responsiveness (4 points)
**Test**: Resize browser window

- [ ] Layout adapts to mobile (2 points)
- [ ] Navbar collapses on small screens (1 point)
- [ ] Cards stack on mobile (1 point)

#### Documentation (5 points)
**Check**: Root directory

- [ ] README with setup instructions (2 points)
- [ ] Complete documentation file (2 points)
- [ ] Clear run instructions (1 point)

**Subtotal: _____ / 15**

---

## Total Score Calculation

| Section | Points | Score |
|---------|--------|-------|
| Models & Scaffolding | 25 | _____ |
| Bootstrap UI | 20 | _____ |
| RESTful Method Mapping | 20 | _____ |
| URI/Resource Design | 20 | _____ |
| Code Quality & Docs | 15 | _____ |
| **TOTAL** | **100** | **_____** |

---

## Quick Grading Checklist

### Essential Files Present
- [ ] app/Models/Book.php
- [ ] app/Models/Member.php
- [ ] app/Http/Controllers/BookController.php
- [ ] app/Http/Controllers/MemberController.php
- [ ] database/migrations/*_create_books_table.php
- [ ] database/migrations/*_create_members_table.php
- [ ] database/seeders/BookSeeder.php
- [ ] database/seeders/MemberSeeder.php
- [ ] resources/views/layouts/app.blade.php
- [ ] resources/views/books/index.blade.php
- [ ] resources/views/members/index.blade.php
- [ ] routes/web.php
- [ ] README.md

### Functional Requirements
- [ ] Books CRUD works (Create, Read, Update, Delete)
- [ ] Members CRUD works
- [ ] Forms validate input
- [ ] Success messages appear
- [ ] Delete confirmations work
- [ ] Pagination works

### UI Requirements
- [ ] Bootstrap 5 integrated
- [ ] Responsive navbar
- [ ] Cards display properly
- [ ] Forms styled with Bootstrap
- [ ] Mobile responsive

### RESTful Requirements
- [ ] Correct HTTP methods used
- [ ] Resource routes implemented
- [ ] URIs use plural nouns
- [ ] No verbs in URIs
- [ ] Hierarchical route example

---

## Common Issues to Check

### Deductions
- **Missing unique constraints**: -2 points per field
- **No validation**: -3 points
- **Bootstrap not integrated**: -10 points
- **CRUD not working**: -5 points per resource
- **No documentation**: -5 points
- **Not responsive**: -4 points

### Bonus Points (Optional)
- API documentation page: +2 points
- Exceptional UI design: +2 points
- Extra features: +1 point

---

## Testing Commands

### Verify Database
```bash
php artisan migrate:status
```

### Check Routes
```bash
php artisan route:list
```

### Run Tests (if provided)
```bash
php artisan test
```

### Check for Errors
```bash
tail -f storage/logs/laravel.log
```

---

## Evaluation Time Estimate

- **Setup**: 5 minutes
- **Code Review**: 10 minutes
- **Functional Testing**: 5 minutes
- **Documentation Review**: 5 minutes
- **Grading**: 5 minutes
- **Total**: 30 minutes per submission

---

## Grade Ranges

| Score | Grade | Comments |
|-------|-------|----------|
| 90-100 | A | Excellent work, all requirements met |
| 80-89 | B | Good work, minor issues |
| 70-79 | C | Satisfactory, some requirements missing |
| 60-69 | D | Needs improvement, major issues |
| 0-59 | F | Incomplete or non-functional |

---

## Feedback Template

```
Student: _____________________
Date: _____________________

STRENGTHS:
- 
- 
- 

AREAS FOR IMPROVEMENT:
- 
- 
- 

SPECIFIC ISSUES:
- 
- 

GRADE BREAKDOWN:
- Models & Scaffolding: _____ / 25
- Bootstrap UI: _____ / 20
- RESTful Method Mapping: _____ / 20
- URI/Resource Design: _____ / 20
- Code Quality & Docs: _____ / 15

TOTAL SCORE: _____ / 100
FINAL GRADE: _____

COMMENTS:


INSTRUCTOR: _____________________
```

---

## Quick Reference: Expected Routes

```
GET    /                                   - Home page
GET    /books                              - List books
GET    /books/create                       - Create form
POST   /books                              - Store book
GET    /books/{id}                         - Show book
GET    /books/{id}/edit                    - Edit form
PUT    /books/{id}                         - Update book
DELETE /books/{id}                         - Delete book
GET    /members                            - List members
GET    /members/create                     - Create form
POST   /members                            - Store member
GET    /members/{id}                       - Show member
GET    /members/{id}/edit                  - Edit form
PUT    /members/{id}                       - Update member
DELETE /members/{id}                       - Delete member
GET    /members/{id}/borrowed-books        - Hierarchical example
```

---

## Troubleshooting Student Submissions

### "Database connection failed"
- Check .env file exists and has correct credentials
- Verify database was created

### "Class not found"
- Run `composer install`
- Check autoload: `composer dump-autoload`

### "No application encryption key"
- Run `php artisan key:generate`

### "Table doesn't exist"
- Run `php artisan migrate`

### "No data showing"
- Run `php artisan db:seed`

---

## Contact for Issues

If you encounter problems evaluating this submission:
1. Check SETUP_GUIDE.md for detailed instructions
2. Review DOCUMENTATION.md for technical details
3. Check storage/logs/laravel.log for errors

---

**This guide should enable efficient and consistent grading of all submissions.**
