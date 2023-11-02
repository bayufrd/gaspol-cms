import React, { useState, useEffect, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const ServingTypeModal = ({
  show,
  onClose,
  onSave,
  selectedServingTypeId,
  getServingTypes,
  userTokenData,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialServingTypeState = useMemo(
    () => ({
      name: "",
      is_active: 1,
      outlet_id: userTokenData.outlet_id,
    }),
    [userTokenData]
  );

  const [servingType, setServingType] = useState(initialServingTypeState);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (show && selectedServingTypeId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/serving-type/${selectedServingTypeId}`
          );
          const servingTypeData = response.data.data;
          setServingType({
            ...servingTypeData,
          });
        } catch (error) {
          console.error("Error fetching servingType:", error);
        }
      };
      fetchData();
    } else {
      setServingType(initialServingTypeState);
      setIsFormValid(true);
    }
  }, [show, selectedServingTypeId, apiBaseUrl, initialServingTypeState, userTokenData]);

  const handleInputChange = (field, value) => {
    setServingType((prevServingType) => ({
      ...prevServingType,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isServingTypeNameValid = servingType.name === "";

    if (
        isServingTypeNameValid
    ) {
      setIsFormValid(false);
      return;
    }

    try {
      if (selectedServingTypeId) {
        await axios.patch(
          `${apiBaseUrl}/serving-type/${selectedServingTypeId}`,
          servingType
        );
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Serving Type berhasil diperbarui: ${servingType.name}`,
        });
      } else {
        await axios.post(`${apiBaseUrl}/serving-type/`, servingType);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${servingType.name} berhasil ditambahkan!`,
        });
      }
      onSave(servingType);
      setServingType(initialServingTypeState);
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: "Terdapat data yang tidak valid",
        icon: "error",
      });
    }
  };

  const handleDeleteServingType = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/serving-type/${selectedServingTypeId}`);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${servingType.name} berhasil dihapus!`,
      });
      setShowDeleteConfirmation(false);
      await getServingTypes();
      onClose();
    } catch (error) {
      console.error("Error deleting serving type:", error);
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
          <div class="modal-content scrollable-content">
            <div class="modal-header">
              <h4 class="modal-title" id="myModalLabel33">
                {selectedServingTypeId ? "Edit Serving Type" : "Add Serving Type"}
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
                    placeholder="Nama"
                    class={`form-control ${isFormValid ? "" : "is-invalid"}`}
                    value={servingType.name}
                    onChange={(e) => {
                      handleInputChange("name", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                  {!isFormValid && (
                    <div className="invalid-feedback">
                      Nama harus diisi
                    </div>
                  )}
                </div>
                <label>Status Aktif: </label>
                <div class="form-group">
                  <select
                    class="choices form-select"
                    value={servingType.is_active}
                    onChange={(e) => {
                      handleInputChange("is_active", e.target.value);
                    }}
                  >
                    <option value="1">Ya</option>
                    <option value="0">Tidak</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
              {selectedServingTypeId && (
                <div className="delete-modal">
                  <button
                    type="button"
                    class="btn btn-danger rounded-pill"
                    data-bs-dismiss="modal"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <span class="d-none d-sm-block">Hapus Serving Type!</span>
                  </button>
                </div>
              )}
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
        onConfirmDelete={handleDeleteServingType}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"serving type"}
      />
    </>
  );
};
