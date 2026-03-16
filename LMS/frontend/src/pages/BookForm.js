import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { createBook, updateBook, getBookById } from '../services/bookService';
import './BookForm.css';

/**
 * Book Form Component
 * Modern form with animations and gradient styling
 */
function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    totalCopies: 1,
    availableCopies: 1
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await getBookById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load book details.');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required';
    if (formData.publishedYear && (formData.publishedYear < 1000 || formData.publishedYear > new Date().getFullYear())) {
      newErrors.publishedYear = 'Invalid year';
    }
    if (formData.totalCopies < 1) newErrors.totalCopies = 'Must be at least 1';
    if (formData.availableCopies < 0) newErrors.availableCopies = 'Cannot be negative';
    if (formData.availableCopies > formData.totalCopies) {
      newErrors.availableCopies = 'Cannot exceed total copies';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isEditMode) {
        await updateBook(id, formData);
      } else {
        await createBook(formData);
      }
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save book. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="form-container">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="form-header">
            <h2 className="form-title">
              <span className="form-icon">{isEditMode ? '✏️' : '➕'}</span>
              {isEditMode ? 'Edit Book' : 'Add New Book'}
            </h2>
            <p className="form-subtitle">
              {isEditMode ? 'Update book information' : 'Fill in the details to add a new book'}
            </p>
          </div>

          <Card className="modern-form-card">
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')} className="modern-alert">
                  <strong>Error!</strong> {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <div className="form-section">
                  <h5 className="section-title">📖 Basic Information</h5>
                  
                  <Form.Group className="mb-4 modern-form-group" controlId="title">
                    <Form.Label className="modern-label">
                      Book Title <span className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      isInvalid={!!errors.title}
                      placeholder="Enter book title"
                      className="modern-input"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.title}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4 modern-form-group" controlId="author">
                    <Form.Label className="modern-label">
                      Author <span className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      isInvalid={!!errors.author}
                      placeholder="Enter author name"
                      className="modern-input"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.author}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4 modern-form-group" controlId="isbn">
                    <Form.Label className="modern-label">
                      ISBN <span className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      isInvalid={!!errors.isbn}
                      placeholder="Enter ISBN"
                      disabled={isEditMode}
                      className="modern-input"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.isbn}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="form-section">
                  <h5 className="section-title">📚 Additional Details</h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4 modern-form-group" controlId="publishedYear">
                        <Form.Label className="modern-label">Published Year</Form.Label>
                        <Form.Control
                          type="number"
                          name="publishedYear"
                          value={formData.publishedYear}
                          onChange={handleChange}
                          isInvalid={!!errors.publishedYear}
                          placeholder="YYYY"
                          className="modern-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.publishedYear}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4 modern-form-group" controlId="genre">
                        <Form.Label className="modern-label">Genre</Form.Label>
                        <Form.Control
                          type="text"
                          name="genre"
                          value={formData.genre}
                          onChange={handleChange}
                          placeholder="e.g., Fiction, Science"
                          className="modern-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4 modern-form-group" controlId="totalCopies">
                        <Form.Label className="modern-label">
                          Total Copies <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="totalCopies"
                          value={formData.totalCopies}
                          onChange={handleChange}
                          isInvalid={!!errors.totalCopies}
                          min="1"
                          className="modern-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.totalCopies}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4 modern-form-group" controlId="availableCopies">
                        <Form.Label className="modern-label">
                          Available Copies <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="availableCopies"
                          value={formData.availableCopies}
                          onChange={handleChange}
                          isInvalid={!!errors.availableCopies}
                          min="0"
                          className="modern-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.availableCopies}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="form-actions">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/books')}
                    disabled={loading}
                    className="btn-cancel"
                  >
                    <span className="btn-icon">✖️</span> Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="btn-gradient-primary btn-submit"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">{isEditMode ? '💾' : '➕'}</span>
                        {isEditMode ? 'Update Book' : 'Add Book'}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default BookForm;
