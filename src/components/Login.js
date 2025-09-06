import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractUserTokenData } from "../helpers/token";
import { normalizeMenuAccess } from "../helpers/normalizeMenuAccess";
import { accessRoutes } from "../helpers/accessRoutes";
import axios from 'axios';
import Swal from "sweetalert2";

const LoginForm = ({ setIsLoggedIn, setUserTokenData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Ubah judul halaman saat komponen dimuat
  useEffect(() => {
    document.title = "Login - Gaspoll Content Management System";
  }, []);

  const partnerLogos = [
    {
      src: "/assets/images/partnership/sambelcolek.jpg",
      alt: "Sambel Colek",
      link: "https://jempolan.gaspollmanagementcenter.com",
      title: "Sambel Colek",
      description: "Yogyakarta"
    },
    {
      src: "/assets/images/partnership/jempolan.jpg",
      alt: "Jempolan Coffee & Eatery",
      link: "https://jempolan.gaspollmanagementcenter.com",
      title: "Jempolan Coffee",
      description: "Yogyakarta"
    },
    {
      src: "/assets/images/partnership/sambelnyahti.jpg",
      alt: "Sambel'e Nyah Ti",
      link: "https://jempolan.gaspollmanagementcenter.com",
      title: "Sambel'e Nyah Ti",
      description: "Yogyakarta"
    },
  ];

  // Styles dengan pendekatan responsif
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
      boxSizing: 'border-box',
    },
    loginWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '400px',
      padding: '40px 30px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden',
    },
    brandIconContainer: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      animation: 'pulse 2s infinite',
    },
    brandIcon: {
      fontSize: '52px',
      color: 'white',
      textShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    loginTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#333',
      marginBottom: '10px',
      textAlign: 'center',
      letterSpacing: '0.5px',
    },
    loginSubtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '20px',
      textAlign: 'center',
    },
    logoSection: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '20px',
      flexWrap: 'wrap',
    },
    partnerLogoContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease',
    },
    partnerLogo: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
      border: '3px solid white',
    },
    partnerLogoTitle: {
      marginTop: '10px',
      fontSize: '12px',
      color: '#666',
      fontWeight: '500',
      textAlign: 'center',
    },
    partnerLogoDescription: {
      fontSize: '10px',
      color: '#999',
      marginTop: '3px',
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      margin: '10px 0',
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      backgroundColor: '#f9f9f9',
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(to right, #4a90e2, #50c878)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 15px rgba(74,144,226,0.3)',
    },
  };

  const pulseKeyframes = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;

  const handleLogin = async (e) => {
    e.preventDefault();

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    try {
      const response = await axios.post(`${apiBaseUrl}/login`, { username, password });
      if (response.status === 200) {
        const token = response.data.token;
        let tokenData = extractUserTokenData(token);
        tokenData.menu_access = normalizeMenuAccess(tokenData.menu_access);

        setUserTokenData(tokenData);
        setIsLoggedIn(true);
        localStorage.setItem('token', token);

        // 🔑 Cari akses terkecil
        const firstAccess = Math.min(...tokenData.menu_access);
        const redirectPath = accessRoutes[firstAccess] || "/profile";

        Swal.fire({
          icon: "success",
          title: "Login Berhasil!",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate(redirectPath);
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
    <>
      <style>{pulseKeyframes}</style>

      <div style={styles.container}>
        <div style={styles.loginWrapper}>
          {/* Brand Icon */}
          <div style={styles.brandIconContainer}>
            <span style={styles.brandIcon}>🔐</span>
          </div>

          {/* Tambahkan Judul Login */}
          <div>
            <h1 style={styles.loginTitle}>
              Gaspoll CMS
            </h1>
            <p style={styles.loginSubtitle}>
              Content Management System
            </p>
          </div>

          {/* Partner Logos - Fleksibel dan Responsif */}
          <div style={styles.logoSection}>
            {partnerLogos.map((logo, index) => (
              <div
                key={index}
                style={{
                  ...styles.partnerLogoContainer,
                  ':hover': { transform: 'scale(1.05)' }
                }}
              >
                <a
                  href={logo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    style={{
                      ...styles.partnerLogo,
                      ':hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.3)'
                      }
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 12px 20px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
                    }}
                  />
                </a>
                <span style={styles.partnerLogoTitle}>
                  {logo.title}
                </span>
                <span style={styles.partnerLogoDescription}>
                  {logo.description}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <input
              type="text"
              placeholder="Username"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#888',
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button
              type="submit"
              style={styles.button}
              disabled={!username || !password}
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
