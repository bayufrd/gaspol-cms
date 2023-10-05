import React from "react";

const Sidebar = ({ isOpen }) => {
  return (
    <div id="sidebar" className={`sidebar ${isOpen ? "active" : ""}`}>
      <div className="sidebar-wrapper active">
        <div className="sidebar-header position-relative">
          <div className="d-flex justify-content-between align-items-center">
              <div className="logo">
                <a href="index.html">
                  GASPOL CMS
                </a>
              </div>
              <div className="sidebar-toggler x">
                <div className="sidebar-hide d-xl-none d-block">
                  <i className="bi bi-x bi-middle"></i>
                </div>
              </div>
          </div>
        </div>
        <div className="sidebar-menu">
          <ul class="menu">
            <li class="sidebar-title">Menu</li>

            <li class="sidebar-item">
              <a href="index.html" class="sidebar-link">
                <i class="bi bi-grid-fill"></i>
                <span>Management Menu</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
