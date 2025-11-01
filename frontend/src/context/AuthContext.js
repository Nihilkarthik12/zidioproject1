import React, { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, logout } from "../store/slices/authSlice";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const register = async (userData) => {
    const res = await API.post("/auth/register", userData);
    dispatch(setCredentials(res.data));
    return res.data;
  };

  const login = async (userData) => {
    const res = await API.post("/auth/login", userData);
    dispatch(setCredentials(res.data));
    return res.data;
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      register, 
      login, 
      logout: logoutUser, 
      API 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
