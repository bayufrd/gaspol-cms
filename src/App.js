// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { isTokenValid, extractUserTokenData } from "./helpers/token";
import { normalizeMenuAccess } from "./helpers/normalizeMenuAccess";
import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";

// Import pages
import Menu from "./components/Menu";
import User from "./components/User";
import Login from "./components/Login";
import Discount from "./components/Discount";
import Profile from "./components/Profile";
import Report from "./components/Report";
import ServingType from "./components/ServingType";
import Outlet from "./components/Outlet";
import Swal from "sweetalert2";
import Ingredient from "./components/Ingredient";
import IngredientOrderList from "./components/IngredientOrderList";
import IngredientOrderListOutlet from "./components/IngredientOrderListOutlet";
import IngredientReport from "./components/IngredientReport";
import PaymentType from "./components/PaymentType";
import Members from "./components/Member";
import WhatsappPage from "./components/WhatsappPage";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userTokenData, setUserTokenData] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isValidedToken = isTokenValid(token);
  
    
  
    if (isValidedToken.valid) {
      setIsLoggedIn(true);
  
      if (!userTokenData) {
        const data = extractUserTokenData(token);
  
        // Normalisasi menu_access
        data.menu_access = normalizeMenuAccess(data.menu_access);
  
        console.log("Menu Access Normalized:", data.menu_access);
  
        setUserTokenData(data);
      }
    } else {
      setUserTokenData(null);
  
      if (isValidedToken.message) {
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
  
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [userTokenData]);
  

  return (
    <div id="app">
      <Router>
        {isLoading ? (
          <div className="custom-container">
            <div className="spinner-border" />
          </div>
        ) : isLoggedIn ? (
          <div>
            <Sidebar
              isOpen={isSidebarOpen}
              userTokenData={userTokenData}
              onToggleSidebar={toggleSidebar}
            />
            <div id="main" className="layout-navbar">
              <Header
                onToggleSidebar={toggleSidebar}
                userTokenData={userTokenData}
                setIsLoggedIn={setIsLoggedIn}
              />
              <div id="main-content">
                <Routes>
                  {/* Management */}
                  {userTokenData.menu_access.includes(1) && (
                    <Route path="/" element={<User />} />
                  )}
                  {userTokenData.menu_access.includes(12) && (
                    <Route path="/outlet" element={<Outlet />} />
                  )}
                  {userTokenData.menu_access.includes(2) && (
                    <Route path="/menu" element={<Menu userTokenData={userTokenData} />} />
                  )}
                  {userTokenData.menu_access.includes(3) && (
                    <Route path="/discount" element={<Discount userTokenData={userTokenData} />} />
                  )}
                  {userTokenData.menu_access.includes(9) && (
                    <Route path="/member" element={<Members userTokenData={userTokenData} />} />
                  )}

                  {/* Financial */}
                  {userTokenData.menu_access.includes(5) && (
                    <Route path="/serving-type" element={<ServingType userTokenData={userTokenData} />} />
                  )}
                  {userTokenData.menu_access.includes(8) && (
                    <Route path="/payment-type" element={<PaymentType userTokenData={userTokenData} />} />
                  )}
                  {userTokenData.menu_access.includes(10) && (
                    <Route path="/payment-management" element={<h1>Payment Management</h1>} />
                  )}

                  {/* Reporting */}
                  {userTokenData.menu_access.includes(4) && (
                    <Route path="/report" element={<Report userTokenData={userTokenData} />} />
                  )}
                  {userTokenData.menu_access.includes(6) && (
                    <Route path="/ingredient-order" element={<IngredientOrderList userTokenData={userTokenData} />} />
                  )}
                  {userTokenData.menu_access.includes(7) && (
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
                  {userTokenData.menu_access.includes(11) && (
                    <Route path="/whatsapp" element={<WhatsappPage userTokenData={userTokenData} />} />
                  )}

                  {/* Profile always available */}
                  <Route path="/profile" element={<Profile userTokenData={userTokenData} />} />
                </Routes>
                <Footer />
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} setUserTokenData={setUserTokenData} />} />
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
