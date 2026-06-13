import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const getErrorMessage = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (!err.response) {
    return 'Cannot connect to server. Run backend with: npm run dev (from project root) or npm run dev in backend folder.';
  }
  return fallback;
};

// Thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Login failed'));
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, 'Registration failed'));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const refreshTokenThunk = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/refresh-token');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// Helper: persist auth to localStorage
const saveToStorage = (user, accessToken) => {
  try {
    localStorage.setItem('dh_user', JSON.stringify(user));
    localStorage.setItem('dh_token', accessToken);
  } catch {}
};

const clearStorage = () => {
  try {
    localStorage.removeItem('dh_user');
    localStorage.removeItem('dh_token');
  } catch {}
};

const loadFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem('dh_user') || 'null');
    const token = localStorage.getItem('dh_token');
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

const { user: storedUser, token: storedToken } = loadFromStorage();

const initialState = {
  user: storedUser,
  accessToken: storedToken,
  isAuthenticated: !!storedToken && !!storedUser,
  isLoading: false,
  error: null,
  registerSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearRegisterSuccess: (state) => { state.registerSuccess = false; },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      saveToStorage(action.payload.user, action.payload.accessToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      clearStorage();
    },
    updateUserPreferences: (state, action) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
        saveToStorage(state.user, state.accessToken);
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.isAuthenticated = true;
        saveToStorage(payload.user, payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.registerSuccess = true;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        clearStorage();
      });

    // Fetch me
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
        saveToStorage(payload.user, state.accessToken);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        clearStorage();
      });

    // Refresh token
    builder
      .addCase(refreshTokenThunk.fulfilled, (state, { payload }) => {
        state.accessToken = payload.accessToken;
        saveToStorage(state.user, payload.accessToken);
      });

    // Update profile
    builder
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.user = { ...state.user, ...payload.user };
        saveToStorage(state.user, state.accessToken);
      });
  },
});

export const { clearError, clearRegisterSuccess, setCredentials, clearAuth, updateUserPreferences } = authSlice.actions;
export default authSlice.reducer;
