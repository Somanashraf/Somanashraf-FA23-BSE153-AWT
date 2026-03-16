import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { createMember, updateMember, getMemberById } from '../services/memberService';
import './MemberForm.css';

/**
 * Member Form Component
 * Modern form with animations and gradient styling
 */
function MemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      const response = await getMemberById(id);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load member details.');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
        await updateMember(id, formData);
      } else {
        await createMember(formData);
      }
      navigate('/members');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save member. Please try again.');
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
              <span className="form-icon">{isEditMode ? '✏️' : '👤'}</span>
              {isEditMode ? 'Edit Member' : 'Add New Member'}
            </h2>
            <p className="form-subtitle">
              {isEditMode ? 'Update member information' : 'Register a new library member'}
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
                  <h5 className="section-title">👤 Personal Information</h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4 modern-form-group" controlId="firstName">
                        <Form.Label className="modern-label">
                          First Name <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          isInvalid={!!errors.firstName}
                          placeholder="Enter first name"
                          className="modern-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4 modern-form-group" controlId="lastName">
                        <Form.Label className="modern-label">
                          Last Name <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          isInvalid={!!errors.lastName}
                          placeholder="Enter last name"
                          className="modern-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="form-section">
                  <h5 className="section-title">📧 Contact Information</h5>
                  
                  <Form.Group className="mb-4 modern-form-group" controlId="email">
                    <Form.Label className="modern-label">
                      Email Address <span className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      placeholder="Enter email address"
                      disabled={isEditMode}
                      className="modern-input"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4 modern-form-group" controlId="phoneNumber">
                    <Form.Label className="modern-label">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="modern-input"
                    />
                  </Form.Group>
                </div>

                {isEditMode && (
                  <div className="form-section">
                    <h5 className="section-title">⚡ Account Status</h5>
                    
                    <Form.Group className="mb-4 modern-form-group" controlId="status">
                      <Form.Label className="modern-label">Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="modern-input"
                      >
                        <option value="active">✓ Active</option>
                        <option value="inactive">✗ Inactive</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                )}

                <div className="form-actions">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/members')}
                    disabled={loading}
                    className="btn-cancel"
                  >
                    <span className="btn-icon">✖️</span> Cancel
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading}
                    className="btn-gradient-success btn-submit"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">{isEditMode ? '💾' : '➕'}</span>
                        {isEditMode ? 'Update Member' : 'Add Member'}
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

export default MemberForm;
