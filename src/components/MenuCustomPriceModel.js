import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

export const CustomPriceModal = ({
  showCustomPriceModal,
  onCloseCustomPrice,
  selectedMenuId,
  menuName,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [customPrice, setCustomPrice] = useState(null);
  const [customMenuPrice, setCustomMenuPrice] = useState(null);
  useEffect(() => {
    if (showCustomPriceModal && selectedMenuId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/custom-menu-price/${selectedMenuId}`
          );
          const customPriceData = response.data.data.custom_prices;
          const customMenuPriceData = response.data.data.custom_menu_prices;
          setCustomPrice(customPriceData);
          setCustomMenuPrice(customMenuPriceData);
        } catch (error) {
          console.error("Error fetching custom price:", error);
        }
      };
      fetchData();
    } else {
      setCustomPrice();
    }
  }, [showCustomPriceModal, selectedMenuId, apiBaseUrl]);

  const handleInputChange = (field, value) => {
    setCustomPrice((prevCustomPrice) => ({
      ...prevCustomPrice,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (selectedMenuId) {
        // await axios.patch(
        //   `${apiBaseUrl}/custom-menu-price/${selectedMenuId}`,
        //   result
        // );
        // Swal.fire({
        //   icon: "success",
        //   title: "Success!",
        //   text: "Custom price berhasil diupdate!",
        // });
      }
      onCloseCustomPrice();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };

  return (
    <>
      <div
        className={`modal fade text-left ${showCustomPriceModal ? "show" : ""}`}
        id="inlineForm"
        role="dialog"
        aria-labelledby="myModalLabel33"
        aria-modal={showCustomPriceModal ? "true" : undefined}
        aria-hidden={showCustomPriceModal ? undefined : "true"}
        style={showCustomPriceModal ? { display: "block" } : { display: "none" }}
      >
        <div
          class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title" id="myModalLabel33">
                {"Custom harga menu - " + menuName }
              </h4>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={onCloseCustomPrice}
              >
                <i data-feather="x"></i>x
              </button>
            </div>
              <div class="modal-body scrollable-content">
                <label>Nama: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="nama user"
                    class="form-control"
                  />
                </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-light-secondary"
                  data-bs-dismiss="modal"
                  onClick={onCloseCustomPrice}
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
      <div className={showCustomPriceModal && `modal-backdrop fade show`}></div>
    </>
  );
};
