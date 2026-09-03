import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

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
      
      // Filter hanya serving type yang is_active = 1
      const activePrices = allPrices.filter(p => Number(p.outlet_id) === Number(outletId) || p.outlet_id === 1);
      
      // Filter prices for display based on variantId:
      // - variantId === 0: menu utama (menu_detail_id = 0)
      // - variantId > 0: varian tertentu (menu_detail_id = variantId)
      // - variantId === null: tambah varian baru (menu_detail_id = 0 as template)
      const variantPrices = variantId !== null
        ? activePrices.filter(p => p.menu_detail_id === variantId)
        : activePrices.filter(p => p.menu_detail_id === 0);
      
      // Dapatkan info serving types dari response
      const servingTypes = response.data.data.custom_prices || [];
      const activeServingTypes = servingTypes.filter(st => Number(st.is_active) === 1);

      setFormData({
        varian: variantName || '',
        customMenuPrices: variantPrices.filter(p =>
          activeServingTypes.some(st => st.id === p.serving_type_id)
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

  const handlePriceChange = (priceId, value) => {
    setFormData(prev => ({
      ...prev,
      customMenuPrices: prev.customMenuPrices.map(p =>
        p.id === priceId
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
      // If editing existing variant (variantId > 0) and name changed, update variant name first
      if (variantId > 0 && formData.varian.trim() && formData.varian !== variantName) {
        await axios.patch(`${apiBaseUrl}/menu-detail/${variantId}/variant`, {
          varian: formData.varian.trim()
        });
      }

      // Merge edited prices with all prices to avoid deletion
      const editedPricesMap = new Map();
      formData.customMenuPrices.forEach(p => {
        const key = `${p.menu_detail_id}_${p.serving_type_id}`;
        editedPricesMap.set(key, p.price);
      });

      // Update allPrices with edited values, filter hanya is_active = 1
      const custom_prices = formData.allPrices
        .filter(p => formData.activeServingTypeIds.has(p.serving_type_id))
        .map(p => {
          const key = `${p.menu_detail_id}_${p.serving_type_id}`;
          const editedPrice = editedPricesMap.get(key);
          
          return {
            menu_detail_id: p.menu_detail_id,
            serving_type_id: p.serving_type_id,
            price: editedPrice !== undefined ? editedPrice : p.price  // Use edited or original
          };
        });

      await axios.patch(`${apiBaseUrl}/v2/custom-menu-price/${menuId}`, {
        custom_prices
      });

      // Jika tambah varian baru (variantId === null), pass the varian name back
      if (variantId === null && formData.varian.trim()) {
        onClose({ varian: formData.varian, prices: formData.customMenuPrices });
      } else {
        onClose();
      }

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
                        <div key={priceItem.id} className="list-group-item">
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
                                onChange={(e) => handlePriceChange(priceItem.id, e.target.value)}
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
