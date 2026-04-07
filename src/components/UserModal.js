import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import "../styles/user-modal.css";

export const UserModal = ({
  show,
  onClose,
  onSave,
  selectedUserId,
  getUsers,
  outlets,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialUserState = useMemo(
    () => ({
      name: "",
      username: "",
      password: "",
      outlet_id: 1,
      menu_access: "",
    }),
    []
  );

  const [user, setUser] = useState(initialUserState);
  const [isFormValid, setIsFormValid] = useState(true);
  const [menuAccess, setMenuAccess] = useState({
    menu: false,
    discount: false,
    report: false,
    serving_type: false,
    ingredients_order: false,
    ingredients_report: false,
    payment_type: false,
    member: false,
    whatsapp: false,
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (show && selectedUserId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/user-management/${selectedUserId}`
          );
          const userData = response.data.data;
          setUser(userData);
          const menuAccessArray = userData.menu_access.split(",");
          setMenuAccess({
            menu: menuAccessArray.includes("2"),
            discount: menuAccessArray.includes("3"),
            report: menuAccessArray.includes("4"),
            serving_type: menuAccessArray.includes("5"),
            ingredients_order: menuAccessArray.includes("6"),
            ingredients_report: menuAccessArray.includes("7"),
            payment_type: menuAccessArray.includes("8"),
            member: menuAccessArray.includes("9"),
            whatsapp: menuAccessArray.includes("11"),
          });
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      fetchData();
    } else {
      setUser(initialUserState);
      setMenuAccess({
        menu: false,
        discount: false,
        report: false,
        serving_type: false,
        ingredients_order: false,
        ingredients_report: false,
        payment_type: false,
        member: false,
        whatsapp: false,
      });
    }
  }, [show, selectedUserId, apiBaseUrl, initialUserState]);

  const handleInputChange = (field, value) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field) => {
    setMenuAccess({
      ...menuAccess,
      [field]: !menuAccess[field],
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isUserNameValid = user.name.trim() !== "";
    const isUserUsernameValid = user.username.trim() !== "";

    if (!isUserNameValid || !isUserUsernameValid) {
      setIsFormValid(false);
      return;
    }

    const selectedMenuAccess = [];
    if (menuAccess.menu) selectedMenuAccess.push("2");
    if (menuAccess.discount) selectedMenuAccess.push("3");
    if (menuAccess.report) selectedMenuAccess.push("4");
    if (menuAccess.serving_type) selectedMenuAccess.push("5");
    if (menuAccess.ingredients_order) selectedMenuAccess.push("6");
    if (menuAccess.ingredients_report) selectedMenuAccess.push("7");
    if (menuAccess.payment_type) selectedMenuAccess.push("8");
    if (menuAccess.member) selectedMenuAccess.push("9");
    if (menuAccess.whatsapp) selectedMenuAccess.push("11");
    user.menu_access = selectedMenuAccess.join(",");

    try {
      if (selectedUserId) {
        await axios.patch(
          `${apiBaseUrl}/user-management/${selectedUserId}`,
          user
        );
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `User berhasil diupdate: ${user.name}`,
        });
      } else {
        const isPasswordValid = user.password.trim() !== "" && user.password.length >= 5;
        if (!isPasswordValid) {
          setIsFormValid(false);
          return;
        }
        user.role = 2;
        await axios.post(`${apiBaseUrl}/user-management/`, user);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${user.name} berhasil ditambahkan!`,
        });
      }
      onSave(user);
      setUser(initialUserState);
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/user-management/${selectedUserId}`);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `User berhasil dihapus: ${user.name}`,
      });
      setShowDeleteConfirmation(false);
      await getUsers();
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
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
            <div className="modal-header user-modal-header">
              <h4 className="modal-title user-modal-title" id="myModalLabel33">
                <i className={`bi ${selectedUserId ? "bi-pencil" : "bi-plus-circle"}`}></i>
                {selectedUserId ? "Edit User" : "Tambah User Baru"}
              </h4>
              <button
                type="button"
                className="btn-close user-modal-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={onClose}
              >
              </button>
            </div>
            <div>
              <div className="modal-body user-modal-body scrollable-content">
                <div className="form-section">
                  <label className="form-label">Nama Pengguna</label>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Masukkan nama pengguna"
                      className={`form-control user-input ${!isFormValid && user.name === "" ? "is-invalid" : ""}`}
                      value={user.name}
                      onChange={(e) => {
                        handleInputChange("name", e.target.value);
                        setIsFormValid(true);
                      }}
                    />
                    {!isFormValid && user.name === "" ? (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle"></i> Nama pengguna harus diisi
                      </div>
                    ): null }
                  </div>
                </div>
                
                <div className="form-section">
                  <label className="form-label">Username</label>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Masukkan username"
                      className={`form-control user-input ${!isFormValid && user.username === "" ? "is-invalid" : ""}`}
                      value={user.username}
                      onChange={(e) => {
                        handleInputChange("username", e.target.value);
                        setIsFormValid(true);
                      }}
                    />
                    {!isFormValid && user.username === "" ? (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle"></i> Username harus diisi
                      </div>
                    ) : null}
                  </div>
                </div>
                {!selectedUserId && (
                  <div className="form-section">
                    <label className="form-label">Password</label>
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder="Masukkan password (min. 5 karakter)"
                        className={`form-control user-input ${
                          !isFormValid && user.password.length < 5 ? "is-invalid" : "" 
                        }`}
                        value={user.password}
                        onChange={(e) => {
                          handleInputChange("password", e.target.value);
                          setIsFormValid(true);
                        }}
                      />
                      {!isFormValid && user.password.length < 5 ? (
                        <div className="invalid-feedback">
                          <i className="bi bi-exclamation-circle"></i> Password harus diisi dan minimal 5 karakter
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                <div className="form-section">
                  <label className="form-label">Outlet</label>
                  <div className="form-group">
                    <select
                      className="form-select user-select"
                      value={user.outlet_id}
                      onChange={(e) =>
                        handleInputChange("outlet_id", e.target.value)
                      }
                    >
                      {outlets &&
                        outlets
                          .filter(outlet => outlet.id !== 4 && outlet.name !== 'Development Testing')
                          .map((outlet) => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="form-section">
                  <label className="form-label">Akses Menu</label>
                  <div className="checkbox-grid">
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="menuCheckbox"
                        checked={menuAccess.menu}
                        onChange={() => handleCheckboxChange("menu")}
                      />
                      <label className="form-check-label" htmlFor="menuCheckbox">
                        <i className="bi bi-shop"></i> Menu
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="discountCheckbox"
                        checked={menuAccess.discount}
                        onChange={() => handleCheckboxChange("discount")}
                      />
                      <label className="form-check-label" htmlFor="discountCheckbox">
                        <i className="bi bi-tag"></i> Discount
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="reportCheckbox"
                        checked={menuAccess.report}
                        onChange={() => handleCheckboxChange("report")}
                      />
                      <label className="form-check-label" htmlFor="reportCheckbox">
                        <i className="bi bi-bar-chart"></i> Report
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="servingTypeCheckbox"
                        checked={menuAccess.serving_type}
                        onChange={() => handleCheckboxChange("serving_type")}
                      />
                      <label className="form-check-label" htmlFor="servingTypeCheckbox">
                        <i className="bi bi-cup"></i> Serving Type
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="paymentTypeCheckbox"
                        checked={menuAccess.payment_type}
                        onChange={() => handleCheckboxChange("payment_type")}
                      />
                      <label className="form-check-label" htmlFor="paymentTypeCheckbox">
                        <i className="bi bi-credit-card"></i> Payment Type
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="memberCheckbox"
                        checked={menuAccess.member}
                        onChange={() => handleCheckboxChange("member")}
                      />
                      <label className="form-check-label" htmlFor="memberCheckbox">
                        <i className="bi bi-people"></i> Membership
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="whatsappCheckbox"
                        checked={menuAccess.whatsapp}
                        onChange={() => handleCheckboxChange("whatsapp")}
                      />
                      <label className="form-check-label" htmlFor="whatsappCheckbox">
                        <i className="bi bi-chat-dots"></i> WhatsApp
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="ingredientsOrderCheckbox"
                        checked={menuAccess.ingredients_order}
                        onChange={() => handleCheckboxChange("ingredients_order")}
                      />
                      <label className="form-check-label" htmlFor="ingredientsOrderCheckbox">
                        <i className="bi bi-basket"></i> Ingredients Order
                      </label>
                    </div>
                    <div className="form-check user-form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="ingredientsReportCheckbox"
                        checked={menuAccess.ingredients_report}
                        onChange={() => handleCheckboxChange("ingredients_report")}
                      />
                      <label className="form-check-label" htmlFor="ingredientsReportCheckbox">
                        <i className="bi bi-graph-up"></i> Ingredients Report
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer user-modal-footer">
                {selectedUserId && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm delete-btn"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <i className="bi bi-trash"></i> Hapus User
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
                    <i className="bi bi-check-circle"></i> {selectedUserId ? "Simpan Perubahan" : "Tambah User"}
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
        onConfirmDelete={handleDeleteUser}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"user"}
      />
    </>
  );
};
