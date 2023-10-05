import React from "react";

const Header = ({ onToggleSidebar }) => {
  return (
    <header>
      <nav className="navbar navbar-expand navbar-light navbar-top">
        <div className="container-fluid">
          <div className="buttons" onClick={onToggleSidebar}>
            <a href="#" className="burger-btn d-block">
              <i className="bi bi-justify fs-3"></i>
            </a>
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
            <ul className="navbar-nav ms-auto mb-lg-0">
            </ul>
            <div className="dropdown">
              <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                <div className="user-menu d-flex">
                  <div className="user-name text-end me-3">
                    <h6 className="mb-0 text-gray-600">John Ducky</h6>
                    <p className="mb-0 text-sm text-gray-600">Administrator</p>
                  </div>
                  <div className="user-img d-flex align-items-center">
                    <div className="avatar avatar-md">
                      <img src="assets/images/faces/1.jpg" alt="User" />
                    </div>
                  </div>
                </div>
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="dropdownMenuButton"
                style={{ minWidth: "11rem" }}
              >
                <li>
                  <h6 className="dropdown-header">Hello, John!</h6>
                </li>
                <li>
                  <a class="dropdown-item" href="#">
                    <i class="icon-mid bi bi-box-arrow-left me-2"></i>
                    Logout
                  </a>
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
