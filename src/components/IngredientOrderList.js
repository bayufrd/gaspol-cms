import React, { useState, useEffect } from "react";
import axios from "axios";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const IngredientOrderList = ({ userTokenData }) => {
    const [ingredientTypes, setIngredientTypes] = useState([]);
    const [ingredientUnitTypes, setIngredientUnitTypes] = useState([]);
    const [ingredeintOrderLists, setIngredeintOrderLists] = useState([]);
    const [ingredientOrderListDetails, setIngredientOrderListDetails] = useState([]);
    const [ingredientOrderBarListDetails, setIngredientOrderBarListDetails] = useState([]);
    const [displayStorageOutletType, setDisplayStorageOutletType] = useState(1);

    useEffect(() => {
        getOrderList();
    }, []);

    const getOrderList = async () => {
        const response = await axios.get(`${apiBaseUrl}/ingredient-order`, {
            params: {
                outlet_id: userTokenData.outlet_id,
            },
        });
        setIngredeintOrderLists(response.data.data.ingredeint_order_lists);
        setIngredientOrderListDetails(response.data.data.ingredient_order_list_details);
        setIngredientOrderBarListDetails(response.data.data.ingredient_order_bar_list_details);
        setIngredientTypes(response.data.data.ingredient_types);
        setIngredientUnitTypes(response.data.data.ingredient_unit_types);
    };

    const handleDisplayStorageOutletTypeChange = (type) => {
        setDisplayStorageOutletType(type);
    };

    const displayDetails = displayStorageOutletType === 1 ? ingredientOrderListDetails : ingredientOrderBarListDetails;

    return (
        <>
            <div class="row match-height justify-content-center">
                {ingredeintOrderLists !== 0 && (
                    <div class="col-8">
                        <div className="row row-nav">
                            {ingredeintOrderLists.length > 1 && (
                                <>
                                    <div className={`card card-nav`}>
                                        <button
                                            className="card-header"
                                            onClick={() => handleDisplayStorageOutletTypeChange(1)}
                                        >
                                            <h5 class="card-title text-center">Kitchen</h5>
                                        </button>
                                    </div>
                                    <div className={`card card-nav`}>
                                        <button
                                            className="card-header"
                                            onClick={() => handleDisplayStorageOutletTypeChange(0)}
                                        >
                                            <h5 class="card-title text-center">Bar</h5>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div class="card">
                            <div class="card-content">
                                <div className="full-height">
                                    <div class="card-body scrollable-content">
                                        {ingredientTypes.map((type) => {
                                            const filteredDetails = displayDetails.filter(
                                                (detail) => detail.ingredient_type_id === type.id
                                            );

                                            // Skip rendering if there are no details for the current ingredient_type
                                            if (filteredDetails.length === 0) {
                                                return null;
                                            }

                                            return (
                                                <div key={type.id}>
                                                    <h5 className="text-center py-2" style={{backgroundColor: "#f8f9fa"}}>{type.name}</h5>
                                                    <table class="table">
                                                        <thead>
                                                            <tr>
                                                                <th class="col-4">Nama</th>
                                                                <th class="col-2 text-center">Sisa</th>
                                                                <th class="col-2 text-center">Order</th>
                                                                <th class="col-2 text-center">Real</th>
                                                                <th class="col-2 text-center">Kuantitas Order</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                        {filteredDetails.map((filteredDetail) => {
                                                                const ingredientUnitType = ingredientUnitTypes.find(
                                                                    (unitType) => unitType.id === filteredDetail.ingredient_unit_type_id
                                                                );

                                                                return (
                                                                    <tr
                                                                        key={
                                                                            filteredDetail.ingredient_order_list_detail_id
                                                                        }
                                                                    >
                                                                        <td>{filteredDetail.ingredient_name}</td>
                                                                        <td>
                                                                            <input
                                                                                type="text"
                                                                                id="first-name-column"
                                                                                class="form-control text-center"
                                                                                placeholder=""
                                                                                name="fname-column"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <input
                                                                                type="text"
                                                                                id="first-name-column"
                                                                                class="form-control text-center"
                                                                                placeholder=""
                                                                                name="fname-column"
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <input
                                                                                type="text"
                                                                                id="first-name-column"
                                                                                class="form-control text-center"
                                                                                placeholder=""
                                                                                name="fname-column"
                                                                            />
                                                                        </td>
                                                                        <td className="text-center">{filteredDetail.order_quantity} {ingredientUnitType?.name}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    <br></br>
                                                    <br></br>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div class="my-3 d-flex justify-content-center">
                                    <button type="submit" class="btn btn-primary me-1 mb-1">
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default IngredientOrderList;
