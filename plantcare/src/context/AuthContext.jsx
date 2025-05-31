// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(username, password);
      
      if (response.status === "success") {
        const newUser = { 
          username: response.user,
          loginTime: new Date().toISOString()
        };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        return { success: true, user: newUser };
      } else {
        throw new Error(response.msg || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (user?.username) {
        await apiLogout(user.username);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
