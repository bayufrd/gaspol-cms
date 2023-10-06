import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { isTokenValid, extractUserTokenData } from "./helpers/token";
import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import Menu from "./components/Menu";
import Login from "./components/Login";
import Swal from "sweetalert2";

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
        setUserTokenData(extractUserTokenData(token));
      }
    } else {
      if (isValidedToken.message) {
        Swal.fire({
          icon: "Info",
          title: isValidedToken.message,
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
            <Sidebar isOpen={isSidebarOpen} userTokenData={userTokenData}/>
            <div id="main" className="layout-navbar">
              <Header
                onToggleSidebar={toggleSidebar}
                userTokenData={userTokenData}
                setIsLoggedIn={setIsLoggedIn}
              />
              <div id="main-content">
                <Routes>
                  {userTokenData && userTokenData.menu_access.includes("2") && (
                    <Route
                      path="/"
                      element={<Menu userTokenData={userTokenData} />}
                    />
                  )}
                </Routes>
                <Footer />
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                  setUserTokenData={setUserTokenData}
                />
              }
            />
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
