import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kmc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('kmc_user', JSON.stringify(userData));
    if (token) localStorage.setItem('kmc_auth_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kmc_user');
    localStorage.removeItem('kmc_auth_token');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);