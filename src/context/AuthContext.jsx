/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  getSession,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService";


const AuthContext = createContext(null);



export function AuthProvider({ children }) {

  // Load saved session when application starts
  const [session, setSession] = useState(() => getSession());

 
 


  function login(email, password) {

    const newSession = loginUser(email, password);

    setSession(newSession);

    return newSession;
  }

  // ========================================
  // REGISTER
  // ========================================

  function register(formData) {

    return registerUser(formData);
  }

  // ========================================
  // LOGOUT
  // ========================================

  function logout() {

    logoutUser();

    setSession(null);
  }

  // ========================================
  // SHARED AUTHENTICATION DATA
  // ========================================

  const value = {

    user: session?.user || null,

    token: session?.token || null,

    isAuthenticated: Boolean(session?.token),

    login,

    register,

    logout,

  };

  // ========================================
  // PROVIDER
  // ========================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// 3. CUSTOM AUTHENTICATION HOOK
// ==========================================

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
