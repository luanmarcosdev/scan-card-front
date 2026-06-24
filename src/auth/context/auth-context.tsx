import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import {
  loginRequest,
  registerRequest,
  getProfileRequest,
  updateProfileRequest,
} from '../services/auth.service';

import type { User, LoginPayload, RegisterPayload, AuthContextValue, UpdateProfilePayload } from '../types';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'scan-card:token';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    getProfileRequest(stored)
      .then((profile) => {
        setToken(stored);
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => {
        setLoading(false);
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

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, [logout]);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const updated = await updateProfileRequest(token!, payload);
      setUser(updated);
    },
    [token]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, token, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
