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

  const openModal = (discountId = null) => {
    console.log('Opening modal with ID:', discountId);
    setSelectedDiscountId(discountId);
    setShowModal(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setShowModal(false);
    setSelectedDiscountId(null);
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

  const formatNumber = (value) => {
    return value !== null && value !== undefined
      ? value.toLocaleString()
      : '-';
  };

  const styles = {
    discountFlow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px', // Jarak antar card
    },
    discountCard: {
      flex: '1 1 calc(50% - 16px)', // 2 card per baris di desktop
      border: '1px solid #ddd',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '250px', // Tambahkan lebar minimum untuk card
    },
    actionButtons: {
      marginTop: '10px',
    },
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
              <div style={styles.discountFlow}>
                {discounts.map((discount, index) => (
                  <div style={styles.discountCard} key={discount.id}>
                    <h5>{discount.code || '-'}</h5>
                    <p>Tipe Diskon: {discount.is_percent === 1 ? "Persen" : "Nominal"}</p>
                    <p>Diskon untuk: {discount.is_discount_cart === 1 ? "Keranjang" : "Peritem"}</p>
                    <p>Nilai discount: {discount.is_percent === 1 ? `${discount.value || '-'}%` : `Rp. ${formatNumber(discount.value)}`}</p>
                    <p>Tanggal mulai diskon: {discount.start_date || '-'}</p>
                    <p>Tanggal akhir diskon: {discount.end_date || '-'}</p>
                    <p>Minimal Pembelian: Rp. {formatNumber(discount.min_purchase)}</p>
                    <p>Maksimal diskon: Rp. {formatNumber(discount.max_discount)}</p>
                    <p>Data terakhir diperbarui: {discount.updated_at || '-'}</p>
                    <div style={styles.actionButtons}>
                      <div
                        className="buttons btn info btn-primary"
                        onClick={() => openModal(discount.id)}
                      >
                        <i className="bi bi-pencil"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <DiscountModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSaveDiscount}
        discountId={selectedDiscountId}
        userTokenData={userTokenData}
        getDiscounts={getDiscounts}
      />
    </div>
  );
};

export default Discount;