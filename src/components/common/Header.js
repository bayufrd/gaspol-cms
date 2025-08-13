import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ onToggleSidebar, userTokenData, setIsLoggedIn }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const styles = {
    header: {
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      height: '70px',
    },
    sidebarToggle: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: '#6c757d',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    sidebarToggleHover: {
      color: '#007bff',
    },
    userMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    userInfo: {
      textAlign: 'right',
    },
    userName: {
      fontWeight: 600,
      color: '#333',
      display: 'block',
      fontSize: '0.95rem',
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#6c757d',
    },
    userDropdown: {
      position: 'relative',
    },
    userAvatar: {
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      overflow: 'hidden',
      cursor: 'pointer',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    dropdownMenu: {
      position: 'absolute',
      right: 0,
      top: '100%',
      backgroundColor: '#fff',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'none',
      minWidth: '200px',
      padding: '10px 0',
    },
    dropdownVisible: {
      display: 'block',
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 20px',
      color: '#333',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
    },
    dropdownItemHover: {
      backgroundColor: '#f8f9fa',
    },
    dropdownIcon: {
      fontSize: '1rem',
    },
    logoutItem: {
      color: '#dc3545',
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div>
          <button 
            style={styles.sidebarToggle}
            onClick={onToggleSidebar}
          >
            <i className="bi bi-list"></i>
          </button>
        </div>
        
        <div>
          <div 
            style={styles.userMenu} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {userTokenData && (
              <div style={styles.userInfo}>
                <span style={styles.userName}>{userTokenData.name}</span>
                <span style={styles.userRole}>{userTokenData.outlet_name}</span>
              </div>
            )}
            
            <div style={styles.userDropdown}>
              <div style={styles.userAvatar}>
                <img 
                  src="assets/images/faces/1.jpg" 
                  alt="User Profile" 
                  style={styles.avatarImg}
                />
              </div>
              
              <div 
                style={{
                  ...styles.dropdownMenu,
                  ...(isDropdownOpen ? styles.dropdownVisible : {})
                }}
              >
                <Link 
                  to="/profile" 
                  style={styles.dropdownItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = styles.dropdownItemHover.backgroundColor}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <i 
                    className="bi bi-person" 
                    style={styles.dropdownIcon}
                  ></i>
                  My Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  style={{
                    ...styles.dropdownItem,
                    ...styles.logoutItem,
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = styles.dropdownItemHover.backgroundColor}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <i 
                    className="bi bi-box-arrow-right" 
                    style={styles.dropdownIcon}
                  ></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
