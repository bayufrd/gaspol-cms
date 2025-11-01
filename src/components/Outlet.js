import React, { useState, useEffect } from "react";
import { OutletModal } from "./OutletModal";
import axios from "axios";
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
                    <th>Outlet ID</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outlets.map((outlet, index) => (
                    <tr key={outlet.id}>
                      <td>{index + 1}</td>
                      <td>{outlet.id}</td>
                      <td>{outlet.name}</td>
                      <td>{outlet.address}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(outlet.id)}
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
