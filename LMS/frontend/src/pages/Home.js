import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { getAllBooks } from '../services/bookService';
import { getAllMembers } from '../services/memberService';
import { getAllBorrowRecords } from '../services/borrowService';
import './Home.css';

/**
 * Home Page Component
 * Modern dashboard with animated statistics cards
 */
function Home() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    booksBorrowed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [booksRes, membersRes, borrowsRes] = await Promise.all([
        getAllBooks(),
        getAllMembers(),
        getAllBorrowRecords()
      ]);

      const activeBorrows = borrowsRes.data.filter(
        record => record.status === 'borrowed' || record.status === 'overdue'
      ).length;

      setStats({
        totalBooks: booksRes.count || 0,
        totalMembers: membersRes.count || 0,
        booksBorrowed: activeBorrows
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="home-container">
      {/* Hero Section */}
      <Row className="mb-5 hero-section">
        <Col>
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">Library Management</span>
            </h1>
            <p className="hero-subtitle">
              Manage your library's books, members, and borrowing records efficiently
            </p>
            <div className="hero-decoration">
              <span className="decoration-icon">📖</span>
              <span className="decoration-icon">✨</span>
              <span className="decoration-icon">🎯</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="g-4 stats-row">
        <Col xs={12} md={4}>
          <Card className="stat-card stat-card-books">
            <Card.Body>
              <div className="stat-icon-wrapper">
                <div className="stat-icon books-icon">📚</div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalBooks}</h3>
                <p className="stat-label">Total Books</p>
                <div className="stat-bar books-bar"></div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="stat-card stat-card-members">
            <Card.Body>
              <div className="stat-icon-wrapper">
                <div className="stat-icon members-icon">👥</div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalMembers}</h3>
                <p className="stat-label">Total Members</p>
                <div className="stat-bar members-bar"></div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="stat-card stat-card-borrowed">
            <Card.Body>
              <div className="stat-icon-wrapper">
                <div className="stat-icon borrowed-icon">📖</div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.booksBorrowed}</h3>
                <p className="stat-label">Books Borrowed</p>
                <div className="stat-bar borrowed-bar"></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-5">
        <Col>
          <div className="quick-actions">
            <h3 className="section-title">Quick Actions</h3>
            <div className="action-buttons">
              <a href="/books/new" className="action-btn action-btn-primary">
                <span className="action-icon">➕</span>
                <span>Add Book</span>
              </a>
              <a href="/members/new" className="action-btn action-btn-success">
                <span className="action-icon">👤</span>
                <span>Add Member</span>
              </a>
              <a href="/borrow-records" className="action-btn action-btn-info">
                <span className="action-icon">📋</span>
                <span>View Records</span>
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
