import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FilePond, registerPlugin } from "react-filepond";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { CustomPriceModal } from "./MenuCustomPriceModel";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import filePondImagePreview from "filepond-plugin-image-preview";
registerPlugin(filePondImagePreview);

export const MenuModal = ({
  show,
  onClose,
  onSave,
  selectedMenuId,
  getMenus,
  userTokenData,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialMenuState = useMemo(
    () => ({
      name: "",
      menu_type: "Makanan",
      price: "",
      is_active: 1,
      outlet_id: userTokenData.outlet_id,
      menu_details: [],
    }),
    [userTokenData]
  );

  const [menu, setMenu] = useState(initialMenuState);
  const [fileState, setFileState] = useState(null);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [initialMenuDetailsLength, setInitialMenuDetailsLength] = useState(0);
  const [showCustomPriceModal, setShowCustomPriceModal] = useState(false);

  useEffect(() => {
    if (show && selectedMenuId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/v2/menu/${selectedMenuId}`
          );
          setMenu(response.data.data);
          if (response.data.data.image_url) {
            setFileState(`${apiBaseUrl}/${response.data.data.image_url}`);
          }
          setInitialMenuDetailsLength(response.data.data.menu_details.length);
        } catch (error) {
          console.error("Error fetching menu:", error);
        }
      };
      fetchData();
    } else {
      setMenu(initialMenuState);
      setIsFormValid(true);
      setFileState(null);
      setInitialMenuDetailsLength(0);
    }
  }, [show, selectedMenuId, apiBaseUrl, initialMenuState]);

  const handleInputChange = (field, value) => {
    setMenu({
      ...menu,
      [field]: value,
    });
  };

  const handleMenuDetailChange = (index, field, value) => {
    const updatedMenuDetails = [...menu.menu_details];
    updatedMenuDetails[index][field] = value;
    setMenu({
      ...menu,
      menu_details: updatedMenuDetails,
    });
  };

  const handleAddMenuDetail = () => {
    setMenu({
      ...menu,
      menu_details: [...menu.menu_details, { varian: "", price: "" }],
    });
  };

  const handleRemoveMenuDetail = (index) => {
    const updatedMenuDetails = [...menu.menu_details];
    updatedMenuDetails.splice(index, 1);
    setMenu({
      ...menu,
      menu_details: updatedMenuDetails,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate input
    const isMenuNameValid = menu.name.trim() !== "";
    const isMenuPriceValid = menu.price !== "";
    const isMenuDetailsValid = menu.menu_details.every(
      (detail) => detail.varian.trim() !== "" && detail.price !== ""
    );

    if (!isMenuNameValid || !isMenuPriceValid || !isMenuDetailsValid) {
      setIsFormValid(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", menu.name);
      formData.append("menu_type", menu.menu_type);
      formData.append("price", menu.price);
      formData.append("outlet_id", menu.outlet_id);
      formData.append("is_active", menu.is_active);

      if (menu.menu_details[0] != null) {
        formData.append("menu_details", JSON.stringify(menu.menu_details));
      }

      if (selectedMenuId) {
        if (fileState && fileState !== `${apiBaseUrl}/${menu.image_url}`) {
          formData.append("image", fileState[0]);
        }
        const response = await axios.patch(
          `${apiBaseUrl}/v2/menu/${selectedMenuId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Menu added:", response.data.message);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Menu berhasil diupdate: ${menu.name}`,
        });
      } else {
        if (fileState) {
          formData.append("image", fileState[0]);
        }
        const response = await axios.post(`${apiBaseUrl}/v2/menu`, formData, {
          headers: {
            "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
          },
        });
        console.log("Menu added:", response.data.message);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Menu berhasil ${menu.name} berhasil ditambahkan!`,
        });
      }
      onSave(menu);
      setMenu(initialMenuState);
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: "Terdapat data yang tidak valid",
        icon: "error",
      });
    }
  };

  const openCustomPriceModal = () => {
    setShowCustomPriceModal(true);
  };

  const handleDeleteMenu = async () => {
    try {
      const response = await axios.delete(
        `${apiBaseUrl}/menu/${selectedMenuId}`
      );
      console.log("Menu deleted:", response.data.message);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Menu berhasil dihapus: ${menu.name}`,
      });
      setShowDeleteConfirmation(false);
      await getMenus();
      onClose();
    } catch (error) {
      console.error("Error deleting menu:", error);
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
        style={{
          display: show ? "block" : "none",
          ...(showCustomPriceModal ? { zIndex: "1039" } : {}),
        }}
      >
        <div
          class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title" id="myModalLabel33">
                {selectedMenuId ? "Edit Menu" : "Add Menu"}
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
                <label>Gambar:</label>
                <div class="form-group">
                  <FilePond
                    className="image-preview-filepond"
                    files={fileState}
                    allowMultiple={false}
                    maxFileSize="2MB"
                    onupdatefiles={(fileItems) => {
                      if (fileItems.length > 0) {
                        setFileState(
                          fileItems.map((fileItem) => fileItem.file)
                        );
                      } else {
                        setFileState(null);
                      }
                    }}
                  />
                </div>
                <label>Nama: </label>
                <div class="form-group">
                  <input
                    type="text"
                    placeholder="Nama Menu"
                    class={`form-control ${isFormValid ? "" : "is-invalid"}`}
                    value={menu.name}
                    onChange={(e) => {
                      handleInputChange("name", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                  {!isFormValid && (
                    <div className="invalid-feedback">
                      Nama menu harus diisi
                    </div>
                  )}
                </div>
                <label>Tipe Menu: </label>
                <div class="form-group">
                  <select
                    class="form-select"
                    id="basicSelect"
                    value={menu.menu_type}
                    onChange={(e) => {
                      handleInputChange("menu_type", e.target.value);
                    }}
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Additional Makanan">
                      Additional Makanan
                    </option>
                    <option value="Additional Minuman">
                      Additional Minuman
                    </option>
                  </select>
                </div>
                {!selectedMenuId && (
                  <>
                    <label>Harga: </label>
                    <div class="form-group">
                      <input
                        type="number"
                        placeholder="Harga Menu"
                        className={`form-control ${
                          isFormValid ? "" : "is-invalid"
                        }`}
                        value={menu.price}
                        onChange={(e) => {
                          handleInputChange("price", e.target.value);
                          setIsFormValid(true);
                        }}
                      />
                      {!isFormValid && (
                        <div className="invalid-feedback">
                          Harga menu harus diisi
                        </div>
                      )}
                    </div>
                  </>
                )}
                <label>Status Active: </label>
                <div class="form-group">
                  <select
                    class="choices form-select"
                    value={menu.is_active}
                    onChange={(e) => {
                      handleInputChange("is_active", e.target.value);
                    }}
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                  </select>
                </div>
                {selectedMenuId && (
                  <div className="d-flex justify-content-center">
                    <div
                      className="btn btn-secondary rounded-pill"
                      onClick={openCustomPriceModal}
                    >
                      Custom Price
                    </div>
                  </div>
                )}
                <div>
                  <br></br>
                  <h6 className="modal-title">Detail Menu Varian</h6>
                  {menu.menu_details.map((menuDetail, index) => (
                    <div key={index}>
                      <div
                        className="modal-menu-detail-form-group"
                        style={
                          selectedMenuId ? { justifyContent: "center" } : {}
                        }
                      >
                        <div>
                          <label>Varian:</label>
                          <input
                            type="text"
                            className={`form-control ${
                              isFormValid ? "" : "is-invalid"
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
                          {!isFormValid && (
                            <div className="invalid-feedback">
                              Varian harus diisi.
                            </div>
                          )}
                        </div>
                        {(!selectedMenuId ||
                          (selectedMenuId &&
                            index >= initialMenuDetailsLength)) && (
                          <div>
                            <label>Price:</label>
                            <input
                              type="number"
                              className={`form-control ${
                                isFormValid ? "" : "is-invalid"
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
                            {!isFormValid && (
                              <div className="invalid-feedback">
                                Harga harus diisi.
                              </div>
                            )}
                          </div>
                        )}
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
                      style={
                        selectedMenuId
                          ? { display: "flex", justifyContent: "center" }
                          : {}
                      }
                    >
                      <i class="bi bi-plus"></i> Tambah varian menu
                    </div>
                  </div>
                </div>
                {selectedMenuId && (
                  <div className="modal-footer delete-menu">
                    <button
                      type="button"
                      class="btn btn-danger rounded-pill"
                      data-bs-dismiss="modal"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      <span class="d-none d-sm-block">Hapus Menu !</span>
                    </button>
                  </div>
                )}
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
            </div>
          </div>
        </div>
      </div>
      <div className={show && `modal-backdrop fade show`}></div>
      <DeleteConfirmationModal
        showDeleteConfirmation={showDeleteConfirmation}
        onConfirmDelete={handleDeleteMenu}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"menu"}
      />
      <CustomPriceModal
        showCustomPriceModal={showCustomPriceModal}
        selectedMenuId={selectedMenuId}
        menuName={menu.name}
        onCloseCustomPrice={() => setShowCustomPriceModal(false)}
      />
    </>
  );
};
