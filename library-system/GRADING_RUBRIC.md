# Library Management System - Grading Rubric

**Total Points: 100**

---

## 1. Models & Scaffolding (25 points)

### Eloquent Models (10 points)
- [ ] Book model with correct fillable attributes (title, author, isbn, published_year) - **5 points**
- [ ] Member model with correct fillable attributes (name, email, membership_date) - **5 points**

### Database Migrations (8 points)
- [ ] Books table migration with proper column types and unique constraint on ISBN - **4 points**
- [ ] Members table migration with proper column types and unique constraint on email - **4 points**

### Seeders (4 points)
- [ ] BookSeeder with sample data - **2 points**
- [ ] MemberSeeder with sample data - **2 points**

### Controllers (3 points)
- [ ] BookController with full CRUD methods - **1.5 points**
- [ ] MemberController with full CRUD methods - **1.5 points**

---

## 2. Bootstrap UI (20 points)

### Layout & Grid System (8 points)
- [ ] Bootstrap 5 properly integrated via CDN - **2 points**
- [ ] Responsive 12-column grid layout implemented - **3 points**
- [ ] Responsive navbar with all required links (Home, Books, Members, Add Book, Add Member) - **3 points**

### Card Components (6 points)
- [ ] Books listing page displays items in Bootstrap cards - **3 points**
- [ ] Members listing page displays items in Bootstrap cards - **3 points**

### Form Styling (6 points)
- [ ] All forms use Bootstrap classes (form-control, form-group, form-label) - **3 points**
- [ ] Buttons properly styled (btn-primary, btn-success, btn-danger, btn-secondary) - **2 points**
- [ ] Proper spacing and layout consistency - **1 point**

---

## 3. RESTful Method Mapping & Documentation (20 points)

### HTTP Methods (10 points)
- [ ] GET methods for reading/listing resources - **2 points**
- [ ] POST methods for creating resources - **2 points**
- [ ] PUT/PATCH methods for updating resources - **3 points**
- [ ] DELETE methods for deleting resources - **3 points**

### API Documentation (10 points)
- [ ] Complete API endpoints table with HTTP methods - **4 points**
- [ ] Statelessness explanation provided - **3 points**
- [ ] Idempotency explanation with examples - **3 points**

---

## 4. URI/Resource Design (20 points)

### Resource Naming (8 points)
- [ ] All URIs use plural nouns (no verbs) - **4 points**
- [ ] Consistent lowercase naming convention - **2 points**
- [ ] Proper resource identification (/books/{id}, /members/{id}) - **2 points**

### Hierarchical Structure (8 points)
- [ ] Nested resource route implemented (/members/{id}/borrowed-books) - **5 points**
- [ ] Route demonstrates parent-child relationship - **3 points**

### Route Implementation (4 points)
- [ ] Resource routes properly defined in web.php - **2 points**
- [ ] Route model binding utilized - **2 points**

---

## 5. Code Quality, Responsiveness & Documentation (15 points)

### Code Quality (6 points)
- [ ] Type hints used in controller methods - **2 points**
- [ ] Request validation implemented - **2 points**
- [ ] Proper error handling and flash messages - **2 points**

### Responsiveness (4 points)
- [ ] Layout adapts to mobile screens - **2 points**
- [ ] Navbar collapses on small screens - **1 point**
- [ ] Cards stack properly on mobile - **1 point**

### Documentation Completeness (5 points)
- [ ] README with setup instructions - **2 points**
- [ ] Complete documentation file (DOCUMENTATION.md) - **2 points**
- [ ] Clear explanation of how to run the project - **1 point**

---

## Bonus Points (Optional, up to 5 points)

- [ ] Additional features beyond requirements - **2 points**
- [ ] Exceptional UI/UX design - **2 points**
- [ ] Comprehensive code comments - **1 point**

---

## Grading Scale

| Points | Grade |
|--------|-------|
| 90-100 | A |
| 80-89  | B |
| 70-79  | C |
| 60-69  | D |
| 0-59   | F |

---

## Evaluation Notes

### Strengths:
- 

### Areas for Improvement:
- 

### Overall Comments:
- 

---

**Total Score: _____ / 100**

**Final Grade: _____**

**Evaluator: _____________________**

**Date: _____________________**
