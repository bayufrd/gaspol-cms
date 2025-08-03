import React, { useState, useEffect } from "react";
import axios from "axios";
import { DiscountModal } from "./DiscountModal";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Discount = ({ userTokenData }) => {
  const [discounts, setDiscounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);

  useEffect(() => {
    getDiscounts();
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

  const getDiscounts = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/v2/discount`, {
        params: {
          outlet_id: userTokenData.outlet_id,
        },
      });
      setDiscounts(response.data.data);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  const openModal = (discountId) => {
    setSelectedDiscountId(discountId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveDiscount = async (newDiscount) => {
    setDiscounts([...discounts, newDiscount]);
    closeModal();

    try {
      await getDiscounts();
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  // Helper function to safely format number
  const formatNumber = (value) => {
    return value !== null && value !== undefined 
      ? value.toLocaleString() 
      : '-';
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Discounts</h3>
            </div>
          </div>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="float-lg-end">
                <div
                  className="button btn btn-primary rounded-pill"
                  onClick={() => openModal(null)}
                >
                  <i className="bi bi-plus"></i> Tambah Data
                </div>
              </div>
            </div>
            <div className="card-body">
              <table className="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Code</th>
                    <th>Tipe Diskon</th>
                    <th>Diskon untuk</th>
                    <th>Nilai discount</th>
                    <th>Tanggal mulai diskon</th>
                    <th>Tanggal akhir diskon</th>
                    <th>Minimal Pembelian</th>
                    <th>Maksimal diskon</th>
                    <th>Data terakhir diperbarui</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount, index) => (
                    <tr key={discount.id}>
                      <td>{index + 1}</td>
                      <td>{discount.code || '-'}</td>
                      <td>{discount.is_percent === 1 ? "Persen" : "Nominal"}</td>
                      <td>{discount.is_discount_cart === 1 ? "Keranjang" : "Peritem"}</td>
                      <td>
                        {discount.is_percent === 1
                          ? `${discount.value || '-'}%`
                          : `Rp. ${formatNumber(discount.value)}`
                        }
                      </td>
                      <td>{discount.start_date || '-'}</td>
                      <td>{discount.end_date || '-'}</td>
                      <td>Rp. {formatNumber(discount.min_purchase)}</td>
                      <td>Rp. {formatNumber(discount.max_discount)}</td>
                      <td>{discount.updated_at || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(discount.id)}
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

      <DiscountModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveDiscount}
        selectedDiscountId={selectedDiscountId}
        getDiscounts={getDiscounts}
        userTokenData={userTokenData}
      />
    </div>
  );
};

export default Discount;