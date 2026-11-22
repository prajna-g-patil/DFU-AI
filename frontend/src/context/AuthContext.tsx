import React, { createContext, useContext, useState, useEffect } from 'react';
import { Doctor } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  doctor: Doctor | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: (email: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dfu_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentDoctor() {
      if (token) {
        try {
          const profile = await api.getMe();
          setDoctor(profile);
        } catch (e) {
          console.error("Token expired or invalid:", e);
          localStorage.removeItem('dfu_access_token');
          setToken(null);
          setDoctor(null);
        }
      }
      setLoading(false);
    }
    loadCurrentDoctor();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('dfu_access_token', res.access_token);
    setToken(res.access_token);
    setDoctor(res.doctor);
  };

  const loginDemo = async (email: string) => {
    await login(email, "doctor123");
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('dfu_access_token', res.access_token);
    setToken(res.access_token);
    setDoctor(res.doctor);
  };

  const logout = () => {
    localStorage.removeItem('dfu_access_token');
    setToken(null);
    setDoctor(null);
  };

  return (
    <AuthContext.Provider value={{ doctor, token, loading, login, loginDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
