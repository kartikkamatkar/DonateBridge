import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Create isolated contexts
const ThemeContext = createContext();
const AuthContext = createContext();
const SocketContext = createContext();

// Create configured axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.donatebridge.org/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const GlobalStateProvider = ({ children }) => {
  // --- THEME CONTEXT STATE ---
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- AUTH CONTEXT STATE ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null; // e.g., { name: 'Sarah Jenkins', email: 'sarah@donor.org', role: 'donor' }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const login = (role, email, name = '') => {
    const fallbackName = role === 'admin' ? 'Super Admin' : role === 'ngo' ? 'Hope Foundation' : 'Sarah Jenkins';
    const mockUser = {
      name: name || fallbackName,
      email: email || `${role}@donatebridge.org`,
      role: role, // 'donor', 'ngo', 'admin'
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name || role}`,
      trustScore: role === 'ngo' ? 98 : null,
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
    
    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Axios Request & Response Interceptors
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
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          // Simulate JWT refreshing token
          console.log('[Axios Interceptor] Simulating 401 JWT Refresh Token...');
          const newMockToken = 'refreshed-jwt-token-xyz';
          setToken(newMockToken);
          localStorage.setItem('token', newMockToken);
          originalRequest.headers['Authorization'] = `Bearer ${newMockToken}`;
          return api(originalRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // --- SOCKET CONTEXT STATE (WebSocket Matrix) ---
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'delivery', message: 'Courier has picked up Clothes batch #1042', time: '10m ago', read: false },
    { id: 2, type: 'match', message: 'Hope Foundation accepted your school books request!', time: '2h ago', read: false },
    { id: 3, type: 'system', message: 'Your donor account verification completed.', time: '1d ago', read: false },
  ]);

  useEffect(() => {
    // Attempt real websocket connection (fails gracefully if no server)
    const socketInstance = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      autoConnect: false,
      reconnectionAttempts: 3,
    });
    
    socketInstance.connect();
    setSocket(socketInstance);

    // Simulated event triggers for visualization purposes
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockMsgs = [
          'New notification: Matching route optimized!',
          'NGO requested updates on electronics dimensions.',
          'Milestone achieved: Blankets delivered to Rescue Mission.',
        ];
        const newMsg = mockMsgs[Math.floor(Math.random() * mockMsgs.length)];
        
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'system',
            message: newMsg,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);
        setUnreadCount(prev => prev + 1);
      }
    }, 45000); // Trigger occasionally for preview

    return () => {
      socketInstance.disconnect();
      clearInterval(interval);
    };
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const addNotification = (n) => {
    setNotifications(prev => [n, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
        <SocketContext.Provider value={{ socket, unreadCount, notifications, markAllRead, addNotification, setNotifications }}>
          {children}
        </SocketContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};

// Custom hooks for easy consumption
export const useTheme = () => useContext(ThemeContext);
export const useAuth = () => useContext(AuthContext);
export const useSocket = () => useContext(SocketContext);
