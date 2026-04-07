import React, { useState, useEffect } from "react";
import axios from "axios";
import { PaymentTypeModal } from "./PaymentTypeModal";
import { useTheme } from "../contexts/ThemeContext";
import Swal from "sweetalert2";
import "../styles/payment-type-module.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const PaymentType = ({ userTokenData }) => {
  const { isDark } = useTheme();
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentCategories, setPaymentCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedItems, setReorderedItems] = useState([]);

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
    try {
      const response = await axios.get(`${apiBaseUrl}/payment-management`, {
        params: {
          outlet_id: userTokenData.outlet_id,
        },
      });
      setPaymentTypes(response.data.data.payment_type);
      setPaymentCategories(response.data.data.payment_categories);
    } catch (error) {
      console.error("Error fetching payment types:", error);
    }
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

  const handleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
    if (!isReorderMode) {
      setReorderedItems([...paymentTypes]);
    }
  };

  const moveItem = (index, direction) => {
    const newItems = [...reorderedItems];
    if (direction === "up" && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      setReorderedItems(newItems);
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setReorderedItems(newItems);
    }
  };

  const saveOrder = async () => {
    try {
      const paymentTypesOrder = reorderedItems.map((item, index) => ({
        id: item.id,
        order: index + 1,
      }));

      await axios.put(`${apiBaseUrl}/update-payment-order`, {
        paymentTypesOrder: paymentTypesOrder,
        outlet_id: userTokenData.outlet_id,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Urutan payment type berhasil diubah",
        showConfirmButton: false,
        timer: 1500,
      });

      setIsReorderMode(false);
      await getPaymentTypes();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Gagal mengubah urutan",
      });
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
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="float-lg-end" style={{ display: "flex", gap: "8px" }}>
                {isReorderMode ? (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={saveOrder}
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.875rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="bi bi-check"></i> Simpan Urutan
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleReorderMode}
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.875rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="bi bi-x"></i> Batal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={handleReorderMode}
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.875rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="bi bi-arrow-up-down"></i> Ubah Urutan
                    </button>
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
                  </>
                )}
              </div>
            </div>
            <div className="card-body">
              {/* Desktop Table View */}
              <div className="table-responsive desktop-view">
                <table className="table table-striped payment-type-table" id="table1">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>No</th>
                      <th style={{ width: "30%" }}>Name</th>
                      <th style={{ width: "25%" }}>Status</th>
                      <th style={{ width: "35%" }}>Updated</th>
                      {isReorderMode && <th style={{ width: "5%", textAlign: "center" }}>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(isReorderMode ? reorderedItems : paymentTypes).map((paymentType, index) => (
                      <tr
                        key={paymentType.id}
                        className="payment-type-row"
                        onClick={() => !isReorderMode && openModal(paymentType.id)}
                        style={{
                          cursor: isReorderMode ? "default" : "pointer",
                          transition: "all 0.3s ease",
                          backgroundColor: isDark ? "#1e1e1e" : "transparent",
                        }}
                      >
                        <td style={{ color: isDark ? "#e0e0e0" : "inherit" }}>
                          {index + 1}
                        </td>
                        <td style={{ color: isDark ? "#e0e0e0" : "inherit" }}>
                          <span className="payment-type-name-cell" style={{ color: isDark ? "#fff" : "#2d3436" }}>
                            {paymentType.name}
                            <span
                              style={{
                                display: "block",
                                fontSize: "0.8rem",
                                color: isDark ? "#aaa" : "#999",
                                marginTop: "2px",
                              }}
                            >
                              {paymentType.payment_category_name}
                            </span>
                          </span>
                        </td>
                        <td style={{ color: isDark ? "#e0e0e0" : "inherit" }}>
                          <span className={`payment-type-status ${paymentType.is_active === 1 ? 'active' : 'inactive'}`}>
                            {paymentType.is_active === 1 ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td style={{ color: isDark ? "#ccc" : "inherit" }}>
                          <span className="payment-type-updated-cell">
                            {paymentType.updated_at ? new Date(paymentType.updated_at).toLocaleString("id-ID", { 
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
                        {isReorderMode && (
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveItem(index, "up");
                              }}
                              disabled={index === 0}
                              style={{ marginRight: "4px" }}
                              title="Naik"
                            >
                              <i className="bi bi-arrow-up"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveItem(index, "down");
                              }}
                              disabled={index === (isReorderMode ? reorderedItems.length : paymentTypes.length) - 1}
                              title="Turun"
                            >
                              <i className="bi bi-arrow-down"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-view">
                <div className="payment-types-card-container">
                  {(isReorderMode ? reorderedItems : paymentTypes).map((paymentType, index) => (
                    <div
                      key={paymentType.id}
                      className="payment-type-card-item"
                      onClick={() => !isReorderMode && openModal(paymentType.id)}
                      style={{
                        backgroundColor: isDark ? "#262626" : "white",
                        borderColor: isDark ? "#444" : "#e9ecef",
                        cursor: isReorderMode ? "default" : "pointer",
                      }}
                    >
                      <div className="payment-type-card-header">
                        <div className="payment-type-card-number">{index + 1}</div>
                        <div className="payment-type-card-content">
                          <div className="payment-type-card-name" style={{ color: isDark ? "#fff" : "#2d3436" }}>
                            {paymentType.name}
                          </div>
                          <div className="payment-type-card-category" style={{ color: isDark ? "#aaa" : "#6c757d" }}>
                            {paymentType.payment_category_name}
                          </div>
                        </div>
                      </div>
                      <div className="payment-type-card-body">
                        <div className="payment-type-card-field">
                          <span className="payment-type-card-label" style={{ color: isDark ? "#999" : "#9e9e9e" }}>Status</span>
                          <span className={`payment-type-card-status ${paymentType.is_active === 1 ? 'active' : 'inactive'}`}>
                            {paymentType.is_active === 1 ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </div>
                        <div className="payment-type-card-field">
                          <span className="payment-type-card-label" style={{ color: isDark ? "#999" : "#9e9e9e" }}>Updated</span>
                          <span className="payment-type-card-date" style={{ color: isDark ? "#ccc" : "#6c757d" }}>
                            {paymentType.updated_at ? new Date(paymentType.updated_at).toLocaleString("id-ID", { 
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
                      {isReorderMode && (
                        <div className="payment-type-reorder-actions" style={{ marginTop: "12px", display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveItem(index, "up");
                            }}
                            disabled={index === 0}
                            title="Naik"
                          >
                            <i className="bi bi-arrow-up"></i> Naik
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveItem(index, "down");
                            }}
                            disabled={index === (isReorderMode ? reorderedItems.length : paymentTypes.length) - 1}
                            title="Turun"
                          >
                            <i className="bi bi-arrow-down"></i> Turun
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
