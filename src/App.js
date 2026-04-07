// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { ConfigProvider } from 'antd';
import { antdThemeConfig } from './config/antdTheme';
import { ThemeProvider } from './contexts/ThemeContext';
import { isTokenValid, extractUserTokenData } from "./helpers/token";
import { normalizeMenuAccess } from "./helpers/normalizeMenuAccess";
import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import Swal from "sweetalert2";
import 'antd/dist/reset.css'; // Ant Design CSS reset
import './styles/modern-theme.css'; // Modern theme variables

// Import pages
import Menu from "./components/Menu";
import User from "./components/User";
import Login from "./components/Login";
import Discount from "./components/Discount";
// import Profile from "./components/Profile";
import Report from "./components/Report";
import ServingType from "./components/ServingType";
import Outlet from "./components/Outlet";
import Ingredient from "./components/Ingredient";
import IngredientOrderList from "./components/IngredientOrderList";
import IngredientOrderListOutlet from "./components/IngredientOrderListOutlet";
import IngredientReport from "./components/IngredientReport";
import PaymentType from "./components/PaymentType";
import Members from "./components/Member";
import WhatsappPage from "./components/WhatsappPage";
import Tax from "./components/Tax";
import TaxFullscreen from "./components/TaxFullscreen";
import RevenueGenerator from "./components/RevenueGenerator";

function Layout({ children, userTokenData, toggleSidebar, isSidebarOpen, setIsLoggedIn }) {
  const location = useLocation();
  // detect fullscreen path both with and without param: /tax-fullscreen or /tax-fullscreen/:id
  const isFullscreen = location.pathname.startsWith("/tax-fullscreen");

  if (isFullscreen) {
    // Do not render layout, show child in fullscreen
    return <>{children}</>;
  }

  return (
    <div>
      <Sidebar isOpen={isSidebarOpen} userTokenData={userTokenData} onToggleSidebar={toggleSidebar} />
      <div id="main" className="layout-navbar">
        <Header
          onToggleSidebar={toggleSidebar}
          userTokenData={userTokenData}
          setIsLoggedIn={setIsLoggedIn}
        />
        <div id="main-content">{children}</div>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  // Initial sidebar state: closed on mobile, open on desktop
  const [isSidebarOpen, setSidebarOpen] = useState(
    window.innerWidth > 768
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userTokenData, setUserTokenData] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Helper function to check access - developer outlet (4) can see everything
  const hasMenuAccess = (accessCode) => {
    if (!userTokenData?.menu_access) return false;
    // Developer outlet (outlet_id = 4) can access all menus
    if (userTokenData?.outlet_id === 4) return true;
    return userTokenData.menu_access.includes(accessCode);
  };

  // Handle window resize - auto close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isValidedToken = isTokenValid(token);
    // if current location is public fullscreen, avoid showing expired-token alert/redirect
    const currentPath = window.location.pathname || "";
    const isPublicFullscreenPath = currentPath.startsWith("/tax-fullscreen");

    if (isValidedToken.valid) {
      setIsLoggedIn(true);
      if (!userTokenData) {
        const data = extractUserTokenData(token);
        data.menu_access = normalizeMenuAccess(data.menu_access);
        setUserTokenData(data);
      }
    } else {
      setUserTokenData(null);
      // Only show session-expired alert & redirect when NOT accessing public fullscreen
      if (isValidedToken.message && !isPublicFullscreenPath) {
        Swal.fire({
          icon: "info",
          title: isValidedToken.message,
        }).then(() => {
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
        });
      }
    }
    setTimeout(() => setIsLoading(false), 1000);
  }, [userTokenData]);

  return (
    <ThemeProvider>
      <ConfigProvider theme={antdThemeConfig}>
        <div id="app">
          <Router>
          {isLoading ? (
            <div className="custom-container">
              <div className="spinner-border" />
            </div>
          ) : isLoggedIn ? (
            <Layout
              userTokenData={userTokenData}
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              setIsLoggedIn={setIsLoggedIn}
            >
            <Routes>
                {/* Public fullscreen with id param - accessible for all logged-in users as well */}
                <Route path="/tax-fullscreen/:id" element={<TaxFullscreen />} />
              {/* Management */}
              {hasMenuAccess(1) && (
                <Route path="/" element={<User />} />
              )}
              {hasMenuAccess(0) && (
                <Route path="/outlet" element={<Outlet />} />
              )}
              {hasMenuAccess(2) && (
                <Route path="/menu" element={<Menu userTokenData={userTokenData} />} />
              )}
              {hasMenuAccess(3) && (
                <Route path="/discount" element={<Discount userTokenData={userTokenData} />} />
              )}
              {hasMenuAccess(9) && (
                <Route path="/member" element={<Members userTokenData={userTokenData} />} />
              )}
              {hasMenuAccess(12) && (
                <>
                  {/* /tax is management view (requires login) */}
                  <Route path="/tax" element={<Tax userTokenData={userTokenData} />} />
                  {/* Authenticated fullscreen without id (will use token outlet) */}
                  <Route path="/tax-fullscreen" element={<TaxFullscreen userTokenData={userTokenData} />} />
                  {/* Public fullscreen with id param - accessible without login */}
                  <Route path="/tax-fullscreen/:id" element={<TaxFullscreen />} />
                </>
              )}


              {/* Financial */}
              {hasMenuAccess(5) && (
                <Route path="/serving-type" element={<ServingType userTokenData={userTokenData} />} />
              )}
              {hasMenuAccess(8) && (
                <Route path="/payment-type" element={<PaymentType userTokenData={userTokenData} />} />
              )}
              {hasMenuAccess(10) && (
                <Route path="/payment-management" element={<h1>Payment Management</h1>} />
              )}

              {/* Reporting */}
              {hasMenuAccess(4) && (
                <Route path="/report" element={<Report userTokenData={userTokenData} />} />
              )}
              {hasMenuAccess(6) && (
                <Route path="/ingredient-order" element={<IngredientOrderList userTokenData={userTokenData} />} />
              )}
              {hasMenuAccess(7) && (
                <Route path="/ingredient-report" element={<IngredientReport userTokenData={userTokenData} />} />
              )}

              {/* Warehouse role only */}
              {userTokenData.role === "Warehouse" && (
                <>
                  <Route path="/ingredient" element={<Ingredient />} />
                  <Route path="/ingredient-order-outlet" element={<IngredientOrderListOutlet />} />
                </>
              )}

              {/* Whatsapp */}
              {hasMenuAccess(11) && (
                <Route path="/whatsapp" element={<WhatsappPage userTokenData={userTokenData} />} />
              )}

              {/* Revenue Generator - Only for outlet 0 and 4 */}
              {(userTokenData.outlet_id === 0 || userTokenData.outlet_id === 4) && (
                <Route path="/revenue-generator" element={<RevenueGenerator userTokenData={userTokenData} />} />
              )}

              {/* Profile always available */}
              {/* <Route path="/profile" element={<Profile userTokenData={userTokenData} />} /> */}
            </Routes>
            {/* <Footer /> */}
          </Layout>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Login setIsLoggedIn={setIsLoggedIn} setUserTokenData={setUserTokenData} />
              }
            />
            {/* Public fullscreen by id - allow access without login */}
            <Route path="/tax-fullscreen/:id" element={<TaxFullscreen />} />
            {/* Redirect any other unauthenticated route to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
        </Router>
      </div>
      </ConfigProvider>
    </ThemeProvider>
  );
}
export default App;