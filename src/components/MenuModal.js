import React, { useState, useEffect, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { CustomPriceModal } from "./MenuCustomPriceModel";

// Import CSS
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "../styles/menu-modal.css";

// Register plugins
registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

// Komponen Modal Gambar Besar
const ImagePreviewModal = ({ show, imageUrl, onClose }) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content bg-transparent border-0">
          <div className="modal-header border-0">
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body text-center">
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const MenuModal = ({
  show,
  onClose,
  onSave,
  selectedMenuId,
  getMenus,
  userTokenData,
}) => {
  const { isDark } = useTheme();
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
  const [files, setFiles] = useState([]);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [initialMenuDetailsLength, setInitialMenuDetailsLength] = useState(0);
  const [showCustomPriceModal, setShowCustomPriceModal] = useState(false);

  // State untuk modal gambar
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);


  useEffect(() => {
    if (show && selectedMenuId) {
      const fetchData = async () => {
        try {

          const response = await axios.get(`${apiBaseUrl}/v2/menu/${selectedMenuId}`, {
            params: {
              outlet_id: userTokenData.outlet_id,
            },
          });
          const menuData = response.data.data;
          setMenu(menuData);

          if (menuData.image_url) {
            // Konstruksi URL gambar persis seperti di Menu.js
            const fullImageUrl = `${apiBaseUrl}/${menuData.image_url}`;

            console.log("Full Image URL:", fullImageUrl);

            // Buat promise untuk fetch gambar
            const createImageFile = () => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);

                  canvas.toBlob((blob) => {
                    const file = new File([blob], `menu-image-${menuData.name}.jpg`, {
                      type: 'image/jpeg'
                    });
                    resolve(file);
                  }, 'image/jpeg');
                };
                img.onerror = reject;
                img.src = fullImageUrl;
              });
            };

            try {
              const imageFile = await createImageFile();

              console.log("Created Image File:", {
                name: imageFile.name,
                size: imageFile.size,
                type: imageFile.type
              });

              // Simpan URL preview
              setPreviewImageUrl(fullImageUrl);

              // Set files untuk FilePond
              setFiles([
                {
                  source: imageFile,
                  options: {
                    type: 'local'
                  }
                }
              ]);

            } catch (imgError) {
              console.error("Error creating image file:", imgError);
              setFiles([]);
            }
          } else {
            // Tidak ada gambar
            setFiles([]);
            setPreviewImageUrl(null);
          }
        } catch (error) {
          console.error("Error processing blob image:", error);
          setFiles([]);
        }
      };

      fetchData();
    } else {
      resetForm();
    }
  }, [show, selectedMenuId, apiBaseUrl]);

  // Handler untuk membuka modal preview gambar
  const handleOpenImagePreview = () => {
    if (previewImageUrl) {
      setShowImagePreviewModal(true);
    }
  };

  // Handler untuk menutup modal preview gambar
  const handleCloseImagePreview = () => {
    setShowImagePreviewModal(false);
  };

  const handleImageError = (e) => {
    e.target.onerror = null; // Mencegah loop error
    e.target.src = "/assets/images/menu-template.svg"; // Gambar default
  };

  const resetForm = () => {
    setMenu(initialMenuState);
    setFiles([]);
    setIsFormValid(true);
    setInitialMenuDetailsLength(0);
  };

  const handleInputChange = (field, value) => {
    setMenu((prev) => ({ ...prev, [field]: value }));
  };

  const handleMenuDetailChange = (index, field, value) => {
    const updatedMenuDetails = [...menu.menu_details];
    updatedMenuDetails[index][field] = value;
    setMenu((prev) => ({ ...prev, menu_details: updatedMenuDetails }));
  };

  const handleAddMenuDetail = () => {
    setMenu((prev) => ({
      ...prev,
      menu_details: [...prev.menu_details, { varian: "", price: "" }],
    }));
  };

  const handleRemoveMenuDetail = (index) => {
    const updatedMenuDetails = [...menu.menu_details];
    updatedMenuDetails.splice(index, 1);
    setMenu((prev) => ({ ...prev, menu_details: updatedMenuDetails }));
  };

  const openCustomPriceModal = () => {
    setShowCustomPriceModal(true);
  };

  const handleDeleteMenu = async () => {
    try {
      const response = await axios.delete(
        `${apiBaseUrl}/menu/${selectedMenuId}`
      );
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
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menghapus menu",
      });
    }
  };

  const handleSaveMenuModal = async (e) => {
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

      if (menu.menu_details.length > 0) {
        formData.append("menu_details", JSON.stringify(menu.menu_details));
      }

      // Handle image upload
      if (files.length > 0 && files[0].file) {
        formData.append("image", files[0].file);
      }

      const url = selectedMenuId
        ? `${apiBaseUrl}/v2/menu/${selectedMenuId}`
        : `${apiBaseUrl}/v2/menu`;
      const method = selectedMenuId ? axios.patch : axios.post;

      const response = await method(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: selectedMenuId
          ? `Menu ${menu.name} berhasil diupdate`
          : `Menu ${menu.name} berhasil ditambahkan`,
      });

      onSave(menu);
      resetForm();
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: "Terdapat data yang tidak valid",
        icon: "error",
      });
    }
  };

  return (
    <>
      <div
        className={`modal fade text-left ${show ? "show" : ""}`}
        style={{
          display: show ? "block" : "none",
          backgroundColor: 'rgba(0,0,0,0.5)',
          ...(showCustomPriceModal ? { zIndex: "1039" } : {}),
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">
                {selectedMenuId ? "Edit Menu" : "Tambah Menu Baru"}
              </h4>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {/* Image Section - Centered at Top */}
              <div className="text-center mb-4">
                <div
                  className="d-inline-block position-relative"
                  style={{
                    width: '200px',
                    height: '200px',
                    cursor: previewImageUrl ? 'pointer' : 'default'
                  }}
                >
                  <div
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px solid #e0e0e0',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <FilePond
                      files={files}
                      onupdatefiles={(fileItems) => {
                        console.group("FilePond File Update");
                        console.log("Total File Items:", fileItems.length);

                        fileItems.forEach((fileItem, index) => {
                          console.log(`File ${index + 1} Details:`, {
                            filename: fileItem.filename || fileItem.file.name,
                            fileSize: fileItem.fileSize || fileItem.file.size,
                            fileType: fileItem.fileType || fileItem.file.type,
                            source: fileItem.source
                          });
                        });
                        console.groupEnd();

                        setFiles(fileItems);
                      }}
                      onaddfile={(error, file) => {
                        console.group("FilePond Add File");
                        if (error) {
                          console.error("FilePond Add File Error:", error);
                        } else {
                          console.log("FilePond Added File Details:", {
                            name: file.filename || file.name,
                            size: file.fileSize || file.size,
                            type: file.fileType || file.type,
                            source: file.source
                          });
                        }
                        console.groupEnd();
                      }}
                      onloaderror={(error) => {
                        console.error("FilePond Loader Error:", error);
                      }}
                      allowMultiple={false}
                      maxFiles={1}
                      name="image"
                      labelIdle='<span class="filepond--label-action">Upload Gambar</span>'
                      acceptedFileTypes={['image/png', 'image/jpeg', 'image/gif', 'image/blob']}
                      stylePanelLayout="compact"
                      styleLoadIndicatorPosition="center bottom"
                      styleButtonRemoveItemPosition="center bottom"
                    />
                  </div>
                  {previewImageUrl && (
                    <div
                      className="position-absolute top-0 end-0 m-2 bg-white rounded-circle shadow-sm"
                      style={{
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                      onClick={handleOpenImagePreview}
                    >
                      <i className="bi bi-zoom-in text-primary"></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Section - Inline Layout */}
              <div>
                  <div className="row g-3">
                    {/* Nama Menu */}
                    <div className="col-12 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <label className="fw-bold mb-0" style={{ minWidth: '120px' }}>Nama Menu</label>
                        <div className="flex-grow-1">
                          <input
                            type="text"
                            className={`form-control ${!isFormValid && menu.name === "" ? "is-invalid" : ""}`}
                            value={menu.name}
                            onChange={(e) => {
                              handleInputChange("name", e.target.value);
                              setIsFormValid(true);
                            }}
                            placeholder="Masukkan nama menu"
                          />
                          {!isFormValid && menu.name === "" && (
                            <div className="invalid-feedback">Nama menu harus diisi</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tipe Menu */}
                    <div className="col-12 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <label className="fw-bold mb-0" style={{ minWidth: '120px' }}>Tipe Menu</label>
                        <div className="flex-grow-1">
                          <select
                            className="form-select"
                            value={menu.menu_type}
                            onChange={(e) => handleInputChange("menu_type", e.target.value)}
                          >
                            <option value="Makanan">Makanan</option>
                            <option value="Minuman">Minuman</option>
                            <option value="Additional Makanan">Additional Makanan</option>
                            <option value="Additional Minuman">Additional Minuman</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Harga - hanya untuk menu baru */}
                    {!selectedMenuId && (
                      <div className="col-12 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <label className="fw-bold mb-0" style={{ minWidth: '120px' }}>Harga</label>
                          <div className="flex-grow-1">
                            <input
                              type="number"
                              className={`form-control ${!isFormValid && menu.price === "" ? "is-invalid" : ""}`}
                              value={menu.price}
                              onChange={(e) => {
                                handleInputChange("price", e.target.value);
                                setIsFormValid(true);
                              }}
                              placeholder="Masukkan harga menu"
                            />
                            {!isFormValid && menu.price === "" && (
                              <div className="invalid-feedback">Harga menu harus diisi</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Aktif */}
                    <div className="col-12 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <label className="fw-bold mb-0" style={{ minWidth: '120px' }}>Status Aktif</label>
                        <div className="flex-grow-1">
                          <select
                            className="form-select"
                            value={menu.is_active}
                            onChange={(e) => handleInputChange("is_active", e.target.value)}
                          >
                            <option value="1">Aktif</option>
                            <option value="0">Tidak Aktif</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Custom Price Button */}
                    {selectedMenuId && (
                      <div className="col-12 text-center mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill"
                          onClick={openCustomPriceModal}
                        >
                          <i className="bi bi-currency-dollar me-2"></i>Custom Price
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Menu Details Section */}


                  {/* Tombol Hapus Menu (hanya muncul saat edit) */}
                  {selectedMenuId && (
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        className="btn btn-danger rounded-pill"
                        onClick={() => setShowDeleteConfirmation(true)}
                      >
                        <i className="bi bi-trash me-2"></i>Hapus Menu
                      </button>
                    </div>
                  )}

                  {/* Menu Details Section */}
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0 fw-bold">Detail Menu Varian</h6>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleAddMenuDetail}
                        type="button"
                      >
                        <i className="bi bi-plus-circle me-1"></i> Tambah Varian
                      </button>
                    </div>
                    
                    {menu.menu_details.length > 0 ? (
                      <div className="list-group">
                        {menu.menu_details.map((menuDetail, index) => (
                          <div key={index} className="list-group-item">
                            <div className="row align-items-center">
                              <div className="col-auto">
                                <span className="badge bg-secondary rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {index + 1}
                                </span>
                              </div>
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Nama varian"
                                  value={menuDetail.varian}
                                  onChange={(e) =>
                                    handleMenuDetailChange(index, "varian", e.target.value)
                                  }
                                />
                              </div>
                              <div className="col-auto">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleRemoveMenuDetail(index)}
                                  title="Hapus varian"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Belum ada varian. Klik "Tambah Varian" untuk menambahkan.
                      </div>
                    )}
                  </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveMenuModal}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Gambar */}
      <ImagePreviewModal
        show={showImagePreviewModal}
        imageUrl={previewImageUrl}
        onClose={handleCloseImagePreview}
      />

      {/* Modal untuk Konfirmasi Hapus */}
      <DeleteConfirmationModal
        showDeleteConfirmation={showDeleteConfirmation}
        onConfirmDelete={handleDeleteMenu}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog="menu"
      />

      {/* Modal untuk Custom Price */}
      <CustomPriceModal
        showCustomPriceModal={showCustomPriceModal}
        selectedMenuId={selectedMenuId}
        menuName={menu.name}
        onCloseCustomPrice={() => setShowCustomPriceModal(false)}
        userTokenData={userTokenData}
      />
    </>
  );
};