import React from "react";

const Footer = () => {
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
      justifyContent: 'space-between',
      alignItems: 'center',
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
    downloadLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      textDecoration: 'none',
      color: '#2575fc',
      fontWeight: '500',
    },
    icon: {
      fontSize: '18px',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.leftSection}>
          <a
            href="https://dastrevas.com"
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

          <a
            href="https://gaspollmanagementcenter.com/server/setup.exe"
            style={styles.downloadLink}
          >
            <span style={styles.icon}>⬇</span> Download KASIR Installer Setup (Windows)
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
