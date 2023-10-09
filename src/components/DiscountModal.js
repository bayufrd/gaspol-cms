import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const DiscountModal = ({
  show,
  onClose,
  onSave,
  selectedDiscountId,
  getDiscounts,
  userTokenData,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialDiscountState = useMemo(() => ({
    code: "",
    is_percent: "",
    is_discount_cart: "",
    value: "",
    start_date: "",
    end_date: "",
    min_purchase: "",
    max_discount: "",
    outlet_id: userTokenData.outlet_id,
  }), [userTokenData]);

  const [discount, setDiscount] = useState(initialDiscountState);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  useEffect(() => {
    if (show && selectedDiscountId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/discount/${selectedDiscountId}`
          );
          const discountData = response.data.data;
          setDiscount(discountData);
        } catch (error) {
          console.error("Error fetching discount:", error);
        }
      };
      fetchData();
    } else {
      setDiscount(initialDiscountState);
    }
  }, [show, selectedDiscountId, apiBaseUrl, initialDiscountState]);

  const handleInputChange = (field, value) => {
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isDiscountCodeValid = discount.code.trim() !== "";
    
    if (!isDiscountCodeValid) {
      setIsFormValid(false);
      return;
    }

    try {
      if (selectedDiscountId) {
        await axios.patch(
          `${apiBaseUrl}/discount/${selectedDiscountId}`,
          discount
        );
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Diskon berhasil diperbarui: ${discount.code}`,
        });
      } else {
        await axios.post(`${apiBaseUrl}/discount/`, discount);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${discount.code} berhasil ditambahkan!`,
        });
      }
      onSave(discount);
      setDiscount(initialDiscountState);
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: "Terdapat data yang tidak valid",
        icon: "error",
      });
    }
  };

    const handleDeleteDiscount = async () => {
      try {
        await axios.delete(
          `${apiBaseUrl}/discount/${selectedDiscountId}`
        );
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Diskon berhasil diperbarui: ${discount.code}`,
        });
        setShowDeleteConfirmation(false);
        await getDiscounts();
        onClose();
      } catch (error) {
        console.error("Error deleting discount:", error);
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
                {selectedDiscountId ? "Edit Discount" : "Add Discount"}
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
              {/* <div class="modal-body scrollable-content">
                <label>Nama: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="nama user"
                    class={`form-control ${isFormValid ? "" : "is-invalid"}`}
                    value={user.name}
                    onChange={(e) => {
                      handleInputChange("name", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                  {!isFormValid && (
                    <div className="invalid-feedback">
                      Nama user harus diisi
                    </div>
                  )}
                </div>
                <label>Username: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="username"
                    class={`form-control ${isFormValid ? "" : "is-invalid"}`}
                    value={user.username}
                    onChange={(e) => {
                      handleInputChange("username", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                  {!isFormValid && (
                    <div className="invalid-feedback">Username harus diisi</div>
                  )}
                </div>
                {!selectedDiscountId && (
                  <>
                    <label>Password: </label>
                    <div class="form-group">
                      <input
                        type="password"
                        placeholder="password"
                        class={`form-control ${
                          isFormValid ? "" : "is-invalid"
                        }`}
                        value={user.password}
                        onChange={(e) => {
                          handleInputChange("password", e.target.value);
                          setIsFormValid(true);
                        }}
                      />
                      {!isFormValid && (
                        <div className="invalid-feedback">
                          Password harus diisi dan minimal 5 karakter!
                        </div>
                      )}
                    </div>
                  </>
                )}
                <label>Outlet:</label>
                <div className="form-group">
                  <select
                    className="form-select"
                    value={user.outlet_id}
                    onChange={(e) =>
                      handleInputChange("outlet_id", e.target.value)
                    }
                  >
                    {outlets &&
                      outlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div> */}
              {selectedDiscountId && (
                  <div className="modal-footer delete-menu">
                    <button
                      type="button"
                      class="btn btn-danger rounded-pill"
                      data-bs-dismiss="modal"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      <span class="d-none d-sm-block">Hapus Discount !</span>
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
        onConfirmDelete={handleDeleteDiscount}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"discount"}                      
      />
    </>
  );
};
