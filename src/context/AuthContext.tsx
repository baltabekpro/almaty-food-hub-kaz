
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Address {
  city: string;
  street: string;
  house: string;
  apartment?: string;
}

interface AuthContextType {
  user: User | null;
  address: Address | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUserAddress: (address: Address) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  // Mock authentication functions
  const login = async (email: string, password: string): Promise<void> => {
    // In a real app, we would make an API call here
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({
          id: '1',
          email,
          name: email.split('@')[0],
        });
        resolve();
      }, 1000);
    });
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    // In a real app, we would make an API call here
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({
          id: '1',
          email,
          name,
        });
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setAddress(null);
  };

  const setUserAddress = (addr: Address) => {
    setAddress(addr);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        address,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUserAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
