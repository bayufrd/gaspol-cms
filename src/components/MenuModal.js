import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

export const MenuModal = ({ show, onClose, onSave, selectedMenuId }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [menuName, setMenuName] = useState("");
  const [menuType, setMenuType] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuDetails, setMenuDetails] = useState([]);

  const [isMenuNameValid, setMenuNameValid] = useState(true);
  const [isMenuTypeValid, setMenuTypeValid] = useState(true);
  const [isMenuPriceValid, setMenuPriceValid] = useState(true);
  const [menuDetailValidations, setMenuDetailValidations] = useState([
    { varian: true, price: true },
  ]);

  const [menuData, setMenuData] = useState(null);

  const handleMenuDetailChange = (index, field, value) => {
    const updatedMenuDetails = [...menuDetails];
    updatedMenuDetails[index][field] = value;
    setMenuDetails(updatedMenuDetails);

    const updatedValidations = [...menuDetailValidations];
    updatedValidations[index][field] = value !== "";
    setMenuDetailValidations(updatedValidations);
  };

  const handleAddMenuDetail = () => {
    setMenuDetails([...menuDetails, { varian: "", price: "" }]);
    setMenuDetailValidations([
      ...menuDetailValidations,
      { varian: true, price: true },
    ]);
  };

  const handleRemoveMenuDetail = (index) => {
    const updatedMenuDetails = [...menuDetails];
    updatedMenuDetails.splice(index, 1);
    setMenuDetails(updatedMenuDetails);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!menuName) {
      setMenuNameValid(false);
    }
    if (!menuType) {
      setMenuTypeValid(false);
    }
    if (!menuPrice) {
      setMenuPriceValid(false);
    }

    const isMenuDetailsEmpty = menuDetails.length === 0;
    if (!isMenuDetailsEmpty) {
      const updatedValidations = menuDetails.map((menuDetail) => {
        return {
          varian: menuDetail.varian !== "",
          price: menuDetail.price !== "",
        };
      });
      setMenuDetailValidations(updatedValidations);
  
      const isMenuDetailsValid = updatedValidations.every(
        (validation) => validation.varian && validation.price
      );
  
      if (!isMenuDetailsValid) {
        return;
      }
    }

    if (!isMenuNameValid || !isMenuTypeValid || !isMenuPriceValid) {
      return;
    }

    const newMenu = {
      name: menuName,
      menu_type: menuType,
      price: menuPrice,
      menu_details: menuDetails ? menuDetails : [],
    };

    try {
      const response = await axios.post(`${apiBaseUrl}/menu`, newMenu);
      console.log("Menu added:", response.data.message);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Menu berhasil " + menuName + " berhasil ditambahkan!",
      });
      onSave(newMenu);
      setMenuName("");
      setMenuType("");
      setMenuPrice("");
      setMenuDetails([]);
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: "Terdapat data yang tidak valid",
        icon: "error",
      });
    }
  };

  // Ambil data menu berdasarkan selectedMenuId saat modal terbuka
  useEffect(() => {
    const fetchData = async () => {
        if (show && selectedMenuId) {
            try {
                const response = await axios.get(`${apiBaseUrl}/menu/${selectedMenuId}`);
                setMenuData(response.data.data);
            } catch (error) {
                console.error('Error fetching menu:', error);
            }
        }
    }
    fetchData();
  }, [show, selectedMenuId]); 

  return (
    <>
      <div
        className={`modal fade text-left ${show ? "show" : ""}`}
        id="inlineForm"
        tabindex="-1"
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
                Add Menu
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
            <form action="#">
              <div class="modal-body">
                <label>Nama: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="Nama Menu"
                    class={`form-control ${
                      isMenuNameValid ? "" : "is-invalid"
                    }`}
                    value={menuName}
                    onChange={(e) => {
                      setMenuName(e.target.value);
                      setMenuNameValid(true);
                    }}
                  />
                  <div className="invalid-feedback">Nama menu harus diisi</div>
                </div>
                <label>Tipe Menu: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="Tipe Menu"
                    class={`form-control ${
                      isMenuTypeValid ? "" : "is-invalid"
                    }`}
                    value={menuType}
                    onChange={(e) => {
                      setMenuType(e.target.value);
                      setMenuTypeValid(true);
                    }}
                  />
                  <div className="invalid-feedback">Tipe menu harus diisi</div>
                </div>
                <label>Harga: </label>
                <div class="form-group">
                  <input
                    type="number"
                    placeholder="Harga Menu"
                    class={`form-control ${
                      isMenuPriceValid ? "" : "is-invalid"
                    }`}
                    value={menuPrice}
                    onChange={(e) => {
                      setMenuPrice(e.target.value);
                      setMenuPriceValid(true);
                    }}
                  />
                  <div className="invalid-f eedback">Harga menu harus diisi</div>
                </div>
              </div>
              <div>
                <div className="modal-header">
                  <h6 className="modal-title">Detail Menu Varian</h6>
                </div>
                <div class="modal-body">
                  {
                    menuDetails.map((menuDetail, index) => (
                    <div key={index}>
                      <div className="modal-menu-detail-form-group">
                        <div>
                          <label>Varian:</label>
                          <input
                            type="text"
                            className={`form-control ${
                              !menuDetailValidations[index].varian ? "is-invalid" : ""
                            }`}    
                            value={menuDetail.varian}
                            onChange={(e) =>
                              handleMenuDetailChange(
                                index,
                                "varian",
                                e.target.value
                              )
                            }
                          />
                          {!menuDetailValidations[index].varian && (
                            <div className="invalid-feedback">
                              Varian harus diisi.
                            </div>
                          )}
                        </div>
                        <div>
                          <label>Price:</label>
                          <input
                            type="number"
                            className={`form-control ${
                              !menuDetailValidations[index].price ? "is-invalid" : ""
                            }`}
                            value={menuDetail.price}
                            onChange={(e) =>
                              handleMenuDetailChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                          />
                          {!menuDetailValidations[index].price && (
                            <div className="invalid-feedback">
                              Harga harus diisi.
                            </div>
                          )}
                        </div>
                        <div>
                          {index >= 0 && (
                            <button
                              className="button btn icon btn-danger"
                              onClick={() => handleRemoveMenuDetail(index)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div class="form-group">
                    <div
                      className="button btn btn-light rounded-pill"
                      onClick={handleAddMenuDetail}
                    >
                      <i class="bi bi-plus"></i> Tambah detail menu
                    </div>
                  </div>
                </div>
              </div>
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
            </form>
          </div>
        </div>
      </div>
      <div className={show && `modal-backdrop fade show`}></div>
    </>
  );
};
