import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../ProfileModal";
import ThemeToggle from "../ThemeToggle";
import '../../styles/header-modern.css';

const Header = ({ onToggleSidebar, userTokenData, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="header-modern">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <i className="bi bi-list"></i>
          </button>
        </div>
        
        <div className="header-right">
          {/* Theme Toggle */}
          <div className="theme-toggle-container">
            <ThemeToggle />
          </div>

          {/* Optional: Add notification bell */}
          {/* <div className="notification-badge">
            <i className="bi bi-bell"></i>
            <span className="badge">3</span>
          </div> */}

          <div className="user-menu-container">
            <div 
              className="user-menu-trigger" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {userTokenData && (
                <div className="user-info-container">
                  <span className="user-name">{userTokenData.name}</span>
                  <span className="user-role">{userTokenData.outlet_name}</span>
                </div>
              )}
              
              <div className="user-avatar">
                <img 
                  src="/assets/images/faces/1.jpg" 
                  alt="User Profile"
                />
              </div>
            </div>
            
            <div className={`user-dropdown ${isDropdownOpen ? 'show' : ''}`}>
              <div className="dropdown-header">
                {userTokenData && (
                  <>
                    <span className="user-name">{userTokenData.name}</span>
                    <span className="user-role">{userTokenData.role} - {userTokenData.outlet_name}</span>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="dropdown-item"
              >
                <i className="bi bi-person"></i>
                <span>My Profile</span>
              </button>

              <div className="dropdown-divider"></div>
              
              <button 
                onClick={handleLogout} 
                className="dropdown-item dropdown-item-logout"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userTokenData={userTokenData}
      />
    </header>
  );
};

export default Header;
