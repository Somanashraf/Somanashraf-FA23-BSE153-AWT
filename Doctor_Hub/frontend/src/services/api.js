const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!res.ok) throw new Error('Doctor Hub request failed');
  return res.json();
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  doctors: (params) => request(`/doctors?${new URLSearchParams(params)}`),
  appointments: () => request('/appointments'),
  analytics: () => request('/admin/analytics')
};
