import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const UserModal = ({
  show,
  onClose,
  onSave,
  selectedUserId,
  getUsers,
  outlets,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialUserState = useMemo(() => ({
    name: "",
    username: "",
    password: "",
    outlet_id: 1,
    menu_access: "",
  }), []);

  const [user, setUser] = useState(initialUserState);
  const [isFormValid, setIsFormValid] = useState(true);
  const [menuAccess, setMenuAccess] = useState({
    menu: false,
    discount: false,
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
    let isPasswordValid = true;
    if(user.password) {
      isPasswordValid = user.password.trim().length >= 5;
    }
    
    if (!isUserNameValid || !isUserUsernameValid || !isPasswordValid) {
      setIsFormValid(false);
      return;
    }

    const selectedMenuAccess = [];
    if (menuAccess.menu) selectedMenuAccess.push("2");
    if (menuAccess.discount) selectedMenuAccess.push("3");
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
      console.log(error);
      Swal.fire({
        title: "Gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };

    const handleDeleteUser = async () => {
      try {
        await axios.delete(
          `${apiBaseUrl}/user-management/${selectedUserId}`
        );
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
            <div class="modal-header">
              <h4 class="modal-title" id="myModalLabel33">
                {selectedUserId ? "Edit User" : "Add User"}
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
                {!selectedUserId && (
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
                <label>Akses Menu:</label>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="menuCheckbox"
                    checked={menuAccess.menu}
                    onChange={() => handleCheckboxChange("menu")}
                  />
                  <label class="form-check-label" for="menuCheckbox">
                    Menu
                  </label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="discountCheckbox"
                    checked={menuAccess.discount}
                    onChange={() => handleCheckboxChange("discount")}
                  />
                  <label class="form-check-label" for="discountCheckbox">
                    Discount
                  </label>
                </div>
              </div>
              {selectedUserId && (
                  <div className="modal-footer delete-menu">
                    <button
                      type="button"
                      class="btn btn-danger rounded-pill"
                      data-bs-dismiss="modal"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      <span class="d-none d-sm-block">Hapus User !</span>
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
        onConfirmDelete={handleDeleteUser}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"user"}                      
      />
    </>
  );
};
