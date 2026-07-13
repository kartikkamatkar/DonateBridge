import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useToast } from '../components/ui/Toast';

// Create isolated contexts
const ThemeContext = createContext();
const AuthContext = createContext();
const SocketContext = createContext();

// ─────────────────────────────────────────────
// Configured Axios Instance
// ─────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────
// GlobalStateProvider
// ─────────────────────────────────────────────
export const GlobalStateProvider = ({ children }) => {
  const { toast } = useToast();

  // --- THEME ---
  const theme = 'light';
  const toggleTheme = () => {};
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
    localStorage.setItem('theme', 'light');
  }, []);

  // --- AUTH STATE ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);
  const [authMessage, setAuthMessage] = useState(() => localStorage.getItem('authMessage') || '');

  const clearAuthMessage = useCallback(() => {
    setAuthMessage('');
    localStorage.removeItem('authMessage');
  }, []);

  const setSessionExpired = useCallback(() => {
    const msg = 'Session expired. Please sign in again.';
    setAuthMessage(msg);
    localStorage.setItem('authMessage', msg);
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    toast.error(msg);
  }, [toast]);

  /**
   * loginWithTokens - Called after successful API login/register.
   * Stores user and tokens; attaches Bearer header to future requests.
   */
  const loginWithTokens = useCallback((userData, accessToken, refreshTkn, ngoDetails = null) => {
    const userToStore = {
      id: userData.id,
      name: userData.username || userData.name || userData.email,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar || '👤',
      verificationStatus: ngoDetails?.verification_status || null,
      rejectionReason: ngoDetails?.rejection_reason || '',
      trustScore: ngoDetails?.trust_score || null,
      ngoId: ngoDetails?.id || null,
    };
    clearAuthMessage();
    setUser(userToStore);
    setToken(accessToken);
    setRefreshToken(refreshTkn);
    localStorage.setItem('user', JSON.stringify(userToStore));
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshTkn);
    toast.success(`Welcome back, ${userToStore.name}!`);
  }, [clearAuthMessage, toast]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    toast.info('Signed out successfully.');
  }, [toast]);

  /**
   * refreshUserData - Re-fetch /api/users/me/ and update localStorage.
   * Called after profile updates or NGO registration to sync latest data.
   */
  const refreshUserData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = {
        ...user,
        name: res.data.username || user?.name,
        email: res.data.email,
        avatar: res.data.avatar,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch {
      // Silently fail — non-critical
    }
  }, [token, user]);

  // ─── Axios interceptors (attach JWT, handle 401 refresh) ───
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Attempt silent token refresh on 401
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;
          try {
            const refreshRes = await axios.post(
              `${api.defaults.baseURL}/api/auth/refresh/`,
              { refresh: refreshToken }
            );
            const newAccess = refreshRes.data.access;
            const newRefresh = refreshRes.data.refresh || refreshToken;

            setToken(newAccess);
            setRefreshToken(newRefresh);
            localStorage.setItem('token', newAccess);
            localStorage.setItem('refreshToken', newRefresh);

            originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
            return api(originalRequest);
          } catch {
            setSessionExpired();
            return Promise.reject(error);
          }
        }

        if (error.response?.status === 401) {
          setSessionExpired();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshToken, setSessionExpired]);

  // --- SOCKET + NOTIFICATIONS ---
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Fetch real notifications from API when user is logged in
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    api.get('/api/notifications/')
      .then((res) => {
        const data = res.data.results || res.data;
        const mapped = data.map((n) => ({
          id: n.id,
          type: n.notification_type,
          message: n.message,
          title: n.title,
          time: new Date(n.created_at).toLocaleString(),
          read: n.is_read,
        }));
        setNotifications(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
      })
      .catch(() => {
        // Silently fail - user may be offline
      });
  }, [token]);

  // Attempt Socket.IO connection for real-time updates
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8000';
    const socketInstance = io(wsUrl, {
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    socketInstance.connect();
    Promise.resolve().then(() => setSocket(socketInstance));

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/api/notifications/mark-all-read/');
    } catch {
      // Offline fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const addNotification = useCallback((n) => {
    setNotifications((prev) => [n, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          token,
          refreshToken,
          isAuthenticated: !!token,
          loginWithTokens,
          logout,
          authMessage,
          clearAuthMessage,
          refreshUserData,
        }}
      >
        <SocketContext.Provider
          value={{ socket, unreadCount, notifications, markAllRead, addNotification, setNotifications, setUnreadCount }}
        >
          {children}
        </SocketContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};

// Custom hooks
export const useTheme = () => useContext(ThemeContext);
export const useAuth = () => useContext(AuthContext);
export const useSocket = () => useContext(SocketContext);
