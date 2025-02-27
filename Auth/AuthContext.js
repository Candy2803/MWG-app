import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the logged-in user
  const [isImpersonating, setIsImpersonating] = useState(false); // Flag to indicate impersonation status
  const [impersonatedUser, setImpersonatedUser] = useState(null); // Stores the user being impersonated

  // Logs in the user
  const login = (userData) => {
    setUser(userData);
  };

  // Logs out the user and resets impersonation
  const logout = () => {
    setUser(null);
    setIsImpersonating(false);
    setImpersonatedUser(null);
  };

  // Updates user details
  const updateUser = (updatedData) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedData }));
  };

  // Starts impersonating another user
  const impersonateUser = (userToImpersonate) => {
    setIsImpersonating(true);
    setImpersonatedUser(userToImpersonate);
  };

  // Stops impersonation and returns to the original user
  const stopImpersonation = () => {
    setIsImpersonating(false);
    setImpersonatedUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isImpersonating,
        impersonatedUser,
        login,
        logout,
        updateUser,
        impersonateUser,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access the Auth context
export const useAuth = () => useContext(AuthContext);
