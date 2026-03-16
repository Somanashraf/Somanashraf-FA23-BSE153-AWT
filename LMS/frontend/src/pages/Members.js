import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Alert, Badge, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllMembers, deleteMember } from '../services/memberService';
import './Members.css';

/**
 * Members Page Component
 * Modern table with animations and gradient styling
 */
function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getAllMembers();
      setMembers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load members. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);
        fetchMembers();
      } catch (err) {
        setError('Failed to delete member. Please try again.');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="modern-spinner"></div>
          <p className="mt-3 text-muted">Loading members...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="members-container">
      {/* Header */}
      <Row className="mb-4 page-header">
        <Col>
          <h1 className="page-title">
            <span className="title-icon">👥</span>
            Members Directory
          </h1>
        </Col>
        <Col xs="auto">
          <Button 
            className="btn-gradient-success add-btn"
            onClick={() => navigate('/members/new')}
          >
            <span className="btn-icon">➕</span> Add New Member
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
                  <th><span className="th-icon">👤</span> Name</th>
                  <th><span className="th-icon">📧</span> Email</th>
                  <th><span className="th-icon">📱</span> Phone</th>
                  <th><span className="th-icon">📅</span> Membership Date</th>
                  <th><span className="th-icon">⚡</span> Status</th>
                  <th className="text-center"><span className="th-icon">⚙️</span> Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>No members found</h3>
                        <p>Start by adding your first member</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={member._id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td>
                        <div className="member-name">
                          <div className="member-avatar">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <span>{member.firstName} {member.lastName}</span>
                        </div>
                      </td>
                      <td className="email-cell">{member.email}</td>
                      <td>{member.phoneNumber || <span className="text-muted">N/A</span>}</td>
                      <td>{formatDate(member.membershipDate)}</td>
                      <td>
                        <Badge className={`status-badge ${member.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                          {member.status === 'active' ? '✓' : '✗'} {member.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="action-btn-edit"
                            onClick={() => navigate(`/members/edit/${member._id}`)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="action-btn-delete"
                            onClick={() => handleDelete(member._id)}
                          >
                            🗑️
                          </Button>
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
    </Container>
  );
}

export default Members;
