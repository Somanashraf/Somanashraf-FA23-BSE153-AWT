import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllBooks, deleteBook } from '../services/bookService';
import './Books.css';

/**
 * Books Page Component
 * Modern card grid with animations and hover effects
 */
function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getAllBooks();
      setBooks(response.data);
      setFilteredBooks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    if (!searchTerm) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(id);
        fetchBooks();
      } catch (err) {
        setError('Failed to delete book. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="modern-spinner"></div>
          <p className="mt-3 text-muted">Loading books...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="books-container">
      {/* Header */}
      <Row className="mb-4 page-header">
        <Col>
          <h1 className="page-title">
            <span className="title-icon">📚</span>
            Books Collection
          </h1>
        </Col>
        <Col xs="auto">
          <Button 
            className="btn-gradient-primary add-btn"
            onClick={() => navigate('/books/new')}
          >
            <span className="btn-icon">➕</span> Add New Book
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="modern-alert">
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <Form.Control
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-search"
            />
          </div>
        </Col>
        <Col md={6} className="text-end">
          <div className="results-count">
            Found <span className="count-number">{filteredBooks.length}</span> books
          </div>
        </Col>
      </Row>

      {/* Books Grid */}
      <Row className="g-4 books-grid">
        {filteredBooks.length === 0 ? (
          <Col>
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <h3>No books found</h3>
              <p>Try adjusting your search or add a new book</p>
            </div>
          </Col>
        ) : (
          filteredBooks.map((book, index) => (
            <Col key={book._id} xs={12} md={6} lg={4}>
              <Card className="book-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="book-icon-wrapper">
                  <div className="book-icon-large">📚</div>
                  <Badge className={`availability-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                    {book.availableCopies > 0 ? '✓ Available' : '✗ Unavailable'}
                  </Badge>
                </div>
                <Card.Body className="book-body">
                  <Card.Title className="book-title">{book.title}</Card.Title>
                  <Card.Subtitle className="book-author">
                    <span className="author-icon">✍️</span> {book.author}
                  </Card.Subtitle>
                  <div className="book-details">
                    <div className="detail-item">
                      <span className="detail-label">ISBN:</span>
                      <span className="detail-value">{book.isbn}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Year:</span>
                      <span className="detail-value">{book.publishedYear}</span>
                    </div>
                    {book.genre && (
                      <div className="detail-item">
                        <Badge className="genre-badge">{book.genre}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="book-footer">
                    <div className="copies-info">
                      <span className="copies-available">{book.availableCopies}</span>
                      <span className="copies-separator">/</span>
                      <span className="copies-total">{book.totalCopies}</span>
                      <span className="copies-label">copies</span>
                    </div>
                    <div className="action-buttons">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="action-btn-edit"
                        onClick={() => navigate(`/books/edit/${book._id}`)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="action-btn-delete"
                        onClick={() => handleDelete(book._id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

export default Books;
