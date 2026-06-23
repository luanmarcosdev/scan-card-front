import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { loginRequest, registerRequest, getProfileRequest } from '../services/auth.service';

import type { User, LoginPayload, RegisterPayload, AuthContextValue } from '../types';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'scan-card:token';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    getProfileRequest(stored)
      .then((profile) => {
        setToken(stored);
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      });
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { accessToken } = await loginRequest(payload);
      const profile = await getProfileRequest(accessToken);

      localStorage.setItem(STORAGE_KEY, accessToken);
      setToken(accessToken);
      setUser(profile);
      navigate('/');
    },
    [navigate]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerRequest(payload);
      const { accessToken } = await loginRequest({ email: payload.email, password: payload.password });
      const profile = await getProfileRequest(accessToken);

      localStorage.setItem(STORAGE_KEY, accessToken);
      setToken(accessToken);
      setUser(profile);
      navigate('/');
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    navigate('/sign-in');
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
