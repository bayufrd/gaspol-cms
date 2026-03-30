import React from "react";

const Footer = () => {
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
      backgroundColor: '#f8f9fa',
      padding: '20px 0',
      borderTop: '1px solid #e9ecef',
      fontFamily: "'Inter', 'Roboto', sans-serif",
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 15px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: isMobile ? '15px' : '0',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    companyLink: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: '#333',
      fontWeight: '600',
      transition: 'color 0.3s ease',
    },
    logo: {
      marginRight: '10px',
      width: '40px',
      height: '40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      maxWidth: '50%',
      maxHeight: '50%',
      objectFit: 'contain',
    },
    companyText: {
      fontSize: '14px',
      margin: 0,
      marginLeft: '10px',
    },
    downloadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: isMobile ? '8px 14px' : '10px 18px',
      backgroundColor: '#0078D4',
      color: '#ffffff',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: isMobile ? '12px' : '14px',
      boxShadow: '0 2px 6px rgba(0, 120, 212, 0.3)',
      transition: 'all 0.3s ease',
    },
    windowsIcon: {
      width: isMobile ? '16px' : '18px',
      height: isMobile ? '16px' : '18px',
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
            onMouseOver={(e) => (e.currentTarget.style.color = '#2575fc')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
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
            e.currentTarget.style.backgroundColor = '#005a9e';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 120, 212, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0078D4';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 120, 212, 0.3)';
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
