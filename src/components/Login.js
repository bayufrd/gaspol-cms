import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from "sweetalert2";

const LoginForm = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    try {
      const response = await axios.post(`${apiBaseUrl}/login`, { username, password });
      if (response.status === 200) {
        const token = response.data.token;
        setIsLoggedIn(true);
        localStorage.setItem('token', token);
        Swal.fire({
          icon: "success",
          title: "Login Berhasil!",
        }).then(() => {
          navigate("/");
        })
      }
    } catch (error) {
      let errorMessage = "Login Gagal!";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message;
      }
      Swal.fire({
        icon: "error",
        title: "Login Gagal!",
        text: errorMessage,
      });
    }
  };

  return (
    <div className='custome-container'>
      <form className='login-form'>
        <div>
          <h2 className='login-title'>Login</h2>
          <div className='login-content'>
            <div class="form-group">
              <input
                placeholder="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div class="form-group">
              <input
                type="password"
                placeholder="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className='login-button'>
            <button
              className='btn btn-light'
              onClick={handleLogin}
            >
              Masuk
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;