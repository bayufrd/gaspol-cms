import React, { useState, useEffect, useCallback } from "react";
import { MenuModal } from "../components/MenuModal";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Menu = ({ userTokenData }) => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]); // State to hold filtered menus
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  useEffect(() => {
    getMenus();
  }, []);

  // Fetch menus
  const getMenus = async () => {
    const response = await axios.get(`${apiBaseUrl}/v2/menu`, {
      params: {
        outlet_id: userTokenData.outlet_id,
      },
    });
    setMenus(response.data.data);
    setFilteredMenus(response.data.data); // Initialize filtered menus
  };

  // Filter menus based on the search term
  useEffect(() => {
    const results = menus.filter(menu =>
      menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.menu_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.price.toString().includes(searchTerm)  // Check price as string
    );
    setFilteredMenus(results); // Update filtered menus based on search
  }, [searchTerm, menus]);

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
    await getMenus();
  };

  const renderMenuImage = (menu) => {
    const imageUrl = menu.image_url
      ? `${apiBaseUrl}/${menu.image_url}`
      : "/assets/images/menu-template.svg";

    return (
      <div
        className="menu-image-container position-relative"
        style={{
          height: '250px',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <img
          src={imageUrl}
          alt={menu.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
        <span
          className={`position-absolute top-0 end-0 m-2 badge ${
            menu.is_active === 1
              ? 'bg-success'
              : 'bg-danger'
          }`}
        >
          {menu.is_active === 1 ? "Aktif" : "Tidak Aktif"}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Menu</h3>
            </div>
          </div>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="float-lg-start">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Search by name, type or price"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
                  style={{ width: '450px' }} // Adjust the width as necessary
                />
              </div>
              <div className="float-lg-end">
                <button
                  className="btn btn-primary rounded-pill"
                  onClick={() => openModal(null)}
                >
                  <i className="bi bi-plus"></i> Tambah Data
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                {filteredMenus.map((menu) => (
                  <div className="col" key={menu.id}>
                    <div className="card h-100 shadow-sm">
                      {renderMenuImage(menu)}
                      <div className="card-body text-center">
                        <h5 className="card-title">{menu.name}</h5>
                        <p className="card-text text-muted mb-1">
                          {menu.menu_type}
                        </p>
                        <h6 className="card-subtitle mb-3 text-success">
                          Rp. {menu.price.toLocaleString()}
                        </h6>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary"
                            onClick={() => openModal(menu.id)}
                          >
                            <i className="bi bi-pencil me-2"></i>Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        userTokenData={userTokenData}
      />
    </div>
  );
};

export default Menu;