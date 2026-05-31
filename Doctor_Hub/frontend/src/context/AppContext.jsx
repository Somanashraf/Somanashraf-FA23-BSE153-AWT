import { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

const demoUsers = {
  PATIENT: { id: 5, name: 'Ayesha Noor', role: 'PATIENT', email: 'patient@doctorhub.local' },
  DOCTOR: { id: 3, name: 'Dr. Sana Khan', role: 'DOCTOR', email: 'sana.khan@doctorhub.local' },
  ASSISTANT: { id: 4, name: 'Bilal Ahmed', role: 'ASSISTANT', email: 'assistant@doctorhub.local' },
  ADMIN: { id: 2, name: 'Admin Office', role: 'ADMIN', email: 'admin@doctorhub.local' },
  SUPER_ADMIN: { id: 1, name: 'System Owner', role: 'SUPER_ADMIN', email: 'superadmin@doctorhub.local' }
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('doctorhub-theme') || 'light');
  const [user, setUser] = useState(demoUsers.PATIENT);
  const [toast, setToast] = useState(null);

  function toggleTheme() {
    setTheme((next) => {
      const value = next === 'light' ? 'dark' : 'light';
      localStorage.setItem('doctorhub-theme', value);
      return value;
    });
  }

  function switchRole(role) {
    setUser(demoUsers[role]);
    setToast({ type: 'info', message: `Viewing as ${role.replace('_', ' ').toLowerCase()}` });
    setTimeout(() => setToast(null), 2600);
  }

  const value = useMemo(() => ({ theme, user, toast, setToast, toggleTheme, switchRole }), [theme, user, toast]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
