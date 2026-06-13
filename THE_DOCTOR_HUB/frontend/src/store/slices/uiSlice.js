import { createSlice } from '@reduxjs/toolkit';

const getInitialDarkMode = () => {
  try {
    const stored = localStorage.getItem('dh_darkmode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    darkMode: getInitialDarkMode(),
    activeModal: null,
    toasts: [],
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    toggleSidebarCollapsed: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      try {
        localStorage.setItem('dh_darkmode', String(state.darkMode));
        document.documentElement.classList.toggle('dark', state.darkMode);
      } catch {}
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      try {
        localStorage.setItem('dh_darkmode', String(action.payload));
        document.documentElement.classList.toggle('dark', action.payload);
      } catch {}
    },
    openModal: (state, action) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now(), ...action.payload });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar, setSidebarOpen, toggleSidebarCollapsed,
  toggleDarkMode, setDarkMode, openModal, closeModal, addToast, removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
