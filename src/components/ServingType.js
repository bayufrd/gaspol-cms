import React, { useState, useEffect } from "react";
import axios from "axios";
import { ServingTypeModal } from "./ServingTypeModal";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/serving-type-module.css";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const ServingType = ({ userTokenData }) => {
  const { isDark } = useTheme();
  const [servingTypes, setServingTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedServingTypeId, setSelectedServingTypeId] = useState(null);

  useEffect(() => {
    getServingTypes();
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

  const getServingTypes = async () => {
    const response = await axios.get(`${apiBaseUrl}/serving-type`, {
      params: {
        outlet_id: userTokenData.outlet_id,
      },
    });
    setServingTypes(response.data.data);
  };

  const openModal = (servingType) => {
    setSelectedServingTypeId(servingType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveServingType = async (newServingType) => {
    setServingTypes([...servingTypes, newServingType]);
    closeModal();

    try {
      await getServingTypes();
    } catch (error) {
      console.error("Error fetching serving types:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Serving Types</h3>
            </div>
          </div>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="float-lg-end">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openModal(null)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bi bi-plus"></i> Tambah Data
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* Desktop Table View */}
              <div className="table-responsive desktop-view">
                <table className="table table-striped" id="table1">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>No</th>
                      <th style={{ width: "30%" }}>Name</th>
                      <th style={{ width: "25%" }}>Status</th>
                      <th style={{ width: "40%" }}>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servingTypes.map((servingType, index) => (
                      <tr
                        key={servingType.id}
                        className="serving-type-row"
                        onClick={() => openModal(servingType.id)}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <span className="serving-type-name-cell">{servingType.name}</span>
                        </td>
                        <td>
                          <span className={`serving-type-status ${servingType.is_active === 1 ? 'active' : 'inactive'}`}>
                            {servingType.is_active === 1 ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td>
                          <span className="serving-type-updated-cell">
                            {servingType.updated_at ? new Date(servingType.updated_at).toLocaleString("id-ID", { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit',
                              hour12: false 
                            }) : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-view">
                <div className="serving-types-card-container">
                  {servingTypes.map((servingType, index) => (
                    <div
                      key={servingType.id}
                      className="serving-type-card-item"
                      onClick={() => openModal(servingType.id)}
                    >
                      <div className="serving-type-card-header">
                        <div className="serving-type-card-number">{index + 1}</div>
                        <div className="serving-type-card-content">
                          <div className="serving-type-card-name">{servingType.name}</div>
                          <div className={`serving-type-card-status ${servingType.is_active === 1 ? 'active' : 'inactive'}`}>
                            {servingType.is_active === 1 ? 'Aktif' : 'Tidak Aktif'}
                          </div>
                        </div>
                      </div>
                      <div className="serving-type-card-body">
                        <div className="serving-type-card-field">
                          <span className="serving-type-card-label">Updated</span>
                          <span className="serving-type-card-date">
                            {servingType.updated_at ? new Date(servingType.updated_at).toLocaleString("id-ID", { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit',
                              hour12: false 
                            }) : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ServingTypeModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveServingType}
        selectedServingTypeId={selectedServingTypeId}
        getServingTypes={getServingTypes}
        userTokenData={userTokenData}
      />
    </div>
  );
};

export default ServingType;
