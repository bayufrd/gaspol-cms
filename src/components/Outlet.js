import React, { useState, useEffect } from "react";
import { OutletModal } from "./OutletModal";
import axios from "axios";
import "../styles/outlet-module.css";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Outlet = () => {
  const [outlets, setOutlets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState(null);

  useEffect(() => {
    getOutlets();
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

  const getOutlets = async () => {
    const response = await axios.get(`${apiBaseUrl}/outlet`);
    setOutlets(response.data.data);
  };

  const openModal = (outletId) => {
    setSelectedOutletId(outletId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveOutlet = async (newOutlet) => {
    setOutlets([...outlets, newOutlet]);
    closeModal();

    try {
      await getOutlets();
    } catch (error) {
      console.error("Error fetching outlets:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Outlets</h3>
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
                      <th style={{ width: "10%" }}>ID</th>
                      <th style={{ width: "25%" }}>Name</th>
                      <th style={{ width: "60%" }}>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outlets
                      .filter(outlet => outlet.id !== 4 && outlet.name !== 'Development Testing')
                      .map((outlet, index) => (
                      <tr 
                        key={outlet.id}
                        className="outlet-row"
                        onClick={() => openModal(outlet.id)}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <span className="outlet-id-badge">{outlet.id}</span>
                        </td>
                        <td>
                          <span className="outlet-name-cell">{outlet.name}</span>
                        </td>
                        <td>
                          <span className="outlet-address-cell">{outlet.address}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-view">
                <div className="outlets-card-container">
                  {outlets
                    .filter(outlet => outlet.id !== 4 && outlet.name !== 'Development Testing')
                    .map((outlet, index) => (
                    <div
                      key={outlet.id}
                      className="outlet-card-item"
                      onClick={() => openModal(outlet.id)}
                    >
                      <div className="outlet-card-header">
                        <div className="outlet-card-number">{index + 1}</div>
                        <div className="outlet-card-content">
                          <div className="outlet-card-id">{outlet.id}</div>
                          <div className="outlet-card-name">{outlet.name}</div>
                        </div>
                      </div>
                      <div className="outlet-card-body">
                        <div className="outlet-card-field">
                          <span className="outlet-card-label">Address</span>
                          <span className="outlet-card-address">{outlet.address}</span>
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

      <OutletModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveOutlet}
        selectedOutletId={selectedOutletId}
        getOutlets={getOutlets}
      />
    </div>
  );
};

export default Outlet;
