import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUser({ email: payload.email, role: payload.role, token });
      } catch (e) {
        console.warn('Invalid token');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token) => {
    const payload = jwtDecode(token);
    const info = { email: payload.email, role: payload.role, token };
    setUser(info);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);