import React, { useState } from "react";

export const MenuModal = ({ show, onClose, onSave }) => {
  const [menuName, setMenuName] = useState("");
  const [menuType, setMenuType] = useState("");
  const [menuPrice, setMenuPrice] = useState("");

  const handleSave = () => {
    const newMenu = {
      menuName,
      menuType,
      menuPrice: parseFloat(menuPrice),
    };

    onSave(newMenu);
    setMenuName("");
    setMenuType("");
    setMenuPrice("");
  };

  return (
    <div
      className={`modal fade text-left ${show ? 'show' : ''}`}
      id="inlineForm"
      tabindex="-1"
      role="dialog"
      aria-labelledby="myModalLabel33"
      aria-modal={show ? "true" : undefined}
      aria-hidden={show ? undefined : "true"}
      style={show ? { display: 'block' } : { display: 'none' }}
    >
      <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title" id="myModalLabel33">
              Login Form{" "}
            </h4>
            <button
              type="button"
              class="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i data-feather="x"></i>
            </button>
          </div>
          <form action="#">
            <div class="modal-body">
              <label>Email: </label>
              <div class="form-group">
                <input
                  type="text"
                  placeholder="Email Address"
                  class="form-control"
                />
              </div>
              <label>Password: </label>
              <div class="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  class="form-control"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-light-secondary"
                data-bs-dismiss="modal"
              >
                <i class="bx bx-x d-block d-sm-none"></i>
                <span class="d-none d-sm-block">Close</span>
              </button>
              <button
                type="button"
                class="btn btn-primary ml-1"
                data-bs-dismiss="modal"
              >
                <i class="bx bx-check d-block d-sm-none"></i>
                <span class="d-none d-sm-block">login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
