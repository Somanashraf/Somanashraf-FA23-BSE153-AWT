# Library Management System - UI Screenshots Guide

This document describes the user interface and what you should see when running the application.

## Homepage

<img width="1919" height="878" alt="Screenshot 2026-03-08 234401" src="https://github.com/user-attachments/assets/c85b7c80-4d3a-4c80-aa6d-71ad016cd92d" />


### Description
- Clean, centered welcome card
- Brief introduction to the system
- Two call-to-action buttons: "View Books" and "View Members"
- Responsive navbar at top with all navigation links

### Key Elements
- Navbar: Library System branding, Home, Books, Members, API Docs, Add Book, Add Member
- Welcome message explaining the system
- Primary and outline-primary styled buttons

---

## Books Listing Page
<img width="1896" height="876" alt="image" src="https://github.com/user-attachments/assets/e5454929-e207-433d-816e-da96e65d4ef1" />


### Description
- Grid layout displaying books in Bootstrap cards (3 columns on desktop)
- Each card shows: Title, Author, ISBN, Published Year
- Action buttons: View, Edit, Delete
- "Add Book" button in top-right corner
- Pagination at bottom if more than 9 books

### Card Layout
```
┌─────────────────────────────┐
│ Book Title                  │
│ Author Name                 │
│ ISBN: 978-XXXXXXXXXX        │
│ Published: 2024             │
│ [View] [Edit] [Delete]      │
└─────────────────────────────┘
```

### Responsive Behavior
- Desktop: 3 cards per row
- Tablet: 2 cards per row
- Mobile: 1 card per row (stacked)

---

## Add Book Form

<img width="1898" height="870" alt="image" src="https://github.com/user-attachments/assets/17883264-3a51-439f-9bc0-0a22207b0a7d" />


### Description
- Centered form in a card (6 columns wide)
- Four input fields with labels
- Cancel and Save buttons at bottom
- Form validation with error messages

### Form Fields
1. **Title** (text input, required)
2. **Author** (text input, required)
3. **ISBN** (text input, required, unique)
4. **Published Year** (number input, required)

### Buttons
- Cancel (secondary, left) - returns to books list
- Save Book (primary, right) - submits form

---

## Edit Book Form
<img width="1890" height="873" alt="image" src="https://github.com/user-attachments/assets/793534d7-f217-47d2-8dd3-3727787cb4f6" />


### Description
- Same layout as Add Book form
- Fields pre-populated with existing book data
- Update button instead of Save button

### Features
- Validation errors displayed below each field
- ISBN uniqueness check (excluding current book)
- Year validation (1000 to current year)

---

## Book Details Page

**URL**: http://localhost:8000/books/{id}

### Description
- Centered card showing all book information
- Read-only display format
- Three action buttons at bottom

### Displayed Information
- Title
- Author
- ISBN
- Published Year

### Action Buttons
- Back to List (secondary)
- Edit (primary)
- Delete (danger)

---

## Members Listing Page

<img width="1879" height="881" alt="image" src="https://github.com/user-attachments/assets/7b998759-8932-4f7d-8ba9-b6461bae59a1" />


### Description
- Grid layout displaying members in Bootstrap cards (3 columns on desktop)
- Each card shows: Name, Email, Member Since date
- Action buttons: View, Edit, Delete
- "Add Member" button in top-right corner
- Pagination at bottom if more than 9 members

### Card Layout
```
┌─────────────────────────────┐
│ Member Name                 │
│ Email: member@example.com   │
│ Member Since: Mar 08, 2026  │
│ [View] [Edit] [Delete]      │
└─────────────────────────────┘
```

---

## Add Member Form
<img width="1911" height="874" alt="image" src="https://github.com/user-attachments/assets/70ecff64-2844-4aee-854c-68d519c57716" />


### Description
- Centered form in a card (6 columns wide)
- Three input fields with labels
- Cancel and Save buttons at bottom

### Form Fields
1. **Name** (text input, required)
2. **Email** (email input, required, unique)
3. **Membership Date** (date input, required, defaults to today)

### Buttons
- Cancel (secondary, left)
- Save Member (primary, right)

---

## Edit Member Form

<img width="1913" height="871" alt="image" src="https://github.com/user-attachments/assets/21802608-89d0-4530-a95e-c4fc448a9b73" />


### Description
- Same layout as Add Member form
- Fields pre-populated with existing member data
- Update button instead of Save button

---

## Member Details Page

**URL**: http://localhost:8000/members/{id}

