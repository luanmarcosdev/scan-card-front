export type User = {
  id: string;
  name: string;
  email: string;
  document: string;
  salary: number | null;
  phone: string;
  created_at: string;
  updated_at: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  document: string;
  password: string;
  phone: string;
  salary?: number;
};

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};
