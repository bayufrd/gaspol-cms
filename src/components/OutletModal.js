import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import "../styles/outlet-modal.css";

export const OutletModal = ({
  show,
  onClose,
  onSave,
  selectedOutletId,
  getOutlets,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialOutletState = useMemo(
    () => ({
      name: "",
      address: "",
      pin: "",
      footer: "",
      is_kitchen_bar_merged: 1, 
      phone_number: "",
    }),
    []
  );

  const [outlet, setOutlet] = useState(initialOutletState);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (show && selectedOutletId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/outlet/${selectedOutletId}`
          );
          const outletData = response.data.data;
          setOutlet(outletData);
        } catch (error) {
          console.error("Error fetching outlet:", error);
        }
      };
      fetchData();
    } else {
      setOutlet(initialOutletState);
      setIsFormValid(true);
    }
  }, [show, selectedOutletId, apiBaseUrl, initialOutletState]);

  const handleInputChange = (field, value) => {
    setOutlet((prevOutlet) => ({
      ...prevOutlet,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isOutletNameValid = outlet.name.trim() !== "";
    const isOutletAddressValid = outlet.address.trim() !== "";
    const isOutletPinValid = outlet.pin.toString().length === 5;

    if (!isOutletNameValid || !isOutletAddressValid || !isOutletPinValid) {
      setIsFormValid(false);
      return;
    }

    try {
      if (selectedOutletId) {
        await axios.patch(`${apiBaseUrl}/outlet/${selectedOutletId}`, outlet);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Outlet berhasil diupdate: ${outlet.name}`,
        });
      } else {
        const isOutletPinValid =
          outlet.pin.trim() !== "" && outlet.pin.length >= 5;
        if (!isOutletPinValid) {
          setIsFormValid(false);
          return;
        }
        await axios.post(`${apiBaseUrl}/outlet/`, outlet);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${outlet.name} berhasil ditambahkan!`,
        });
      }
      onSave(outlet);
      setOutlet(initialOutletState);
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };

  const handleDeleteOutlet = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/outlet/${selectedOutletId}`);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Outlet berhasil dihapus: ${outlet.name}`,
      });
      setShowDeleteConfirmation(false);
      await getOutlets();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response.data.message,
      });
      console.error("Error deleting outlet:", error);
    }
  };

  return (
    <>
      <div
        className={`modal fade text-left ${show ? "show" : ""}`}
        id="inlineForm"
        role="dialog"
        aria-labelledby="myModalLabel33"
        aria-modal={show ? "true" : undefined}
        aria-hidden={show ? undefined : "true"}
        style={show ? { display: "block" } : { display: "none" }}
      >
        <div
          class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          role="document"
        >
          <div class="modal-content">
            <div className="modal-header outlet-modal-header">
              <h4 className="modal-title outlet-modal-title" id="myModalLabel33">
                <i className={`bi ${selectedOutletId ? "bi-shop" : "bi-plus-circle"}`}></i>
                {selectedOutletId ? "Edit Outlet" : "Tambah Outlet Baru"}
              </h4>
              <button
                type="button"
                className="btn-close outlet-modal-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={onClose}
              >
              </button>
            </div>
            <div>
              <div className="modal-body outlet-modal-body scrollable-content">
                <div className="form-section">
                  <label className="form-label">Nama Outlet</label>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Masukkan nama outlet"
                      className={`form-control outlet-input ${
                        !isFormValid && outlet.name === "" ? "is-invalid" : ""
                      }`}
                      value={outlet.name}
                      onChange={(e) => {
                        handleInputChange("name", e.target.value);
                        setIsFormValid(true);
                      }}
                    />
                    {!isFormValid && outlet.name === "" ? (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle"></i> Nama outlet harus diisi
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Alamat</label>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Masukkan alamat lengkap"
                      className={`form-control outlet-input ${
                        !isFormValid && outlet.address === "" ? "is-invalid" : ""
                      }`}
                      value={outlet.address}
                      onChange={(e) => {
                        handleInputChange("address", e.target.value);
                        setIsFormValid(true);
                      }}
                    />
                    {!isFormValid && outlet.address === "" ? (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle"></i> Alamat harus diisi
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Nomor Telepon</label>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Masukkan nomor telepon"
                      className="form-control outlet-input"
                      value={outlet.phone_number}
                      onChange={(e) => {
                        handleInputChange("phone_number", e.target.value);
                        setIsFormValid(true);
                      }}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">PIN (5 Digit)</label>
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="Masukkan PIN 5 digit"
                      className={`form-control outlet-input ${
                        !isFormValid && outlet.pin.toString().length !== 5
                          ? "is-invalid"
                          : ""
                      }`}
                      value={outlet.pin}
                      onChange={(e) => {
                        handleInputChange("pin", e.target.value);
                        setIsFormValid(true);
                      }}
                    />
                    {!isFormValid && outlet.pin.toString().length !== 5 ? (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle"></i> PIN harus 5 digit
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Kitchen & Bar Gabung</label>
                  <div className="form-group">
                    <select
                      className="form-select outlet-select"
                      value={outlet.is_kitchen_bar_merged}
                      onChange={(e) => {
                        handleInputChange("is_kitchen_bar_merged", e.target.value);
                      }}
                    >
                      <option value="1">Ya</option>
                      <option value="0">Tidak</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Footer (Opsional)</label>
                  <div className="form-group">
                    <textarea
                      placeholder="Masukkan teks footer untuk struk"
                      className="form-control outlet-textarea"
                      value={outlet.footer}
                      onChange={(e) => handleInputChange("footer", e.target.value)}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer outlet-modal-footer">
                {selectedOutletId && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm delete-btn"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <i className="bi bi-trash"></i> Hapus Outlet
                  </button>
                )}
                <div className="footer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    data-bs-dismiss="modal"
                    onClick={onClose}
                  >
                    <i className="bi bi-x-circle"></i> Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSave}
                  >
                    <i className="bi bi-check-circle"></i> {selectedOutletId ? "Simpan Perubahan" : "Tambah Outlet"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={show && `modal-backdrop fade show`}></div>
      <DeleteConfirmationModal
        showDeleteConfirmation={showDeleteConfirmation}
        onConfirmDelete={handleDeleteOutlet}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"outlet"}
      />
    </>
  );
};
