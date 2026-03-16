import api from './api';

/**
 * Book Service
 * Handles all book-related API calls
 */

// GET /api/books
export const getAllBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};

// GET /api/books/:id
export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

// POST /api/books
export const createBook = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
};

// PUT /api/books/:id
export const updateBook = async (id, bookData) => {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
};

// DELETE /api/books/:id
export const deleteBook = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};
