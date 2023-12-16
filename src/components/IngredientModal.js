import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const IngredientModal = ({
  show,
  onClose,
  onSave,
  selectedIngredientId,
  getIngredients,
  ingredientTypes,
  ingredientUnitTypes,
  storageLocationWarehouses,
  outlets
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialIngredientState = useMemo(
    () => ({
      name: "",
      ingredient_type_id: 1,
      ingredient_unit_type_id: 1,
      storage_location_warehouse_id: 1,
      ingredient_access: "",
    }),
    []
  );

  const [ingredient, setIngredient] = useState(initialIngredientState);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const handleOutletChange = (outletId) => {
    const updatedOutlets = selectedOutlets.includes(outletId)
      ? selectedOutlets.filter((id) => id !== outletId)
      : [...selectedOutlets, outletId];
  
    setSelectedOutlets(updatedOutlets);
  
    const ingredientAccess = updatedOutlets.length > 0 ? updatedOutlets.join(",") : "";
  
    setIngredient({
      ...ingredient,
      ingredient_access: ingredientAccess,
    });
  };
  

  useEffect(() => {
    if (show && selectedIngredientId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/ingredient/${selectedIngredientId}`
          );
          const IngredientData = response.data.data;
          setIngredient(IngredientData);
          const ingredientAccessArray = IngredientData.ingredient_access
          ? IngredientData.ingredient_access.split(",")
          : [];
          setSelectedOutlets(
            ingredientAccessArray.map((outletId) => parseInt(outletId, 10))
          );
        } catch (error) {
          console.error("Error fetching ingredient:", error);
        }
      };
      fetchData();
    } else {
      setIngredient(initialIngredientState);
      setIsFormValid(true);
      setSelectedOutlets([]);
    }
  }, [show, selectedIngredientId, apiBaseUrl, initialIngredientState]);

  const handleInputChange = (field, value) => {
    setIngredient((prevIngredient) => ({
      ...prevIngredient,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isIngredientNameValid = ingredient.name.trim() === "";

    if (
        isIngredientNameValid
    ) {
      setIsFormValid(false);
      return;
    }

    try {
      if (selectedIngredientId) {
        await axios.patch(
          `${apiBaseUrl}/ingredient/${selectedIngredientId}`,
          ingredient
        );
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Ingredient berhasil diperbarui: ${ingredient.name}`,
        });
      } else {
        await axios.post(`${apiBaseUrl}/ingredient/`, ingredient);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${ingredient.name} berhasil ditambahkan!`,
        });
      }
      onSave(ingredient);
      setIngredient(initialIngredientState);
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: "Terdapat data yang tidak valid",
        icon: "error",
      });
    }
  };

  const handleDeleteIngredient = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/ingredient/${selectedIngredientId}`);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${ingredient.name} berhasil dihapus!`,
      });
      setShowDeleteConfirmation(false);
      await getIngredients();
      onClose();
    } catch (error) {
      console.error("Error deleting ingredient:", error);
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
                {selectedIngredientId ? "Edit Ingredient" : "Add Ingredient"}
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
                    placeholder="Nama"
                    class={`form-control ${!isFormValid && ingredient.name === "" ? "is-invalid" : ""}`}
                    value={ingredient.name}
                    onChange={(e) => {
                      handleInputChange("name", e.target.value);
                      setIsFormValid(true);
                    }}
                  />
                  {!isFormValid && ingredient.name === "" ? (
                    <div className="invalid-feedback">
                      Nama harus diisi
                    </div>
                  ) : null}
                </div>
                <label>Type:</label>
                <div className="form-group">
                  <select
                    className="form-select"
                    value={ingredient.ingredient_type_id}
                    onChange={(e) =>
                      handleInputChange("ingredient_type_id", e.target.value)
                    }
                  >
                    {ingredientTypes &&
                      ingredientTypes.map((ingredientType) => (
                        <option key={ingredientType.id} value={ingredientType.id}>
                          {ingredientType.name}
                        </option>
                      ))}
                  </select>
                </div>
                <label>Unit Type:</label>
                <div className="form-group">
                  <select
                    className="form-select"
                    value={ingredient.ingredient_unit_type_id}
                    onChange={(e) =>
                      handleInputChange("ingredient_unit_type_id", e.target.value)
                    }
                  >
                    {ingredientUnitTypes &&
                      ingredientUnitTypes.map((ingredientUnitType) => (
                        <option key={ingredientUnitType.id} value={ingredientUnitType.id}>
                          {ingredientUnitType.name}
                        </option>
                      ))}
                  </select>
                </div>
                <label>Storage Location:</label>
                <div className="form-group">
                  <select
                    className="form-select"
                    value={ingredient.storage_location_warehouse_id}
                    onChange={(e) =>
                      handleInputChange("storage_location_warehouse_id", e.target.value)
                    }
                  >
                    {storageLocationWarehouses &&
                      storageLocationWarehouses.map((storageLocationWarehouse) => (
                        <option key={storageLocationWarehouse.id} value={storageLocationWarehouse.id}>
                          {storageLocationWarehouse.name}
                        </option>
                      ))}
                  </select>
                </div>
                <label>Outlet Access:</label>
                <div className="form-group">
                {outlets && outlets.map((outlet) => (
                  <div className="form-check" key={outlet.id}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedOutlets.includes(outlet.id)}
                      onChange={() => handleOutletChange(outlet.id)}
                    />
                    <label className="form-check-label">
                      {outlet.name}
                    </label>
                  </div>
                ))}
                </div>
              </div>
              <div class="modal-footer">
              {selectedIngredientId && (
                <div className="delete-modal">
                  <button
                    type="button"
                    class="btn btn-danger rounded-pill"
                    data-bs-dismiss="modal"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <span class="d-none d-sm-block">Hapus Ingredient!</span>
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
        onConfirmDelete={handleDeleteIngredient}
        onCancelDelete={() => setShowDeleteConfirmation(false)}
        purposeDialog={"ingredient"}
      />
    </>
  );
};
