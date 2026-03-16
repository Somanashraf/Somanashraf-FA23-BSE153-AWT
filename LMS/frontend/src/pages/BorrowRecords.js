import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Alert, Badge, Modal, Form, Card } from 'react-bootstrap';
import { getAllBorrowRecords, borrowBook, returnBook } from '../services/borrowService';
import { getAllBooks } from '../services/bookService';
import { getAllMembers } from '../services/memberService';
import './BorrowRecords.css';

/**
 * Borrow Records Page Component
 * Modern table with modal and animations
 */
function BorrowRecords() {
  const [records, setRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [borrowData, setBorrowData] = useState({
    memberId: '',
    bookId: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, booksRes, membersRes] = await Promise.all([
        getAllBorrowRecords(),
        getAllBooks(),
        getAllMembers()
      ]);
      setRecords(recordsRes.data);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (e) => {
    e.preventDefault();
    try {
      await borrowBook(borrowData.memberId, {
        bookId: borrowData.bookId,
        dueDate: borrowData.dueDate
      });
      setShowModal(false);
      setBorrowData({ memberId: '', bookId: '', dueDate: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to borrow book.');
      console.error(err);
    }
  };

  const handleReturnBook = async (record) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await returnBook(record.memberId._id, record._id);
        fetchData();
      } catch (err) {
        setError('Failed to return book. Please try again.');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const variants = {
      borrowed: 'primary',
      returned: 'success',
      overdue: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="modern-spinner"></div>
          <p className="mt-3 text-muted">Loading records...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="borrow-container">
      {/* Header */}
      <Row className="mb-4 page-header">
        <Col>
          <h1 className="page-title">
            <span className="title-icon">📋</span>
            Borrow Records
          </h1>
        </Col>
        <Col xs="auto">
          <Button 
            className="btn-gradient-primary add-btn"
            onClick={() => setShowModal(true)}
          >
            <span className="btn-icon">📚</span> Borrow Book
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="modern-alert">
          {error}
        </Alert>
      )}

      <Card className="table-card">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="modern-table">
              <thead>
                <tr>
                  <th><span className="th-icon">👤</span> Member</th>
                  <th><span className="th-icon">📚</span> Book</th>
                  <th><span className="th-icon">📅</span> Borrow Date</th>
                  <th><span className="th-icon">⏰</span> Due Date</th>
                  <th><span className="th-icon">✅</span> Return Date</th>
                  <th><span className="th-icon">⚡</span> Status</th>
                  <th className="text-center"><span className="th-icon">⚙️</span> Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>No borrow records found</h3>
                        <p>Start by borrowing a book</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr key={record._id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td>
                        <div className="member-info">
                          <div className="member-avatar-small">
                            {record.memberId?.firstName?.charAt(0)}{record.memberId?.lastName?.charAt(0)}
                          </div>
                          <span>{record.memberId?.firstName} {record.memberId?.lastName}</span>
                        </div>
                      </td>
                      <td className="book-title-cell">{record.bookId?.title}</td>
                      <td>{formatDate(record.borrowDate)}</td>
                      <td>{formatDate(record.dueDate)}</td>
                      <td>{record.returnDate ? formatDate(record.returnDate) : <span className="text-muted">-</span>}</td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        <div className="action-buttons">
                          {record.status !== 'returned' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="action-btn-return"
                              onClick={() => handleReturnBook(record)}
                            >
                              ✓ Return
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Borrow Book Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modal-header-gradient">
          <Modal.Title>
            <span className="modal-icon">📚</span> Borrow Book
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-modern">
          <Form onSubmit={handleBorrowBook}>
            <Form.Group className="mb-4 modern-form-group">
              <Form.Label className="modern-label">
                <span className="label-icon">👤</span> Select Member *
              </Form.Label>
              <Form.Select
                value={borrowData.memberId}
                onChange={(e) => setBorrowData({ ...borrowData, memberId: e.target.value })}
                required
                className="modern-input"
              >
                <option value="">Choose a member...</option>
                {members.filter(m => m.status === 'active').map(member => (
                  <option key={member._id} value={member._id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4 modern-form-group">
              <Form.Label className="modern-label">
                <span className="label-icon">📚</span> Select Book *
              </Form.Label>
              <Form.Select
                value={borrowData.bookId}
                onChange={(e) => setBorrowData({ ...borrowData, bookId: e.target.value })}
                required
                className="modern-input"
              >
                <option value="">Choose a book...</option>
                {books.filter(b => b.availableCopies > 0).map(book => (
                  <option key={book._id} value={book._id}>
                    {book.title} ({book.availableCopies} available)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4 modern-form-group">
              <Form.Label className="modern-label">
                <span className="label-icon">📅</span> Due Date *
              </Form.Label>
              <Form.Control
                type="date"
                value={borrowData.dueDate}
                onChange={(e) => setBorrowData({ ...borrowData, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                className="modern-input"
              />
            </Form.Group>

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="btn-cancel">
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn-gradient-primary">
                <span className="btn-icon">✓</span> Borrow Book
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default BorrowRecords;
