import React, { useState, useEffect } from "react";
import axios from "axios";
import { PaymentTypeModal } from "./PaymentTypeModal";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const PaymentType= ({ userTokenData }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentCategories, setPaymentCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState(null);

  useEffect(() => {
    getPaymentTypes();
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

  const getPaymentTypes = async () => {
    const response = await axios.get(`${apiBaseUrl}/payment-management`, {
      params: {
        outlet_id: userTokenData.outlet_id,
      },
    });
    setPaymentTypes(response.data.data.payment_type);
    setPaymentCategories(response.data.data.payment_categories);
  };

  const openModal = (paymentType) => {
    setSelectedPaymentTypeId(paymentType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSavePaymentType = async (newPaymentType) => {
    setPaymentTypes([...paymentTypes, newPaymentType]);
    closeModal();

    try {
      await getPaymentTypes();
    } catch (error) {
      console.error("Error fetching payment types:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Payment Types</h3>
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
                    <th>Category</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTypes.map((paymentType, index) => (
                    <tr key={paymentType.id}>
                      <td>{index + 1}</td>
                      <td>{paymentType.name}</td>
                      <td>{paymentType.payment_category_name}</td>
                      <td>{paymentType.is_active === 1 ? "Ya" : "Tidak"}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(paymentType.id)}
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

      <PaymentTypeModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSavePaymentType}
        selectedPaymentTypeId={selectedPaymentTypeId}
        getPaymentTypes={getPaymentTypes}
        userTokenData={userTokenData}
        paymentCategories={paymentCategories}
      />
    </div>
  );
};

export default PaymentType;
