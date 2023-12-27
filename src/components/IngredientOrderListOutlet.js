import React, { useState, useEffect } from "react";
import axios from "axios";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const IngredientOrderListOutlet = ({ userTokenData }) => {
    const [ingredientOrderLists, setIngredientOrderLists] = useState([]);
    const [ingredientTypes, setIngredientTypes] = useState([]);
    const [ingredientUnitTypes, setIngredientUnitTypes] = useState([]);
    const [outlets, setOutlets] = useState([]);

    useEffect(() => {
        getOrderListOutlet();
    }, []);

    const getOrderListOutlet = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/ingredient-order-outlet`);
            setIngredientTypes(response.data.data.order_lists);
            setIngredientOrderLists(response.data.data.ingredient_types);
            setIngredientUnitTypes(response.data.data.ingredient_unit_types);
            setOutlets(response.data.data.outlets);
        } catch (error) {
            console.error("Error fetching ingredient order list outlet:", error);
        }
    };

    return (
        <>  
            <div class="row match-height justify-content-center">
                <div class="card">
                    <div class="card-content">
                        <h4 class="text-center mt-4">PENGADAAN OUTLET</h4>
                        <div className="full-height d-flex justify-content-center">
                            <table className="table-bordered my-3">
                                <thead>
                                    <tr>
                                        {/* header for ingredient name */}
                                        <th rowspan="2" colspan="1" class="px-2 text-center fw-bold">Nama</th>
                                        {/* header for outlet name */}
                                        <th rowspan="2" colspan="1" class="px-2 text-center fw-bold">Sambel Colek Kaliurang</th>
                                        {/* header for outlet name */}
                                        <th rowspan="2" colspan="1" class="px-2 text-center fw-bold">Sambel Colek Babarsari</th>
                                        {/* header for outlet name */}
                                        <th rowspan="1" colspan="2" class="px-2 text-center fw-bold">Jempolan Coffee and Eatery</th>
                                        {/* header for outlet name */}
                                        <th rowspan="2" colspan="1" class="px-2 text-center fw-bold">Sambel Colek Condong Catur</th>
                                        {/* header for outlet name */}
                                        <th rowspan="1" colspan="2" class="px-2 text-center fw-bold">Nyah Tea</th>
                                    </tr>
                                    <tr>
                                        <th class="px-2 text-center">Kitchen</th>
                                        <th class="px-2 text-center">Bar</th>
                                        <th class="px-2 text-center">Kitchen</th>
                                        <th class="px-2 text-center">Bar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Sort ingredient by ingredient type */}
                                    <tr>
                                        {/* ingredient type */}
                                        <td colSpan="8" className="bg-light fw-bold text-center">
                                            ANEKA LAUK/FROZEN
                                        </td>
                                    </tr>
                                    <tr>
                                        {/* ingredient_name */}
                                        <td class="px-2 text-center fw-bold">
                                            Paha Atas
                                        </td>
                                        {/* order_request_quantity + ingredient_unit_types.name */}
                                        <td class="px-2 text-center">
                                            1 PCS
                                        </td>
                                        {/* order_request_quantity + ingredient_unit_types.name */}
                                        <td class="px-2 text-center">
                                            2 PACK
                                        </td>
                                        {/* order_request_quantity + ingredient_unit_types.name */}
                                        <td class="px-2 text-center">
                                            3 PCS
                                        </td>
                                        {/* order_request_quantity + ingredient_unit_types.name */}
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        {/* order_request_quantity + ingredient_unit_types.name */}
                                        <td class="px-2 text-center">
                                            1 KG
                                        </td>
                                        {/* order_request_quantity + ingredient_unit_types.name */}
                                        <td class="px-2 text-center">
                                            3 KG
                                        </td>
                                        {/* order_request_quantity + ingredient_unit_types.name */}
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-2 text-center fw-bold">
                                            Bebek
                                        </td>
                                        <td class="px-2 text-center">
                                            1 PCS
                                        </td>
                                        <td class="px-2 text-center">
                                            2 PACK
                                        </td>
                                        <td class="px-2 text-center">
                                            3 PCS
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        <td class="px-2 text-center">
                                            1 KG
                                        </td>
                                        <td class="px-2 text-center">
                                            3 KG
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                    </tr>
                                    {/* Sort ingredient by ingredient type */}
                                    <tr>
                                        {/* ingredient type */}
                                        <td colSpan="8" className="bg-light fw-bold text-center">
                                            VEGETABLE
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-2 text-center fw-bold">
                                            Cabe Rawit
                                        </td>
                                        <td class="px-2 text-center">
                                            1 PCS
                                        </td>
                                        <td class="px-2 text-center">
                                            2 PACK
                                        </td>
                                        <td class="px-2 text-center">
                                            3 PCS
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        <td class="px-2 text-center">
                                            1 KG
                                        </td>
                                        <td class="px-2 text-center">
                                            3 KG
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                    </tr>
                                    {/* Sort ingredient by ingredient type */}
                                    <tr>
                                        {/* ingredient type */}
                                        <td colSpan="8" className="bg-light fw-bold text-center">
                                            GROCERIES
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-2 text-center fw-bold">
                                            Rosemary
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        <td class="px-2 text-center">
                                            3 PCS
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        <td class="px-2 text-center bg-light">
                                            
                                        </td>
                                        <td class="px-2 text-center">
                                            3 PCS
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default IngredientOrderListOutlet;
