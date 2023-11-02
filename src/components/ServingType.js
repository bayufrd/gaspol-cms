import React, { useState, useEffect } from "react";
import axios from "axios";
import { ServingTypeModal } from "./ServingTypeModal";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const ServingType = ({ userTokenData }) => {
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
                    <th>Name</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servingTypes.map((servingType, index) => (
                    <tr key={servingType.id}>
                      <td>{index + 1}</td>
                      <td>{servingType.name}</td>
                      <td>{servingType.is_active === 1 ? "Ya" : "Tidak"}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(servingType.id)}
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
