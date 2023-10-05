import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { isTokenValid } from "./helpers/token";
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

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isValidedToken = isTokenValid(token);
    if(isValidedToken.valid) {
      setIsLoggedIn(true);
    } else {
      if(isValidedToken.message) {
        Swal.fire({
          icon: "Info",
          title: isValidedToken.message
        });
      }
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div id="app">
      {
        isLoading ? (
          <div className="custome-container">
            <div className="spinner-border" />
          </div>
        ) : (
          isLoggedIn ? (
            <div>
              <Sidebar isOpen={isSidebarOpen} />
              <div id="main" className="layout-navbar">
                <Header onToggleSidebar={toggleSidebar} />
                <div id="main-content">
                  <Router>
                    <Routes>
                      <Route path="/" element={<Menu />} />
                    </Routes>
                  </Router>
                  <Footer />
                </div>
              </div>
            </div>
          ) : (
            <Router>
              <Routes>
                <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn}/>} />
              </Routes>
            </Router>
          )
        ) 
      }
    </div>
  );
}

export default App;
