import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ShrineAuthContextType {
  isAuthenticated: boolean;
  admin: any;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  verifyToken: () => Promise<boolean>;
}

const ShrineAuthContext = createContext<ShrineAuthContextType | undefined>(undefined);

export const ShrineAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const savedAdmin = localStorage.getItem('admin_user');
        
        if (token && savedAdmin) {
          setIsAuthenticated(true);
          setAdmin(JSON.parse(savedAdmin));
        } else {
          setIsAuthenticated(false);
          setAdmin(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Mock login for development
      if (username === 'admin' && password === 'admin') {
        const mockAdmin = { id: 1, username: 'admin', email: 'admin@shrine.com' };
        localStorage.setItem('admin_token', 'mock-token');
        localStorage.setItem('admin_user', JSON.stringify(mockAdmin));
        setIsAuthenticated(true);
        setAdmin(mockAdmin);
        return true;
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setAdmin(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

 const logout = async (): Promise<void> => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    setAdmin(null);
    window.location.href = '/admin/login';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/admin/login';
  }
};

  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('admin_token');
      const savedAdmin = localStorage.getItem('admin_user');
      
      if (token && savedAdmin) {
        setAdmin(JSON.parse(savedAdmin));
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
        return false;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setAdmin(null);
      return false;
    }
  };

  return (
    <ShrineAuthContext.Provider value={{ 
      isAuthenticated, 
      admin, 
      login, 
      logout, 
      loading,
      verifyToken 
    }}>
      {children}
    </ShrineAuthContext.Provider>
  );
};

export const useShrineAuth = () => {
  const context = useContext(ShrineAuthContext);
  if (context === undefined) {
    throw new Error('useShrineAuth must be used within a ShrineAuthProvider');
  }
  return context;
};
