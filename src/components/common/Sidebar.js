import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  return (
    <div id="sidebar" className={`sidebar ${isOpen ? "active" : ""}`}>
      <div className="sidebar-wrapper active">
        <div className="sidebar-header position-relative">
          <div className="d-flex justify-content-between align-items-center">
              <div className="logo">
                <Link to="/">
                  GASPOL CMS
                </Link>
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
              <Link to="/management-menu" class="sidebar-link">
                <i className="bi bi-grid-fill"></i>
                <span>Management Menu</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
