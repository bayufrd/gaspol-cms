import React, { useState, useEffect, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const DiscountModal = ({
  isOpen,  // Ganti nama prop dari show ke isOpen
  onClose,
  onSave,
  discountId,
  userTokenData,
  getDiscounts
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    // Gunakan useMemo untuk initialDiscountState
    const initialDiscountState = useMemo(
      () => ({
        code: "",
        is_percent: 1,
        is_discount_cart: 1,
        value: "",
        start_date: null,
        end_date: null,
        min_purchase: "",
        max_discount: "",
        is_unlimited_max_discount: false,
        outlet_id: userTokenData.outlet_id,
        showMaxDiscount: true // Tambahkan properti ini
      }),
      [userTokenData]
    );
  

  const [discount, setDiscount] = useState(initialDiscountState);
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
    } else {
      // Tambahkan delay untuk animasi
      const timer = setTimeout(() => {
        setIsModalVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handler untuk menutup modal dengan animasi
  const handleClose = () => {
    onClose();
  };

  // Handler overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  useEffect(() => {
    let startDatePicker, endDatePicker;

    if (startDateInputRef.current) {
      startDatePicker = flatpickr(startDateInputRef.current, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: discount.start_date ? new Date(discount.start_date) : null,
        onChange: (selectedDates, dateStr) => {
          handleInputChange("start_date", dateStr);
        },
      });
    }

    if (endDateInputRef.current) {
      endDatePicker = flatpickr(endDateInputRef.current, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: discount.end_date ? new Date(discount.end_date) : null,
        onChange: (selectedDates, dateStr) => {
          handleInputChange("end_date", dateStr);
        },
      });
    }

    return () => {
      if (startDatePicker) startDatePicker.destroy();
      if (endDatePicker) endDatePicker.destroy();
    };
  }, [discount]);

  const validateForm = () => {
    const errors = {};

    if (!discount.code) errors.code = "Kode diskon harus diisi";
    if (!discount.start_date) errors.start_date = "Tanggal mulai harus diisi";
    if (!discount.end_date) errors.end_date = "Tanggal akhir harus diisi";
    if (!discount.value) errors.value = "Nilai diskon harus diisi";

    if (discount.is_percent === "1" && Number(discount.value) > 100) {
      errors.value = "Diskon persentase tidak boleh lebih dari 100%";
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (isOpen && discountId) {
      const fetchDiscountDetails = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/discount/${discountId}`
          );
          const discountData = response.data.data;

          setDiscount(prevDiscount => ({
            ...discountData,
            outlet_id: userTokenData.outlet_id,
            is_percent: String(discountData.is_percent),
            // Tambahkan state untuk selalu menampilkan max discount
            showMaxDiscount: discountData.is_percent === 1
          }));
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Tidak dapat mengambil detail diskon"
          });
        }
      };
      fetchDiscountDetails();
    } else {
      setDiscount(prevDiscount => ({
        ...initialDiscountState,
        // Tambahkan state untuk selalu menampilkan max discount
        showMaxDiscount: true
      }));
      setFormErrors({});
    }
  }, [isOpen, discountId, apiBaseUrl, initialDiscountState, userTokenData]);

  const handleInputChange = (field, value) => {
    setDiscount(prev => {
      let updatedDiscount = {
        ...prev,
        [field]: value
      };

      // Logika khusus untuk perubahan tipe diskon
      if (field === 'is_percent') {
        if (value === "0") {
          // Jika nominal, sembunyikan max diskon
          updatedDiscount.max_discount = "";
          updatedDiscount.is_unlimited_max_discount = false;
          updatedDiscount.showMaxDiscount = false;
        } else {
          // Jika persentase, pastikan max diskon muncul
          updatedDiscount.showMaxDiscount = true;
          updatedDiscount.is_unlimited_max_discount = false;
        }
      }

      // Logika untuk checkbox tidak ada batasan
      if (field === 'is_unlimited_max_discount') {
        if (value === true) {
          updatedDiscount.max_discount = "";
        } else {
          // Buka kembali input max diskon
          updatedDiscount.max_discount = "";
        }
      }

      return updatedDiscount;
    });

    // Hapus error untuk field yang diubah
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const finalDiscount = {
      ...discount,
      max_discount: discount.is_percent === "1" && !discount.is_unlimited_max_discount
        ? discount.max_discount
        : null
    };

    try {
      const saveMethod = discountId
        ? axios.patch(`${apiBaseUrl}/discount/${discountId}`, finalDiscount)
        : axios.post(`${apiBaseUrl}/discount/`, finalDiscount);

      await saveMethod;

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: discountId
          ? `Diskon ${discount.code} diperbarui`
          : `Diskon ${discount.code} ditambahkan`
      });

      onSave(finalDiscount);
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terdapat data yang tidak valid"
      });
    }
  };

  const handleDeleteDiscount = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/discount/${discountId}`);

      Swal.fire({
        icon: "success",
        title: "Dihapus!",
        text: `Diskon ${discount.code} berhasil dihapus`
      });

      await getDiscounts();
      onClose();
      setShowDeleteConfirmation(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak dapat menghapus diskon"
      });
    }
  };

  return isModalVisible ? (
    <div 
      className={`discount-modal modal ${isOpen ? 'is-active' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{discountId ? "Edit Diskon" : "Tambah Diskon"}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Kode Diskon</label>
              <input
                type="text"
                value={discount.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className={`form-control ${formErrors.code ? 'is-invalid' : ''}`}
                placeholder="Masukkan kode diskon"
              />
              {formErrors.code && <div className="error-text">{formErrors.code}</div>}
            </div>

            <div className="form-group">
              <label>Tanggal Mulai</label>
              <input
                ref={startDateInputRef}
                type="text"
                className={`form-control ${formErrors.start_date ? 'is-invalid' : ''}`}
                placeholder="Pilih tanggal mulai"
              />
              {formErrors.start_date && <div className="error-text">{formErrors.start_date}</div>}
            </div>

            <div className="form-group">
              <label>Tanggal Berakhir</label>
              <input
                ref={endDateInputRef}
                type="text"
                className={`form-control ${formErrors.end_date ? 'is-invalid' : ''}`}
                placeholder="Pilih tanggal berakhir"
              />
              {formErrors.end_date && <div className="error-text">{formErrors.end_date}</div>}
            </div>

            <div className="form-group">
              <label>Tipe Diskon</label>
              <select
                value={discount.is_percent}
                onChange={(e) => handleInputChange('is_percent', e.target.value)}
                className="form-control"
              >
                <option value="1">Persentase</option>
                <option value="0">Nominal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Diskon Untuk</label>
              <select
                value={discount.is_discount_cart}
                onChange={(e) => handleInputChange('is_discount_cart', e.target.value)}
                className="form-control"
              >
                <option value="1">Keranjang</option>
                <option value="0">Per Item</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nilai Diskon</label>
              <input
                type="number"
                value={discount.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                className={`form-control ${formErrors.value ? 'is-invalid' : ''}`}
                placeholder="Masukkan nilai diskon"
              />
              {formErrors.value && <div className="error-text">{formErrors.value}</div>}
            </div>

            <div className="form-group">
              <label>Minimal Pembelian</label>
              <input
                type="number"
                value={discount.min_purchase}
                onChange={(e) => handleInputChange('min_purchase', e.target.value)}
                className={`form-control ${formErrors.min_purchase ? 'is-invalid' : ''}`}
                placeholder="Masukkan minimal pembelian"
              />
              {formErrors.min_purchase && <div className="error-text">{formErrors.min_purchase}</div>}
            </div>

            {(discount.is_percent === "1" || discount.showMaxDiscount) && (
              <div className="form-group">
                <label>Maksimal Diskon</label>
                <div className="max-discount-container">
                  <div className="unlimited-checkbox">
                    <input
                      type="checkbox"
                      id="unlimitedMaxDiscount"
                      checked={discount.is_unlimited_max_discount || false}
                      onChange={(e) => handleInputChange('is_unlimited_max_discount', e.target.checked)}
                    />
                    <label htmlFor="unlimitedMaxDiscount">Tidak ada batasan</label>
                  </div>

                  {!discount.is_unlimited_max_discount && (
                    <input
                      type="number"
                      value={discount.max_discount || ''}
                      onChange={(e) => handleInputChange('max_discount', e.target.value)}
                      className={`form-control ${formErrors.max_discount ? 'is-invalid' : ''}`}
                      placeholder="Masukkan maksimal diskon"
                      required
                    />
                  )}
                </div>
                {formErrors.max_discount && (
                  <div className="error-text">{formErrors.max_discount}</div>
                )}
              </div>
            )}
          </div>

          <div className="modal-actions">
            {discountId && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                className="btn btn-danger"
              >
                Hapus
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>

      <DeleteConfirmationModal
        showDeleteConfirmation={showDeleteConfirmation}
        onConfirmDelete={handleDeleteDiscount}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog="discount"
      />
    </div>
  ) : null;
};