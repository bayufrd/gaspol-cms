import React, { useState, useEffect } from "react";
import axios from "axios";
import { IngredientModal } from "./IngredientModal";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Ingredient = () => {
  const [ingredients, setIngredients] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [ingredientTypes, setIngredientTypes] = useState([]);
  const [ingredientUnitTypes, setIngredientUnitTypes] = useState([]);
  const [storageLocationWarehouses, setStorageLocationWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState(null);

  useEffect(() => {
    getIngredients();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow", "padding-right");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  const getIngredients = async () => {
    const response = await axios.get(`${apiBaseUrl}/ingredient`);
    setIngredients(response.data.data.ingredients);
    setOutlets(response.data.data.outlets);
    setIngredientTypes(response.data.data.ingredientTypes);
    setIngredientUnitTypes(response.data.data.ingredientUnitTypes);
    setStorageLocationWarehouses(response.data.data.storageLocationWarehouses);
  };

  const openModal = (ingredient) => {
    setSelectedIngredientId(ingredient);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveIngredient = async (newIngredient) => {
    setIngredients([...ingredients, newIngredient]);
    closeModal();

    try {
      await getIngredients();
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Ingredients</h3>
            </div>
          </div>
        </div>
        <section class="section">
          <div class="card">
            <div class="card-header">
              <div class="float-lg-end">
                <div
                  className="button btn btn-primary rounded-pill"
                  onClick={() => openModal(null)}
                >
                  <i class="bi bi-plus"></i> Tambah Data
                </div>
              </div>
            </div>
            <div class="card-body">
              <table class="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Unit Type</th>
                    <th>Storage Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient, index) => (
                    <tr key={ingredient.id}>
                      <td>{index + 1}</td>
                      <td>{ingredient.name}</td>
                      <td>{ingredient.ingredient_type_name}</td>
                      <td>{ingredient.ingredient_unit_type_name}</td>
                      <td>{ingredient.ingredient_storage_warehouse_location_name}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(ingredient.id)}
                          >
                            <i className="bi bi-pencil"></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <IngredientModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveIngredient}
        selectedIngredientId={selectedIngredientId}
        getIngredients={getIngredients}
        ingredientTypes={ingredientTypes}
        ingredientUnitTypes={ingredientUnitTypes}
        storageLocationWarehouses={storageLocationWarehouses}
        outlets={outlets}
      />
    </div>
  );
};

export default Ingredient;
