import { createContext, useContext, useState, ReactNode } from 'react';
import { getToken, setToken as saveToken, clearToken, loginApi, registerApi } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaffOnly: boolean;
  isAdminRole: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  adminLogin: (identifier: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const userKey = () => window.location.pathname.startsWith('/admin') ? 'leon_admin_user' : 'leon_user';

function readStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(userKey());
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function persistUser(u: AuthUser | null) {
  if (u) localStorage.setItem(userKey(), JSON.stringify(u));
  else localStorage.removeItem(userKey());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(readStoredUser);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    persistUser(u);
  };

  const login = async (identifier: string, password: string) => {
    const data = await loginApi(identifier, password);
    const role = data.role?.toLowerCase();
    if (role && role !== 'customer') {
      throw new Error('Tài khoản này không phải khách hàng. Vui lòng dùng trang đăng nhập quản trị.');
    }
    saveToken(data.token);
    setUser({
      id: data.userId,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      username: data.username,
      role: data.role.toLowerCase(),
    });
  };

  const adminLogin = async (identifier: string, password: string) => {
    const data = await loginApi(identifier, password);
    const role = data.role.toLowerCase();
    if (role !== 'admin' && role !== 'staff' && role !== 'manager') {
      throw new Error('Tài khoản không có quyền truy cập trang quản trị');
    }
    saveToken(data.token);
    setUser({
      id: data.userId,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      username: data.username,
      role,
    });
  };

  const register = async (data: { fullName: string; email: string; phone: string; password: string }) => {
    const resp = await registerApi(data);
    saveToken(resp.token);
    setUser({
      id: resp.userId,
      name: resp.fullName,
      email: resp.email,
      phone: resp.phone,
      username: resp.username,
      role: resp.role.toLowerCase(),
    });
  };

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
  };

  const isAuthenticated = !!user && !!getToken();
  const isAdmin = !!user && ['admin', 'staff', 'manager'].includes(user.role);
  const isStaffOnly = !!user && user.role === 'staff';
  const isAdminRole = !!user && ['admin', 'manager'].includes(user.role);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isStaffOnly, isAdminRole, login, adminLogin, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
