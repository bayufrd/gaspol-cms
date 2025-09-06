import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ onToggleSidebar, isOpen, userTokenData }) => {
  const location = useLocation();

  const hasAccess = (accessCode) => {
    const menuAccess = userTokenData.menu_access;
    
    if (Array.isArray(menuAccess)) {
      return menuAccess.includes(accessCode) ||
        menuAccess.includes(Number(accessCode)) ||
        menuAccess.includes(String(accessCode));
    }

    if (typeof menuAccess === 'string') {
      return menuAccess.split(',').includes(String(accessCode));
    }

    return false;
  };
  // Definisi menu terstruktur
  const menuSections = [
    {
      title: "Management",
      items: [
        { 
          accessCode: "1", 
          icon: "bi-people-fill", 
          label: "Management Users", 
          path: "/" 
        },
        { 
          accessCode: "1", 
          icon: "bi-building", 
          label: "Management Outlet", 
          path: "/outlet" 
        },
        { 
          accessCode: "2", 
          icon: "bi-cup-straw", 
          label: "Management Menus", 
          path: "/menu" 
        },
        { 
          accessCode: "3", 
          icon: "bi-tags-fill", 
          label: "Management Discounts", 
          path: "/discount" 
        },
        { 
          accessCode: "9", 
          icon: "bi-people-fill", 
          label: "Management Membership", 
          path: "/member" 
        }
      ]
    },
    {
      title: "Financial",
      items: [
        { 
          accessCode: "5", 
          icon: "bi-currency-exchange", 
          label: "Serving Types", 
          path: "/serving-type" 
        },
        { 
          accessCode: "8", 
          icon: "bi-bank", 
          label: "Payment Types", 
          path: "/payment-type" 
        },
        { 
          accessCode: "10", 
          icon: "bi-coin", 
          label: "Payment Categories", 
          path: "/payment-management" 
        }
      ]
    },
    {
      title: "Reporting",
      items: [
        { 
          accessCode: "4", 
          icon: "bi-book", 
          label: "Reports", 
          path: "/report" 
        },
        { 
          accessCode: "6", 
          icon: "bi-clipboard-check", 
          label: "Ingredients Order", 
          path: "/ingredient-order" 
        },
        { 
          accessCode: "7", 
          icon: "bi-box-seam", 
          label: "Ingredients Report", 
          path: "/ingredient-report" 
        }
      ]
    },
    {
      // Whatsapp Management System
      title: "Whatsapp Management",
      items: [
        { 
          accessCode: "11", 
          icon: "bi-whatsapp", 
          label: "Whatsapp", 
          path: "/whatsapp" 
        }
      ]
    }
  ];

  // Menu khusus Warehouse
  const warehouseMenus = [
    { 
      icon: "bi-basket", 
      label: "Ingredients", 
      path: "/ingredient" 
    },
    { 
      icon: "bi-cart", 
      label: "Ingredients Order Outlet", 
      path: "/ingredient-order-outlet" 
    }
  ];

  // Fungsi render menu section
  const renderMenuSection = (section) => {
    // Filter item yang memiliki akses
    const visibleItems = section.items.filter(item => 
      hasAccess(item.accessCode)
    );

    // Jika tidak ada item yang bisa diakses, jangan tampilkan section
    if (visibleItems.length === 0) return null;

    return (
      <div key={section.title}>
        <li className="sidebar-title">{section.title}</li>
        {visibleItems.map(item => (
          <li key={item.path} className="sidebar-item">
            <Link 
              to={item.path} 
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </div>
    );
  };

  return (
    <div 
      id="sidebar" 
      className={`sidebar ${isOpen ? "active" : ""}`}
      style={{
        width: isOpen ? '250px' : '80px',
        transition: 'width 0.3s ease'
      }}
    >
      <div className="sidebar-wrapper active">
        <div className="sidebar-header position-relative">
          <div className="d-flex justify-content-between align-items-center">
            <div className="logo">
              <Link to="/">
                {isOpen ? 'GASPOLL CMS' : 'GP'}
              </Link>
            </div>
            <div 
              className="sidebar-toggler" 
              onClick={onToggleSidebar}
              style={{ cursor: 'pointer' }}
            >
              <div className="sidebar-hide d-xl-none d-block">
                <i className={`bi ${isOpen ? 'bi-x' : 'bi-list'} bi-middle`}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar-menu">
          <ul className="menu">
            {/* Render menu sections */}
            {menuSections.map(renderMenuSection)}

            {/* Render warehouse menu jika role sesuai */}
            {userTokenData.role === "Warehouse" && (
              <>
                <li className="sidebar-title">Warehouse</li>
                {warehouseMenus.map(item => (
                  <li key={item.path} className="sidebar-item">
                    <Link 
                      to={item.path} 
                      className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      <i className={`bi ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
