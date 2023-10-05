import React, { useState, useEffect } from "react";
import { MenuModal } from "../components/MenuModal";
import axios from "axios";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Menu = () => {
  const [menus, setMenus] = useState([]);
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
    const response = await axios.get(`${apiBaseUrl}/v2/menu`);
    setMenus(response.data.data);
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
      console.error("Error fetching menus:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Menu</h3>
            </div>
            {/* <div className="col-12 col-md-6 order-md-2 order-first">
              <nav
                aria-label="breadcrumb"
                className="breadcrumb-header float-start float-lg-end"
              >
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="index.html">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Management Menu
                  </li>
                </ol>
              </nav>
            </div> */}
          </div>
        </div>
        <section class="section">
          <div class="card">
            <div class="card-header">
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
                    <th>Gambar</th>
                    <th>Name</th>
                    <th>Menu Type</th>
                    <th>Price</th>
                    <th>Is Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu, index) => (
                    <tr key={menu.id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          className="w-100"
                          src={
                            menu.image_url
                              ? `${apiBaseUrl}/${menu.image_url}`
                              : "/assets/images/menu-template.svg"
                          }
                          alt="Menu"
                        />
                      </td>
                      <td>{menu.name}</td>
                      <td>{menu.menu_type}</td>
                      <td>{menu.price}</td>
                      <td>{menu.is_active === 1 ? "Aktif" : "Tidak Aktif"}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(menu.id)}
                          >
                            <i className="bi bi-pencil"></i>
                          </div>
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

      <MenuModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveMenu}
        selectedMenuId={selectedMenuId}
        getMenus={getMenus}
      />
    </div>
  );
};

export default Menu;
