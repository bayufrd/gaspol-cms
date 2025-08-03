import React, { useState, useEffect, useCallback } from "react";
import { MenuModal } from "../components/MenuModal";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Menu = ({ userTokenData }) => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // Add view mode state

  useEffect(() => {
    getMenus();
  }, []);

  const getMenus = async () => {
    const response = await axios.get(`${apiBaseUrl}/v2/menu`, {
      params: {
        outlet_id: userTokenData.outlet_id,
      },
    });
    setMenus(response.data.data);
    setFilteredMenus(response.data.data);
  };

  useEffect(() => {
    const results = menus.filter(menu =>
      menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.menu_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.price.toString().includes(searchTerm)
    );
    setFilteredMenus(results);
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
          className={`position-absolute top-0 end-0 m-2 badge ${menu.is_active === 1
              ? 'bg-success'
              : 'bg-danger'
            }`}
        >
          {menu.is_active === 1 ? "Aktif" : "Tidak Aktif"}
        </span>
      </div>
    );
  };

  const renderGridView = () => (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
      {filteredMenus.map((menu) => (
        <div className="col" key={menu.id}>
          <div 
            className="card h-100 shadow-lg product-card transition-all" 
            style={{
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
              willChange: 'transform, box-shadow'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div
              className="menu-image-container position-relative"
              style={{
                height: '180px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
              }}
            >
              <img
                src={menu.image_url ? `${apiBaseUrl}/${menu.image_url}` : "/assets/images/menu-template.svg"}
                alt={menu.name}
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                  transition: 'transform 0.3s ease'
                }}
                className="product-image"
              />
              <span
                className={`position-absolute top-0 end-0 m-2 badge ${menu.is_active === 1 ? 'bg-success' : 'bg-danger'}`}
                style={{ 
                  fontSize: '0.7em', 
                  fontWeight: 'normal',
                  borderRadius: '4px'
                }}
              >
                {menu.is_active === 1 ? "Aktif" : "Tidak Aktif"}
              </span>
            </div>
            <div 
              className="card-body text-center p-3" 
              style={{ 
                backgroundColor: 'white', 
                borderBottomLeftRadius: '12px', 
                borderBottomRightRadius: '12px' 
              }}
            >
              <h6 
                className="card-title mb-2" 
                style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  fontWeight: '600'
                }}
              >
                {menu.name}
              </h6>
              <p 
                className="card-text text-muted mb-1" 
                style={{ 
                  fontSize: '0.8em',
                  color: '#6c757d'
                }}
              >
                {menu.menu_type}
              </p>
              <h6 
                className="card-subtitle mb-3 text-success" 
                style={{ 
                  fontSize: '0.9em',
                  fontWeight: 'bold'
                }}
              >
                Rp. {menu.price.toLocaleString()}
              </h6>
              <div className="action-buttons">
                <button
                  className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                  onClick={() => openModal(menu.id)}
                  style={{
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)',
                    willChange: 'transform'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nama Menu</th>
            <th>Tipe Menu</th>
            <th>Harga</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredMenus.map((menu) => (
            <tr key={menu.id}>
              <td>{menu.name}</td>
              <td>{menu.menu_type}</td>
              <td>Rp. {menu.price.toLocaleString()}</td>
              <td>
                <span className={`badge ${menu.is_active === 1 ? 'bg-success' : 'bg-danger'}`}>
                  {menu.is_active === 1 ? "Aktif" : "Tidak Aktif"}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openModal(menu.id)}
                >
                  <i className="bi bi-pencil me-2"></i>Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
              <div className="container-fluid px-0">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-6 col-lg-8">
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-search"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, type or price"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-3 col-lg-2">
                    <div className="btn-group w-100" role="group">
                      <button 
                        type="button" 
                        className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <i className="bi bi-grid"></i>
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <i className="bi bi-list-ul"></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-12 col-md-3 col-lg-2">
                    <button
                      className="btn btn-primary rounded-pill w-100"
                      onClick={() => openModal(null)}
                    >
                      <i className="bi bi-plus"></i> Tambah Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              {viewMode === 'grid' ? renderGridView() : renderListView()}
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