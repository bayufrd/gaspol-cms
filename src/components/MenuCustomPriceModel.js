import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

export const CustomPriceModal = ({
  showCustomPriceModal,
  onCloseCustomPrice,
  selectedMenuId,
  menuName,
  userTokenData,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [customPrice, setCustomPrice] = useState([]);
  const [customMenuVariants, setCustomMenuVariants] = useState([]);
  const [updatedCustomMenuPrice, setUpdatedCustomMenuPrice] = useState([]);

  useEffect(() => {
    if (showCustomPriceModal && selectedMenuId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/custom-menu-price/${selectedMenuId}`,
            {
              params: {
                outlet_id: userTokenData.outlet_id
              }
            }
          );
          const data = response.data.data;
          setCustomPrice(data.custom_prices);

          const initialCustomMenuPrice = data.custom_menu_prices.map(item => {
            return {
              id: item.id,
              custom_price_id: item.custom_price_id,
              menu_detail_id: item.menu_detail_id === 0 ? 0 : item.menu_detail_id,
              price: item.price
            };
          });
          setUpdatedCustomMenuPrice(initialCustomMenuPrice);

          const uniqueVariants = data.custom_menu_prices
            .filter((item) => item.menu_detail_id !== 0)
            .reduce((acc, item) => {
              if (
                !acc.find(
                  (uniqueItem) =>
                    uniqueItem.menu_detail_id === item.menu_detail_id
                )
              ) {
                acc.push({
                  menu_detail_id: item.menu_detail_id,
                  varian: item.varian,
                });
              }
              return acc;
            }, []);
          setCustomMenuVariants(uniqueVariants);
        } catch (error) {
          console.error("Error fetching custom price:", error);
        }
      };
      fetchData();
    } else {
      setCustomPrice([]);
      setCustomMenuVariants([]);
    }
  }, [showCustomPriceModal, selectedMenuId, apiBaseUrl, userTokenData]);

  const handleInputChange = (field, value, menuDetailId = 0) => {
    // Parse nilai input sebagai angka (gunakan parseFloat atau parseInt sesuai kebutuhan)
    const numericValue = parseInt(value);
    // Salin nilai-nilai harga kustom yang telah diubah ke dalam state baru
    const updatedPrice = updatedCustomMenuPrice.slice();

    // Cek apakah ini adalah elemen menu utama (menuDetailId === 0)
    const isMainMenuItem = menuDetailId === 0;

    // Temukan indeks elemen yang sesuai berdasarkan field dan menuDetailId
    const index = updatedPrice.findIndex((price) =>
      menuDetailId === 0
        ? price.custom_price_id === field
        : price.custom_price_id === field && price.menu_detail_id === menuDetailId
    );

    // Jika indeks ditemukan, perbarui nilai harga kustom
    if (index !== -1) {
      updatedPrice[index] = {
        ...updatedPrice[index],
        price: numericValue,
      };
    } else {
      // Jika indeks tidak ditemukan, tambahkan elemen baru ke updatedPrice
      updatedPrice.push({
        menu_id: selectedMenuId,
        custom_price_id: field,
        menu_detail_id: isMainMenuItem ? 0 : menuDetailId,
        price: numericValue,
      });
    }

    // Perbarui state updatedCustomMenuPrice dengan nilai yang telah diubah
    setUpdatedCustomMenuPrice(updatedPrice);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (selectedMenuId) {
        console.log("Payload to send:", updatedCustomMenuPrice);
        const response = await axios.patch(
          `${apiBaseUrl}/custom-menu-price/${selectedMenuId}`,
          {
            custom_prices: updatedCustomMenuPrice,
          }
        );

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Custom price berhasil diupdate!",
        });

        onCloseCustomPrice();
      }
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
        style={
          showCustomPriceModal ? { display: "block" } : { display: "none" }
        }
      >
        <div
          class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title" id="myModalLabel33">
                {menuName}
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
              {/* Loop through custom prices */}
              <h5 className="text-center">Harga Utama</h5>
              {customPrice.map((price) => (
                <div key={price.id}>
                  <label>{price.name}</label>
                  <input
                    type="number"
                    placeholder={price.name + " Price"}
                    className="form-control mb-2"
                    value={getCustomPriceForId(price.id)}
                    onChange={(e) => handleInputChange(price.id, e.target.value)}
                  />
                </div>
              ))}

              <hr></hr>

              {/* Loop through custom menu variants */}
              {customMenuVariants.length > 0 && (
                <>
                  <h5 className="text-center">Harga Varian</h5>
                  {customMenuVariants.map((item) => (
                    <>
                      <hr></hr>
                      <h6 className="text-center">{item.varian}</h6>
                      {customPrice.map((price) => (
                        <div key={price.id}>
                          <label>{price.name}</label>
                          <input
                            type="number"
                            placeholder="Custom Price"
                            className="form-control mb-2"
                            value={getCustomVariantPrice(
                              item.menu_detail_id,
                              price.id
                            )}
                            onChange={(e) => handleInputChange(price.id, e.target.value, item.menu_detail_id)}
                          />
                        </div>
                      ))}
                    </>
                  ))}
                </>
              )}

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

  // Function to get custom price for a specific id
  function getCustomPriceForId(id) {
    const priceData = updatedCustomMenuPrice.find(
      (price) => price.custom_price_id === id
    );
    return priceData ? priceData.price : 0;
  }

  // Function to get custom price for a specific variant and price ID
  function getCustomVariantPrice(variantId, priceId) {
    const updatedPriceData = updatedCustomMenuPrice.find((price) => {
      return (
        price.menu_detail_id === variantId &&
        price.custom_price_id === priceId
      );
    });
    return updatedPriceData ? updatedPriceData.price : 0;
  }
};
