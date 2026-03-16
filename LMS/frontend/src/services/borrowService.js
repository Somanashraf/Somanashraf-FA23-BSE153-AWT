import api from './api';

/**
 * Borrow Service
 * Handles all borrow-related API calls
 */

// GET /api/borrow-records
export const getAllBorrowRecords = async () => {
  const response = await api.get('/borrow-records');
  return response.data;
};

// GET /api/members/:memberId/borrowed-books
export const getMemberBorrowedBooks = async (memberId) => {
  const response = await api.get(`/members/${memberId}/borrowed-books`);
  return response.data;
};

// POST /api/members/:memberId/borrowed-books
export const borrowBook = async (memberId, borrowData) => {
  const response = await api.post(`/members/${memberId}/borrowed-books`, borrowData);
  return response.data;
};

// PUT /api/members/:memberId/borrowed-books/:recordId
export const returnBook = async (memberId, recordId) => {
  const response = await api.put(`/members/${memberId}/borrowed-books/${recordId}`);
  return response.data;
};