### Description
- Centered card showing all member information
- Read-only display format
- Three action buttons at bottom

### Displayed Information
- Name
- Email
- Membership Date (formatted as "Month Day, Year")

---

## API Documentation Page

<img width="1893" height="874" alt="image" src="https://github.com/user-attachments/assets/b4acbea2-2e93-4886-9ac3-c68971ea7c9a" />


### Description
- Comprehensive documentation of all API endpoints
- Explanation of RESTful principles
- Tables showing HTTP methods, URIs, and descriptions

### Sections
1. **RESTful Principles**
   - Statelessness explanation
   - Idempotency explanation with examples

2. **Books API Endpoints**
   - Complete table of all book routes
   - HTTP method badges (color-coded)

3. **Members API Endpoints**
   - Complete table of all member routes
   - Includes hierarchical route example

4. **Resource & URI Design**
   - Plural nouns explanation
   - Hierarchical structure examples
   - No verbs in URIs principle

---

## Navbar (Present on All Pages)

### Desktop View
```
Library System | Home | Books | Members | API Docs | [Add Book] [Add Member]
```

### Mobile View
- Collapsed hamburger menu (☰)
- Expands to show all links vertically
- Action buttons stack below navigation links

---

## Color Scheme

### Primary Colors
- **Primary Blue**: Navbar background, primary buttons
- **Success Green**: "Add" buttons
- **Danger Red**: Delete buttons
- **Secondary Gray**: Cancel/Back buttons

### Bootstrap Classes Used
- `btn-primary` - Main action buttons
- `btn-success` - Create/Add buttons
- `btn-danger` - Delete buttons
- `btn-secondary` - Cancel/Back buttons
- `btn-outline-*` - Secondary actions

---

## Flash Messages

### Success Messages
- Green alert bar at top of content
- Appears after: Create, Update, Delete operations
- Auto-dismissible
- Examples:
  - "Book created successfully."
  - "Member updated successfully."
  - "Book deleted successfully."

---

## Validation Errors

### Display Format
- Red border around invalid input field
- Red error message below the field
- Appears when form submission fails validation

### Example Errors
- "The title field is required."
- "The isbn has already been taken."
- "The email must be a valid email address."

---

## Responsive Breakpoints

### Desktop (≥992px)
- 3-column card grid
- Full navbar with all links visible
- Wider form containers

### Tablet (768px - 991px)
- 2-column card grid
- Navbar may collapse depending on content

### Mobile (<768px)
- 1-column card grid (stacked)
- Collapsed hamburger menu
- Full-width buttons
- Stacked form buttons

---

## Typography

### Headings
- Page titles: `h3` class
- Card titles: `h5` class
- Section headings: `h6` class

### Text
- Body text: Default Bootstrap font stack
- Labels: `form-label` class with bold weight
- Muted text: `text-muted` class for secondary info

---

## Spacing

### Margins
- `mb-3` - Standard bottom margin for form groups
- `mb-4` - Larger margin for sections
- `mt-4` - Top margin for pagination

### Padding
- Cards: Default Bootstrap card padding
- Container: Bootstrap container padding
- Buttons: Default Bootstrap button padding

---

## Icons

This implementation uses text-only buttons. To enhance the UI, you could add:
- Font Awesome icons
- Bootstrap Icons
- Material Icons

---

## Accessibility Features

- Semantic HTML5 elements
- Form labels associated with inputs
- ARIA labels on navbar toggle
- Keyboard navigation support
- Focus states on interactive elements
- Confirmation dialogs for destructive actions

---

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Taking Screenshots

To document your implementation:

1. **Homepage**: Capture full page with navbar
2. **Books Listing**: Show grid with multiple books
3. **Add Book Form**: Show empty form
4. **Edit Book Form**: Show populated form
5. **Members Listing**: Show grid with multiple members
6. **Add Member Form**: Show form with validation error
7. **API Documentation**: Capture full page or key sections
8. **Mobile View**: Capture collapsed navbar and stacked cards

---

## UI Customization Notes

The current implementation uses:
- Bootstrap 5.3.3 via CDN
- Default Bootstrap color scheme
- Standard Bootstrap components
- No custom CSS (pure Bootstrap)

To customize:
- Edit `resources/css/app.css` for custom styles
- Modify color variables in Bootstrap
- Add custom JavaScript in `resources/js/app.js`

---

**Note**: Actual screenshots should be taken after running the application and saved in a `screenshots/` directory for complete documentation.
