import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

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
            <div class="modal-header">
              <h4 class="modal-title" id="myModalLabel33">
                {selectedOutletId ? "Edit Outlet" : "Add Outlet"}
              </h4>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={onClose}
              >
                <i data-feather="x"></i>x
              </button>
            </div>
            <div>
              <div class="modal-body scrollable-content">
                <label>Nama: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="nama outlet"
                    class={`form-control ${
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
                      Nama outlet harus diisi
                    </div>
                  ) : null}
                </div>
                <label>Alamat: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="address"
                    class={`form-control ${
                      !isFormValid && outlet.address === "" ? "is-invalid" : ""
                    }`}
                    value={outlet.address}
                    onChange={(e) => {
                      handleInputChange("address", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                  {!isFormValid && outlet.address === "" ? (
                    <div className="invalid-feedback">Alamat harus diisi</div>
                  ) : null}
                </div>
                <label>Pin: </label>
                <div class="form-group">
                  <input
                    type="number"
                    placeholder="pin"
                    class={`form-control ${
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
                      Pin harus diisi dan minimal 5 karakter!
                    </div>
                  ) : null}
                </div>
              </div>
              {selectedOutletId && (
                <div className="modal-footer delete-menu">
                  <button
                    type="button"
                    class="btn btn-danger rounded-pill"
                    data-bs-dismiss="modal"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <span class="d-none d-sm-block">Hapus Outlet !</span>
                  </button>
                </div>
              )}
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-light-secondary"
                  data-bs-dismiss="modal"
                  onClick={onClose}
                >
                  <i class="bx bx-x d-block d-sm-none"></i>
                  <span class="d-none d-sm-block">Close</span>
                </button>
                <button
                  type="button"
                  class="btn btn-primary ml-1"
                  data-bs-dismiss="modal"
                  onClick={handleSave}
                >
                  <i class="bx bx-check d-block d-sm-none"></i>
                  <span class="d-none d-sm-block">Submit</span>
                </button>
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
