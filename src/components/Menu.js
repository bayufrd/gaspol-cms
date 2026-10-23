import React, { useState, useEffect, useRef } from "react";
import Swal from "../utils/alerts";
import { MenuModal } from "../components/MenuModal";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import "../styles/menu-module.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const MENU_BATCH_SIZE = 50;

const Menu = ({ userTokenData }) => {
  const { isDark } = useTheme();
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(MENU_BATCH_SIZE);
  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    document.title = "Dashboard - Gaspoll Content Management System";

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

  const visibleMenus = filteredMenus.slice(0, visibleCount);
  const hasMoreMenus = visibleCount < filteredMenus.length;

  useEffect(() => {
    setVisibleCount(MENU_BATCH_SIZE);
  }, [searchTerm, menus, viewMode]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreMenus) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setVisibleCount((count) => Math.min(count + MENU_BATCH_SIZE, filteredMenus.length));
      window.requestAnimationFrame(() => { loadingMoreRef.current = false; });
    }, { rootMargin: "240px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreMenus, filteredMenus.length]);

  const openModal = (menuId) => {
    setSelectedMenuId(menuId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveMenu = async (menuData) => {
    setMenus((prevMenus) => {
      if (menuData.id) {
        return prevMenus.map((m) =>
          m.id === menuData.id ? menuData : m
        );
      }
      return [...prevMenus, menuData];
    });

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
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/images/menu-template.svg";
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
    <div className="menu-grid-container">
      {visibleMenus.map((menu) => (
        <div key={menu.id} className="menu-card-wrapper">
          <button
            type="button"
            className="menu-card"
            onClick={() => openModal(menu.id)}
            aria-label={`Buka detail menu ${menu.name}`}
          >
            <div className="menu-image-container">
              <img
                src={menu.image_url ? `${apiBaseUrl}/${menu.image_url}` : "/assets/images/menu-template.svg"}
                alt=""
                className="menu-image"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/menu-template.svg";
                }}
              />
              <span className={`menu-badge ${menu.is_active === 1 ? 'badge-active' : 'badge-inactive'}`}>
                <span aria-hidden="true"></span>{menu.is_active === 1 ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="menu-card-body">
              <span className="menu-card-type">{menu.menu_type || "Menu"}</span>
              <h6 className="menu-card-title">{menu.name}</h6>
              <div className="menu-card-footer">
                <strong className="menu-card-price">Rp{Number(menu.price || 0).toLocaleString("id-ID")}</strong>
                <span className="menu-card-action" aria-hidden="true"><i className="bi bi-arrow-up-right"></i></span>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="menu-list-container">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nama Menu</th>
              <th>Tipe Menu</th>
              <th>Harga</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleMenus.map((menu) => (
              <tr key={menu.id} className="menu-list-row" onClick={() => openModal(menu.id)}>
                <td>{menu.name}</td>
                <td>{menu.menu_type}</td>
                <td>Rp. {menu.price.toLocaleString()}</td>
                <td>
                  <span className={`menu-status-badge ${menu.is_active === 1 ? 'status-active' : 'status-inactive'}`}>
                    {menu.is_active === 1 ? "Aktif" : "Tidak Aktif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
              <div className="menu-header-controls">
                <div className="menu-search-wrapper">
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
                <div className="menu-view-toggle">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                    >
                      <i className="bi bi-grid"></i>
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('list')}
                      title="List View"
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                  </div>
                </div>
                <div className="menu-add-button">
                  <button
                    className="btn btn-primary"
                    onClick={() => openModal(null)}
                  >
                    <i className="bi bi-plus"></i> Tambah Data
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {viewMode === 'grid' ? renderGridView() : renderListView()}
              <div className="menu-load-more" ref={loadMoreRef} aria-live="polite">
                {hasMoreMenus ? (
                  <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span><span>Memuat menu berikutnya…</span></>
                ) : filteredMenus.length > 0 ? (
                  <span>Menampilkan {visibleMenus.length} dari {filteredMenus.length} menu</span>
                ) : (
                  <span>Tidak ada menu ditemukan</span>
                )}
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