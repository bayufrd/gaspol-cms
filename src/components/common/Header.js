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

  return (
    <header>
      <nav className="navbar navbar-expand navbar-light navbar-top">
        <div className="container-fluid">
          <div className="buttons" onClick={onToggleSidebar}>
            <div className="burger-btn d-block">
              <i className="bi bi-justify fs-3"></i>
            </div>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-lg-0"></ul>
            <div className="dropdown">
              <div data-bs-toggle="dropdown" aria-expanded="false">
                <div className="user-menu d-flex">
                  <div className="user-name text-end me-3">
                    {userTokenData && (
                      <div className="user-name text-end me-3">
                        <h6 className="mb-0 text-gray-600">
                          {userTokenData.outlet_name}
                        </h6>
                        <p className="mb-0 text-sm text-gray-600">
                          {userTokenData.name}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="user-img d-flex align-items-center">
                    <div className="avatar avatar-md">
                      <img src="assets/images/faces/1.jpg" alt="User" />
                    </div>
                  </div>
                </div>
              </div>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="dropdownMenuButton"
                style={{ minWidth: "11rem" }}
              >
                <li>
                  <Link class="dropdown-item" to="/profile">
                    <i class="icon-mid bi bi-person me-2"></i> My Profile
                  </Link>
                </li>
                <li>
                  <button class="dropdown-item" onClick={handleLogout}>
                    <i class="icon-mid bi bi-box-arrow-left me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
