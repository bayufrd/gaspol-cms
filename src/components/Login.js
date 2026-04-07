import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractUserTokenData } from "../helpers/token";
import { normalizeMenuAccess } from "../helpers/normalizeMenuAccess";
import { accessRoutes } from "../helpers/accessRoutes";
import axios from 'axios';
import Swal from "sweetalert2";
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/modern-theme.css';

const LoginForm = ({ setIsLoggedIn, setUserTokenData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Ubah judul halaman saat komponen dimuat
  useEffect(() => {
    document.title = "Login - Gaspoll Management Center";
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
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' 
        : 'linear-gradient(135deg, #FFF5EB 0%, #FFE8D6 50%, #FFD4B8 100%)',
      fontFamily: "var(--font-family-primary)",
      padding: '20px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundDecoration: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
      filter: 'blur(60px)',
    },
    decoration1: {
      top: '-100px',
      right: '-100px',
    },
    decoration2: {
      bottom: '-150px',
      left: '-100px',
    },
    loginWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '480px',
      padding: '40px 35px',
      background: isDark 
        ? 'rgba(30, 41, 59, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: isDark 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
        : 'var(--shadow-2xl)',
      position: 'relative',
      border: isDark 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(255, 255, 255, 0.3)',
      zIndex: 1,
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    brandIconContainer: {
      width: '75px',
      height: '75px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20px',
      boxShadow: '0 15px 35px rgba(255, 107, 53, 0.3)',
      animation: 'pulse 3s infinite ease-in-out',
    },
    brandIcon: {
      fontSize: '40px',
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
    },
    loginTitle: {
      fontSize: 'var(--font-size-xl)',
      fontWeight: 'var(--font-weight-bold)',
      color: isDark ? '#f1f5f9' : 'var(--text-primary)',
      marginBottom: '4px',
      textAlign: 'center',
      letterSpacing: '0.5px',
      fontFamily: "var(--font-family-heading)",
      textTransform: 'uppercase',
      textShadow: isDark ? '0 2px 10px rgba(255, 107, 53, 0.3)' : 'none',
    },
    loginSubtitle: {
      fontSize: 'var(--font-size-xs)',
      color: isDark ? '#cbd5e1' : 'var(--text-secondary)',
      marginBottom: '24px',
      textAlign: 'center',
      fontWeight: 'var(--font-weight-medium)',
    },
    logoSection: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '16px',
      flexWrap: 'wrap',
    },
    partnerLogoContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'transform var(--transition-base)',
    },
    partnerLogo: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      cursor: 'pointer',
      transition: 'all var(--transition-base)',
      boxShadow: 'var(--shadow-md)',
      border: '2px solid white',
    },
    partnerLogoTitle: {
      marginTop: '8px',
      fontSize: 'var(--font-size-xs)',
      color: 'var(--text-secondary)',
      fontWeight: 'var(--font-weight-semibold)',
      textAlign: 'center',
    },
    partnerLogoDescription: {
      fontSize: '10px',
      color: 'var(--text-tertiary)',
      marginTop: '2px',
    },
    formGroup: {
      width: '100%',
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'var(--font-weight-semibold)',
      color: isDark ? '#f1f5f9' : 'var(--text-primary)',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: isDark 
        ? '1.5px solid rgba(255, 255, 255, 0.1)' 
        : '1.5px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-base)',
      transition: 'all var(--transition-base)',
      backgroundColor: isDark 
        ? 'rgba(15, 23, 42, 0.7)' 
        : 'var(--bg-secondary)',
      color: isDark ? '#f1f5f9' : 'var(--text-primary)',
      fontFamily: "var(--font-family-primary)",
      boxSizing: 'border-box',
    },
    passwordContainer: {
      position: 'relative',
      width: '100%',
    },
    passwordToggle: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px',
      color: 'var(--text-tertiary)',
      transition: 'color var(--transition-base)',
      padding: '4px',
    },
    button: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-bold)',
      cursor: 'pointer',
      transition: 'all var(--transition-base)',
      boxShadow: '0 10px 20px rgba(255, 107, 53, 0.25)',
      marginTop: '8px',
      fontFamily: "var(--font-family-primary)",
      letterSpacing: '0.5px',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      width: '100%',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'var(--border-light)',
    },
    dividerText: {
      padding: '0 16px',
      fontSize: 'var(--font-size-xs)',
      color: isDark ? '#94a3b8' : 'var(--text-tertiary)',
      fontWeight: 'var(--font-weight-medium)',
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
    setIsLoading(true);

    // Close any existing sweetalert instances
    Swal.close();

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

        // Show brief success message then navigate
        Swal.fire({
          icon: "success",
          title: "Login Berhasil!",
          text: `Selamat datang, ${tokenData.name || username}!`,
          showConfirmButton: false,
          timer: 1200,
          timerProgressBar: true,
          allowOutsideClick: false,
          willClose: () => {
            // Reset loading and navigate
            setIsLoading(false);
            navigate(redirectPath);
          }
        });
      }
    } catch (error) {
      setIsLoading(false);
      let errorMessage = "Login Gagal!";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message;
      }
      Swal.fire({
        icon: "error",
        title: "Login Gagal!",
        text: errorMessage,
        customClass: {
          popup: 'animate-fade-in'
        }
      });
    }
  };

  return (
    <>
      <div style={styles.container}>
        {/* Background Decorations */}
        <div style={{...styles.backgroundDecoration, ...styles.decoration1}}></div>
        <div style={{...styles.backgroundDecoration, ...styles.decoration2}}></div>

        <div style={styles.loginWrapper} className="animate-fade-in">
          {/* Theme Toggle - Positioned at top right */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10
          }}>
            <ThemeToggle style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }} />
          </div>

          {/* Brand Icon */}
          <div style={styles.brandIconContainer}>
            <span style={styles.brandIcon}>🍽️</span>
          </div>

          {/* Tambahkan Judul Login */}
          <div>
            <h1 style={styles.loginTitle}>
              Gaspoll Management Center
            </h1>
            <p style={styles.loginSubtitle}>
              Content Management System
            </p>
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>OUR PARTNERS</span>
            <div style={styles.dividerLine}></div>
          </div>

          {/* Partner Logos - Fleksibel dan Responsif */}
          <div style={styles.logoSection}>
            {partnerLogos.map((logo, index) => (
              <div
                key={index}
                style={styles.partnerLogoContainer}
              >
                <a
                  href={logo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    style={styles.partnerLogo}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 15px 30px rgba(0,0,0,0.25)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
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

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>LOGIN</span>
            <div style={styles.dividerLine}></div>
          </div>

          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-orange)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = 'var(--bg-secondary)';
                }}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-orange)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-light)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseOver={(e) => e.target.style.color = 'var(--primary-orange)'}
                  onMouseOut={(e) => e.target.style.color = 'var(--text-tertiary)'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                ...((!username || !password || isLoading) && styles.buttonDisabled)
              }}
              disabled={!username || !password || isLoading}
              onMouseOver={(e) => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 30px rgba(255, 107, 53, 0.35)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 20px rgba(255, 107, 53, 0.25)';
              }}
            >
              {isLoading ? (
                <span>
                  <span className="animate-spin" style={{display: 'inline-block', marginRight: '8px'}}>⏳</span>
                  Memproses...
                </span>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-tertiary)'
          }}>
            <p style={{marginBottom: '6px'}}>© 2023 Gaspoll Management Center</p>
            <p style={{marginTop: '0'}}>
              Powered by{' '}
              <a 
                href="https://dastrevas.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: 'var(--primary-orange)',
                  textDecoration: 'none',
                  fontWeight: 'var(--font-weight-semibold)',
                  transition: 'all var(--transition-base)'
                }}
                onMouseOver={(e) => {
                  e.target.style.textDecoration = 'underline';
                  e.target.style.color = '#FF8C5A';
                }}
                onMouseOut={(e) => {
                  e.target.style.textDecoration = 'none';
                  e.target.style.color = 'var(--primary-orange)';
                }}
              >
                Dastrevas
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
