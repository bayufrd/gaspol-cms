import React, { useState, useEffect } from "react";
import axios from "axios";
import { DiscountModal } from "./DiscountModal";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Discount = ({ userTokenData }) => {
  const [discounts, setDiscounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <input
                  type="text"
                  className="form-control mb-2 mb-md-0"
                  placeholder="Cari discount (nama, tanggal mulai, persen, dll.)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: '400px', flex: '1 1 auto' }}
                />
                <div
                  className="button btn btn-primary rounded-pill btn-sm ms-2"
                  onClick={() => openModal(null)}
                >
                  <i className="bi bi-plus"></i> Tambah Data
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={styles.discountFlow}>
                {discounts
                  .filter((discount) =>
                    discount.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    discount.start_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    discount.end_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    discount.value?.toString().includes(searchTerm) ||
                    discount.updated_at?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (discount.is_percent === 1 ? 'persen' : 'nominal').includes(searchTerm.toLowerCase()) ||
                    (discount.is_discount_cart === 1 ? 'keranjang' : 'peritem').includes(searchTerm.toLowerCase())
                  )
                  .map((discount, index) => (
                  <div style={styles.discountCard} key={discount.id}>
                    <h5 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{discount.code || '-'}</span>
                      <span style={{ fontSize: '0.8em', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bi bi-cart"></i> {discount.is_discount_cart === 1 ? "Keranjang" : "Peritem"}
                      </span>
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bi bi-percent" title="Tipe Diskon"></i>
                        <span>{discount.is_percent === 1 ? "Persen" : "Nominal"}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bi bi-tag" title="Nilai Discount"></i>
                        <span>{discount.is_percent === 1 ? `${discount.value || '-'}%` : `Rp. ${formatNumber(discount.value)}`}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bi bi-cash" title="Minimal - Maksimal Diskon"></i>
                        <span>Rp. {formatNumber(discount.min_purchase || 0)} - {discount.max_discount && discount.max_discount !== 0 ? `Rp. ${formatNumber(discount.max_discount)}` : 'Tanpa Batasan'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bi bi-calendar" title="Tanggal Mulai - Akhir"></i>
                        <span>{discount.start_date || '-'} - {discount.end_date || '-'}</span>
                      </div>
                    </div>
                    <div style={{ ...styles.actionButtons, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666', fontSize: '0.8em' }}>Terakhir diupdate: {discount.updated_at || '-'}</span>
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