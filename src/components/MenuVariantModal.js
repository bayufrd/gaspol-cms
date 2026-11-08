import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from "../utils/alerts";

export const MenuVariantModal = ({
  show,
  onClose,
  onRefresh,
  menuId,
  variantId = null, // menu_detail_id
  variantName = '',
  outletId
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const [formData, setFormData] = useState({
    varian: '',
    customMenuPrices: [],
    allPrices: [],  // Keep all prices for complete update
    activeServingTypeIds: new Set()  // Track active serving type IDs
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && menuId) {
      fetchCustomPrices();
    }
  }, [show, menuId, variantId]);

  const fetchCustomPrices = async () => {
    setLoading(true);
    try {
      // Load using current outlet - backend will return correct serving types and fallback prices from outlet 1
      const response = await axios.get(`${apiBaseUrl}/custom-menu-price/${menuId}`, {
        params: { outlet_id: outletId }
      });

      const allPrices = response.data.data.custom_menu_prices || [];
      
      // Filter hanya serving type untuk outlet aktif (fallback ke allPrices jika belum ada tag outlet_id)
      const sameOutletPrices = allPrices.filter(p => Number(p.outlet_id) === Number(outletId));
      const activePrices = sameOutletPrices.length > 0 ? sameOutletPrices : allPrices;
      
      // Filter prices for display based on variantId:
      // - variantId === 0: menu utama (menu_detail_id = 0)
      // - variantId > 0: varian tertentu (menu_detail_id = variantId)
      // - variantId === null: tambah varian baru (menu_detail_id = 0 as template)
      const targetDetailId = variantId !== null ? Number(variantId) : 0;
      const variantPrices = activePrices.filter(
        p => Number(p.menu_detail_id) === targetDetailId
      );
      
      // Dapatkan info serving types dari response
      const servingTypes = response.data.data.custom_prices || [];
      const activeServingTypes = servingTypes.filter(st => Number(st.is_active) === 1);

      setFormData({
        varian: variantName || '',
        customMenuPrices: variantPrices.filter(p =>
          activeServingTypes.some(st => Number(st.id) === Number(p.serving_type_id))
        ),
        allPrices: activePrices,  // Keep ALL active prices for save
        activeServingTypeIds: new Set(activeServingTypes.map(st => st.id))
      });
    } catch (error) {
      console.error('Error loading custom prices:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memuat data harga'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceChange = (servingTypeId, menuDetailId, value) => {
    setFormData(prev => ({
      ...prev,
      customMenuPrices: prev.customMenuPrices.map(p =>
        p.serving_type_id === servingTypeId && p.menu_detail_id === menuDetailId
          ? { ...p, price: parseInt(value) || 0 }
          : p
      )
    }));
  };

  const handleSave = async () => {
    // Validate variant name for both new and existing variants (except menu_detail_id = 0)
    if (variantId !== 0 && !formData.varian.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Nama varian harus diisi'
      });
      return;
    }

    setLoading(true);
    try {
      // Jika tambah varian baru (variantId === null), jangan timpa menu_detail_id = 0 di server;
      // kembalikan daftar harga varian baru ke MenuModal agar disimpan saat membuat varian baru.
      if (variantId === null) {
        onClose({
          varian: formData.varian.trim(),
          prices: formData.customMenuPrices
        });
        return;
      }

      // If editing existing variant (variantId > 0) and name changed, update variant name first
      if (variantId > 0 && formData.varian.trim() && formData.varian !== variantName) {
        await axios.patch(`${apiBaseUrl}/menu-detail/${variantId}/variant`, {
          varian: formData.varian.trim()
        });
      }

      // Kirim harga yang diedit khusus untuk variantId ini (menu utama = 0 atau varian > 0)
      const custom_prices = formData.customMenuPrices
        .filter(p => formData.activeServingTypeIds.has(p.serving_type_id))
        .map(p => ({
          menu_detail_id: Number(variantId),
          serving_type_id: p.serving_type_id,
          price: Number(p.price || 0)
        }));

      await axios.patch(`${apiBaseUrl}/v2/custom-menu-price/${menuId}`, {
        custom_prices,
        outlet_id: Number(outletId)
      });

      onClose();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: variantId > 0 ? 'Varian berhasil diupdate' : 'Harga berhasil diupdate'
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menyimpan data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      varian: '',
      customMenuPrices: [],
      allPrices: [],
      activeServingTypeIds: new Set()
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1060
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {variantId === 0
                ? 'Edit Harga Menu Utama'
                : variantId > 0
                ? `Edit Harga Varian: ${variantName}`
                : 'Tambah Varian Menu'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Nama Varian - for new variant and existing variant (not menu_detail_id = 0) */}
                {variantId !== 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nama Varian</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Regular, Large, Extra"
                      value={formData.varian}
                      onChange={(e) => handleInputChange('varian', e.target.value)}
                    />
                  </div>
                )}

                {/* Harga Per Serving Type */}
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Harga Per Tipe Penyajian</h6>
                  {formData.customMenuPrices.length > 0 ? (
                    <div className="list-group">
                      {formData.customMenuPrices.map((priceItem) => (
                        <div key={`${priceItem.menu_detail_id}-${priceItem.serving_type_id}`} className="list-group-item">
                          <div className="d-flex align-items-center gap-2">
                            <label className="fw-bold mb-0" style={{ minWidth: '150px' }}>
                              {priceItem.name}
                            </label>
                            <div className="flex-grow-1">
                              <input
                                type="number"
                                className="form-control"
                                placeholder="0"
                                value={priceItem.price}
                                onChange={(e) => handlePriceChange(priceItem.serving_type_id, priceItem.menu_detail_id, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      Belum ada data harga untuk varian ini
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
