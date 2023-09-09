import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import { MenuModal } from "./components/MenuModal";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [menus, setMenus] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  useEffect(() => {
    getMenus();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow", "padding-right");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  const getMenus = async () => {
    const response = await axios.get(`${apiBaseUrl}/menu`);
    setMenus(response.data.data);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const openModal = (menuId) => {
    setSelectedMenuId(menuId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveMenu = async (newMenu) => {
    setMenus([...menus, newMenu]);
    closeModal();

    try {
      await getMenus();
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  return (
    <div id="app">
      <Sidebar isOpen={isSidebarOpen} />
      <div id="main" className="layout-navbar">
        {/* Header Section */}
        <Header onToggleSidebar={toggleSidebar} />
        <div id="main-content">
          <div className="page-heading">
            <div className="page-title">
              <div className="row">
                <div className="col-12 col-md-6 order-md-1 order-last">
                  <h3>Management Menu</h3>
                  <p className="text-subtitle text-muted">
                    Management Menu
                  </p>
                </div>
                <div className="col-12 col-md-6 order-md-2 order-first">
                  <nav
                    aria-label="breadcrumb"
                    className="breadcrumb-header float-start float-lg-end"
                  >
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="index.html">Dashboard</a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Management Menu
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
            <section class="section">
              <div class="card">
                <div class="card-header">
                  Data Menu
                  <div class="float-lg-end">
                    <div
                      className="button btn btn-primary rounded-pill"
                      onClick={() => openModal(null)}
                    >
                      <i class="bi bi-plus"></i> Tambah Data
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <table class="table table-striped" id="table1">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Menu Type</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menus.map((menu, index) => (
                        <tr key={menu.id}>
                          <td>{index + 1}</td>
                          <td>{menu.name}</td>
                          <td>{menu.menu_type}</td>
                          <td>{menu.price}</td>
                          <td>
                            <div className="action-buttons">
                              <div className="buttons btn info btn-primary" onClick={() => openModal(menu.id)}>
                                <i className="bi bi-pencil"></i>
                              </div>
                              {/* <div className="buttons btn info btn-secondary" onClick={() => openDetail(menu.id)}>
                                <i class="bi bi-eye"></i>
                              </div> */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
          {/* Footer Section */}
          <Footer />
        </div>
      </div>
      <MenuModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveMenu}
        selectedMenuId={selectedMenuId}
        getMenus={getMenus} 
      />
    </div>
  );
}

export default App;
