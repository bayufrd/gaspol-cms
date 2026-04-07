// Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import '../../styles/sidebar-modern.css';

const Sidebar = ({ onToggleSidebar, isOpen, userTokenData }) => {
  const location = useLocation();

  // Close sidebar on route change (mobile only)
  React.useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      onToggleSidebar();
    }
  }, [location.pathname]);

  const hasAccess = (accessCode) => {
    // Developer outlet (outlet_id = 4) dapat melihat semua menu
    if (userTokenData?.outlet_id === 4) {
      return true;
    }
    if (!userTokenData?.menu_access) return false;
    return userTokenData.menu_access.includes(Number(accessCode));
  };

  const menuSections = [
    {
      title: "MANAGEMENT",
      items: [
        { accessCode: 1, icon: "bi-people-fill", label: "Users", path: "/" },
        { accessCode: 0, icon: "bi-building", label: "Outlet", path: "/outlet" },
        { accessCode: 2, icon: "bi-cup-straw", label: "Menus", path: "/menu" },
        { accessCode: 3, icon: "bi-tags-fill", label: "Discounts", path: "/discount" },
        { accessCode: 9, icon: "bi-people-fill", label: "Membership", path: "/member" },
        { accessCode: 12, icon: "bi-cash-stack", label: "Tax", path: "/tax" },
      ]
    },
    {
      title: "FINANCIAL",
      items: [
        { accessCode: 5, icon: "bi-currency-exchange", label: "Serving Types", path: "/serving-type" },
        { accessCode: 8, icon: "bi-bank", label: "Payment Types", path: "/payment-type" },
        // { accessCode: 10, icon: "bi-coin", label: "Payment Categories", path: "/payment-management" }
      ]
    },
    {
      title: "REPORTING",
      items: [
        { accessCode: 4, icon: "bi-book", label: "Reports", path: "/report" },
        { accessCode: 6, icon: "bi-clipboard-check", label: "Ingredients Order", path: "/ingredient-order" },
        { accessCode: 7, icon: "bi-box-seam", label: "Ingredients Report", path: "/ingredient-report" }
      ]
    },
    {
      title: "WHATSAPP MANAGEMENT",
      items: [
        { accessCode: 11, icon: "bi-whatsapp", label: "Whatsapp", path: "/whatsapp" }
      ]
    },
    // Revenue Generator - Only for menu_access 13
    ...(() => {
      let hasMenuAccess13 = false;
      if (Array.isArray(userTokenData?.menu_access)) {
        hasMenuAccess13 = userTokenData.menu_access.map(String).includes("13");
      } else if (typeof userTokenData?.menu_access === "string") {
        hasMenuAccess13 = userTokenData.menu_access.split(",").map(x => x.trim()).includes("13");
      }
      if (hasMenuAccess13) {
        return [{
          title: "DEVELOPER TOOLS",
          items: [
            { accessCode: 13, icon: "bi-gear-wide-connected", label: "Revenue Generator", path: "/revenue-generator" }
          ]
        }];
      }
      return [];
    })()
  ];

  const warehouseMenus = [
    { icon: "bi-basket", label: "Ingredients", path: "/ingredient" },
    { icon: "bi-cart", label: "Ingredients Order Outlet", path: "/ingredient-order-outlet" }
  ];

  const renderMenuSection = (section) => {
    const visibleItems = section.items.filter(item => hasAccess(item.accessCode));
    if (visibleItems.length === 0) return null;

    return (
      <div key={section.title}>
        <li className="sidebar-title">{section.title}</li>
        {visibleItems.map(item => (
          <li key={item.path} className="sidebar-item">
            <Link to={item.path} className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}>
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </div>
    );
  };

  return (
    <div id="sidebar" className={`sidebar ${isOpen ? "active" : ""}`}
      style={{ width: isOpen ? "250px" : "80px" }}
    >
      <div className="sidebar-wrapper active">
        <div className="sidebar-header position-relative">
          <div className="d-flex justify-content-between align-items-center">
            <div className="logo">
              <Link to="/">
                {isOpen ? (
                  <>
                    <span style={{fontSize: '1.5rem'}}>🍽️</span>
                    <span>GASPOLL</span>
                  </>
                ) : (
                  <span style={{fontSize: '1.5rem'}}>🍽️</span>
                )}
              </Link>
            </div>
          </div>
        </div>
        <div className="sidebar-menu">
          <ul className="menu" style={{listStyle: 'none', padding: 0, margin: 0}}>
            {menuSections.map(renderMenuSection)}

            {userTokenData.role === "Warehouse" && (
              <>
                <li className="sidebar-title">Warehouse</li>
                {warehouseMenus.map(item => (
                  <li key={item.path} className="sidebar-item">
                    <Link to={item.path} className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}>
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
