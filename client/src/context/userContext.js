import React, { useState, createContext, useContext } from "react";

const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState({
    _id: "",
    sub: "",
    username: "",
    firstName: "",
    lastName: "",
    imagePath: "",
    password: "",
    gender: "",
    followers: [],
    following: [],
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider!");
  }
  return context;
}
