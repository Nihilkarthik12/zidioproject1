import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData);
      } else {
        await register(formData);
      }
    } catch (error) {
      alert("Error: " + error.response?.data?.message);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: "400px", margin: "100px auto" }}>
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name:</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p 
          onClick={() => setIsLogin(!isLogin)} 
          style={{cursor: "pointer", color: "blue", marginTop: "10px"}}
        >
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default Login;
