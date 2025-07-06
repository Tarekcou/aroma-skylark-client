// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  const login = (id, password) => {
    if (id === "12345" && password === "aroma2025") {
      localStorage.setItem("isLoggedIn", "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Keep state in sync with localStorage in case of direct manipulation
    const stored = localStorage.getItem("isLoggedIn") === "true";
    if (stored !== isAuthenticated) {
      setIsAuthenticated(stored);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
