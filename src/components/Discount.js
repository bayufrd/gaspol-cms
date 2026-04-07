import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import { DiscountModal } from "./DiscountModal";
import "../styles/discount-module.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Discount = ({ userTokenData }) => {
  const { isDark } = useTheme();
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getDiscounts();
  }, []);

  useEffect(() => {
    const results = discounts.filter((discount) =>
      discount.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.start_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.end_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.value?.toString().includes(searchTerm) ||
      discount.updated_at?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (discount.is_percent === 1 ? 'persen' : 'nominal').includes(searchTerm.toLowerCase()) ||
      (discount.is_discount_cart === 1 ? 'keranjang' : 'peritem').includes(searchTerm.toLowerCase())
    );
    setFilteredDiscounts(results);
  }, [searchTerm, discounts]);

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

  const renderDiscountCards = () => (
    <div className="discount-cards-container">
      {filteredDiscounts.map((discount) => (
        <div
          key={discount.id}
          className="discount-card"
          onClick={() => openModal(discount.id)}
        >
          <div className="discount-card-header">
            <h6 className="discount-code">{discount.code || '-'}</h6>
            <span className={`discount-type-badge ${discount.is_discount_cart === 1 ? 'type-cart' : 'type-item'}`}>
              <i className="bi bi-cart me-1"></i>
              {discount.is_discount_cart === 1 ? "Keranjang" : "Per Item"}
            </span>
          </div>

          <div className="discount-card-body">
            <div className="discount-info-row">
              <div className="discount-info-item">
                <span className="discount-label">Tipe</span>
                <span className="discount-value">
                  <i className="bi bi-percent"></i>
                  {discount.is_percent === 1 ? "Persen" : "Nominal"}
                </span>
              </div>
              <div className="discount-info-item">
                <span className="discount-label">Nilai</span>
                <span className="discount-value discount-value-highlight">
                  {discount.is_percent === 1 ? `${discount.value || '-'}%` : `Rp. ${formatNumber(discount.value)}`}
                </span>
              </div>
            </div>

            <div className="discount-info-row">
              <div className="discount-info-item">
                <span className="discount-label">Min Pembelian</span>
                <span className="discount-value">
                  <i className="bi bi-cash"></i>
                  Rp. {formatNumber(discount.min_purchase || 0)}
                </span>
              </div>
              <div className="discount-info-item">
                <span className="discount-label">Max Diskon</span>
                <span className="discount-value">
                  {discount.max_discount && discount.max_discount !== 0 ? `Rp. ${formatNumber(discount.max_discount)}` : 'Tanpa Batasan'}
                </span>
              </div>
            </div>

            <div className="discount-info-row">
              <div className="discount-info-item full-width">
                <span className="discount-label">Periode</span>
                <span className="discount-value">
                  <i className="bi bi-calendar"></i>
                  {discount.start_date || '-'} → {discount.end_date || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="discount-card-footer">
            <span className="discount-updated">Diupdate: {discount.updated_at || '-'}</span>
          </div>
        </div>
      ))}
    </div>
  );

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
              <div className="discount-header-controls">
                <div className="discount-search-wrapper">
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari discount (kode, tanggal, nilai, dll.)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => openModal(null)}
                >
                  <i className="bi bi-plus"></i> Tambah Data
                </button>
              </div>
            </div>
            <div className="card-body">
              {filteredDiscounts.length > 0 ? (
                renderDiscountCards()
              ) : (
                <div className="discount-empty-state">
                  <p>Tidak ada discount yang ditemukan</p>
                </div>
              )}
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