import React, { useState, useEffect, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
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
      outlet_id: userTokenData.outlet_id,
    }),
    [userTokenData]
  );

  const [discount, setDiscount] = useState(initialDiscountState);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const [startDate, setStartDate] = useState(discount.start_date || null);
  const [endDate, setEndDate] = useState(discount.end_date || null);
  const [isDiscountValueValid, setIsDiscountValueValid] = useState(true);

  useEffect(() => {
    if (show && selectedDiscountId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/discount/${selectedDiscountId}`
          );
          const discountData = response.data.data;
          setDiscount({
            ...discountData,
            outlet_id: userTokenData.outlet_id,
          });
          setStartDate(discountData.start_date);
          setEndDate(discountData.end_date);
        } catch (error) {
          console.error("Error fetching discount:", error);
        }
      };
      fetchData();
    } else {
      setDiscount(initialDiscountState);
      setIsFormValid(true);
      setStartDate(null);
      setEndDate(null);
    }
  }, [
    show,
    selectedDiscountId,
    apiBaseUrl,
    initialDiscountState,
    userTokenData,
  ]);

  useEffect(() => {
    let startDatePicker, endDatePicker;
    if (startDateInputRef.current) {
      startDatePicker = flatpickr(startDateInputRef.current, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: discount.start_date ? new Date(discount.start_date) : null,
        onChange: (selectedDates, dateStr) => {
          setStartDate(dateStr);
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
          setEndDate(dateStr);
          handleInputChange("end_date", dateStr);
        },
      });
    }

    return () => {
      if (startDatePicker) {
        startDatePicker.destroy();
      }
      if (endDatePicker) {
        endDatePicker.destroy();
      }
    };
  }, [discount]);

  const handleInputChange = (field, value) => {
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isDiscountCodeValid = discount.code === "";
    const isDiscountValueValidForm = discount.value === "";
    if (
      isDiscountCodeValid ||
      isDiscountValueValidForm ||
      startDate == null ||
      endDate == null
    ) {
      console.log(isDiscountCodeValid ," " + " ", isDiscountValueValidForm, " " + " ", isDiscountValueValid);
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
      await axios.delete(`${apiBaseUrl}/discount/${selectedDiscountId}`);
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
          <div class="modal-content scrollable-content">
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
              <div class="modal-body scrollable-content">
                <label>Code: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="Code diskon"
                    class={`form-control ${
                      !isFormValid && discount.code === "" ? "is-invalid" : ""
                    }`}
                    value={discount.code}
                    onChange={(e) => {
                      handleInputChange("code", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                  {!isFormValid && discount.code === "" ? (
                    <div className="invalid-feedback">
                      Code diskon harus diisi
                    </div>
                  ) : null}
                </div>
                <label>Tanggal mulai diskon: </label>
                <div className="form-group">
                  <input
                    type="text"
                    id="startDateInput"
                    ref={startDateInputRef}
                    className={`form-control ${
                      !isFormValid && !discount.start_date ? "is-invalid" : ""
                    }`}
                    placeholder="Tanggal mulai diskon"
                    value={startDate || ""}
                  />
                  {!isFormValid && !discount.start_date && (
                    <div className="invalid-feedback">
                      Tanggal mulai diskon harus diisi
                    </div>
                  )}
                </div>
                <label>Tanggal akhir diskon: </label>
                <div className="form-group">
                  <input
                    type="text"
                    id="startDateInput"
                    ref={endDateInputRef}
                    className={`form-control ${
                      !isFormValid && !discount.end_date ? "is-invalid" : ""
                    }`}
                    placeholder="Tanggal akhir diskon"
                    value={endDate || ""}
                  />
                  {!isFormValid && !discount.end_date && (
                    <div className="invalid-feedback">
                      Tanggal akhir diskon harus diisi
                    </div>
                  )}
                </div>
                <label>Diskon Persen: </label>
                <div class="form-group">
                  <select
                    class="choices form-select"
                    value={discount.is_percent}
                    onChange={(e) => {
                      handleInputChange("is_percent", e.target.value);
                    }}
                  >
                    <option value="1">Ya</option>
                    <option value="0">Tidak</option>
                  </select>
                </div>
                <label>Diskon untuk keranjang: </label>
                <div class="form-group">
                  <select
                    class="choices form-select"
                    value={discount.is_discount_cart}
                    onChange={(e) => {
                      handleInputChange("is_discount_cart", e.target.value);
                    }}
                  >
                    <option value="1">Ya</option>
                    <option value="0">Tidak</option>
                  </select>
                </div>
                <label>Nilai discount: </label>
                <div class="form-group">
                  <input
                    type="number"
                    placeholder="Nilai discount"
                    class={`form-control ${
                      (!isFormValid && discount.value === "") ||
                      !isDiscountValueValid
                        ? "is-invalid"
                        : ""
                    }`}
                    value={discount.value}
                    onChange={(e) => {
                      handleInputChange("value", e.target.value);
                      setIsFormValid(true);
                      setIsDiscountValueValid(true);
                      if (
                        discount.is_percent === "1" &&
                        e.target.value > 100
                      ) {
                        setIsDiscountValueValid(false);
                      }
                    }}
                  />
                  {!isFormValid && discount.value === "" ? (
                    <div className="invalid-feedback">
                      Nilai diskon harus diisi
                    </div>
                  ) : null}
                  {!isFormValid && !isDiscountValueValid ? (
                    <div className="invalid-feedback">
                      Nilai diskon tidak boleh lebih dari 100
                    </div>
                  ) : null}
                </div>
                <label>Minimal pembelian: </label>
                <div class="form-group">
                  <input
                    type="number"
                    placeholder="Minimal pembelian"
                    class="form-control"
                    value={discount.min_purchase}
                    onChange={(e) => {
                      handleInputChange("min_purchase", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                </div>
                <label>Maksimal diskon: </label>
                <div class="form-group">
                  <input
                    type="number"
                    placeholder="Maksimal diskon"
                    class="form-control"
                    value={discount.max_discount}
                    onChange={(e) => {
                      handleInputChange("max_discount", e.target.value);
                      setIsFormValid(true);
                    }}
                    disabled={discount.is_percent === "0"}
                  />
                </div>
              </div>
              <div class="modal-footer">
                {selectedDiscountId && (
                  <div className="delete-modal">
                    <button
                      type="button"
                      class="btn btn-danger rounded-pill"
                      data-bs-dismiss="modal"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      <span class="d-none d-sm-block">Hapus Dikson!</span>
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
        onConfirmDelete={handleDeleteDiscount}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"discount"}
      />
    </>
  );
};
