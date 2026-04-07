import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

const Footer = () => {
  const { isDark } = useTheme();
  const [footerUrl, setFooterUrl] = React.useState('https://dastrevas.com');
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const testUrls = async () => {
      const urls = ['https://dastrevas.com', 'https://dastrevas.space'];
      for (const url of urls) {
        try {
          await new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = url + '/favicon.ico?_=' + Date.now();
            img.onload = () => resolve();
            img.onerror = () => reject();
          });
          if (isMounted) {
            setFooterUrl(url);
            break;
          }
        } catch (e) {
          // Try next
        }
      }
    };
    testUrls();
    return () => { isMounted = false; };
  }, []);

  const styles = {
    footer: {
      backgroundColor: isDark ? '#1e293b' : '#f8f9fa',
      padding: isMobile ? '16px 0' : '20px 0',
      borderTop: isDark ? '1px solid #334155' : '1px solid #e9ecef',
      fontFamily: "'Inter', 'Roboto', sans-serif",
      transition: 'all 0.3s ease',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 15px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '15px' : '0',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    },
    companyLink: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: isDark ? '#cbd5e1' : '#333',
      fontWeight: '600',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: isDark ? '#60a5fa' : '#2575fc',
      },
    },
    logo: {
      marginRight: '10px',
      width: '40px',
      height: '40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    logoImage: {
      maxWidth: '50%',
      maxHeight: '50%',
      objectFit: 'contain',
    },
    companyText: {
      fontSize: isMobile ? '12px' : '14px',
      margin: 0,
      marginLeft: '10px',
      color: isDark ? '#cbd5e1' : '#333',
    },
    downloadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: isMobile ? '8px 14px' : '10px 18px',
      backgroundColor: isDark ? '#2563eb' : '#0078D4',
      color: '#ffffff',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: isMobile ? '12px' : '14px',
      boxShadow: isDark 
        ? '0 2px 6px rgba(37, 99, 235, 0.3)' 
        : '0 2px 6px rgba(0, 120, 212, 0.3)',
      transition: 'all 0.3s ease',
      minHeight: '36px',
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    windowsIcon: {
      width: isMobile ? '16px' : '18px',
      height: isMobile ? '16px' : '18px',
      flexShrink: 0,
    },
    downloadIcon: {
      fontSize: isMobile ? '14px' : '16px',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.leftSection}>
        <a
          href={footerUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.companyLink}
          onMouseOver={(e) => (e.currentTarget.style.color = isDark ? '#60a5fa' : '#2575fc')}
          onMouseOut={(e) => (e.currentTarget.style.color = isDark ? '#cbd5e1' : '#333')}
        >
          <div style={styles.logo}>
            <img
              src="/assets/images/DT.svg"
              alt="Dastrevas Tech Logo"
              style={styles.logoImage}
            />
          </div>
          <p style={styles.companyText}>2023 © Akhari Tech x Dastrevas</p>
        </a>
        </div>

        <a
          href="https://gaspollmanagementcenter.com/server/setup.exe"
          style={styles.downloadButton}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#1d4ed8' : '#005a9e';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = isDark
              ? '0 4px 12px rgba(37, 99, 235, 0.4)'
              : '0 4px 12px rgba(0, 120, 212, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#2563eb' : '#0078D4';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isDark
              ? '0 2px 6px rgba(37, 99, 235, 0.3)'
              : '0 2px 6px rgba(0, 120, 212, 0.3)';
          }}
        >
          <i className="bi bi-download" style={styles.downloadIcon}></i>
          {isMobile ? 'Kasir Installer' : 'Download Kasir Installer'}
          <svg 
            style={styles.windowsIcon} 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
