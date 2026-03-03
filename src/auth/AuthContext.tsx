import { createContext, useContext, useState } from "react";

type Role = "organizer" | "member";

interface User {
  name: string;
  role: Role;
  onboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, role: Role) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: string, role: Role) => {
    setUser({ name, role, onboarded: false });
  };

  const logout = () => setUser(null);

  const completeOnboarding = () => {
    if (user) {
      setUser({ ...user, onboarded: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}