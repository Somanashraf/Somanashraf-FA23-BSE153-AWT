import api from './api';

/**
 * Member Service
 * Handles all member-related API calls
 */

// GET /api/members
export const getAllMembers = async () => {
  const response = await api.get('/members');
  return response.data;
};

// GET /api/members/:id
export const getMemberById = async (id) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

// POST /api/members
export const createMember = async (memberData) => {
  const response = await api.post('/members', memberData);
  return response.data;
};

// PUT /api/members/:id
export const updateMember = async (id, memberData) => {
  const response = await api.put(`/members/${id}`, memberData);
  return response.data;
};

// DELETE /api/members/:id
export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};
