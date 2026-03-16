import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

/**
 * Navigation Bar Component
 * Modern gradient navbar with smooth animations
 */
function NavigationBar() {
  const location = useLocation();

  return (
    <Navbar expand="lg" sticky="top" className="modern-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Library Management</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              <i className="bi bi-house-door"></i> Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/books"
              className={location.pathname.includes('/books') ? 'active' : ''}
            >
              <i className="bi bi-book"></i> Books
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/members"
              className={location.pathname.includes('/members') ? 'active' : ''}
            >
              <i className="bi bi-people"></i> Members
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/borrow-records"
              className={location.pathname === '/borrow-records' ? 'active' : ''}
            >
              <i className="bi bi-bookmark-check"></i> Records
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
