import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import { MenuModal } from "./components/MenuModal";

function App() {
  const [menus, setMenus] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    const response = await axios.get("http://localhost:5000/menu");
    setMenus(response.data.data);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveMenu = (newMenu) => {
    setMenus([...menus, newMenu]);
    closeModal();
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
            {/* <section className="section">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Example Content</h4>
                </div>
                <div className="card-body">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Consectetur quas omnis laudantium tempore exercitationem,
                  expedita aspernatur sed officia asperiores unde tempora maxime
                  odio reprehenderit distinctio incidunt! Vel aspernatur dicta
                  consequatur!
                </div>
              </div>
            </section> */}
            <section class="section">
              <div class="card">
                <div class="card-header">
                  Data Menu
                  <div class="float-lg-end">
                    <div
                      className="button btn btn-primary rounded-pill"
                      onClick={openModal}
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
                              <div className="buttons">
                                <a href="#" className="btn info btn-primary">
                                  <i className="bi bi-pencil"></i>
                                </a>
                              </div>
                              <div className="buttons">
                                <a href="#" className="btn info btn-secondary">
                                  <i class="bi bi-eye"></i>
                                </a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* <tr>
                        <td>Emmanuel</td>
                        <td>eget.lacus.Mauris@feugiatSednec.org</td>
                        <td>(016977) 8208</td>
                        <td>Saint-Remy-Geest</td>
                        <td>
                          <span class="badge bg-success">Active</span>
                        </td>
                      </tr> */}
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
      />
    </div>
  );
}

export default App;
