import React, { useState, useEffect } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const IngredientOrderListOutlet = ({ userTokenData }) => {
    const [ingredientOrderLists, setIngredientOrderLists] = useState([]);
    const [ingredientTypes, setIngredientTypes] = useState([]);
    const [ingredientUnitTypes, setIngredientUnitTypes] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [dateTimeFormatNow, setDateTimeFormatNow] = useState("");

    const componentRef = React.useRef();
    const handlePrintPDF = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Laporan Bahan Baku - " + dateTimeFormatNow,
    });

    useEffect(() => {
        getOrderListOutlet();
    }, []);

    const getOrderListOutlet = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/ingredient-order-outlet`);
            setIngredientOrderLists(response.data.data.order_lists);
            setIngredientTypes(response.data.data.ingredient_types);
            setIngredientUnitTypes(response.data.data.ingredient_unit_types);
            setOutlets(response.data.data.outlets);
            setDateTimeFormatNow(response.data.data.date_time_now);
        } catch (error) {
            console.error("Error fetching ingredient order list outlet:", error);
        }
    };

    const getUniqueOutlets = () => {
        const uniqueOutletIds = [...new Set(ingredientOrderLists.map((list) => list.outlet_id))];

        // Have bar
        const haveBarOutlets = ingredientOrderLists.filter((list) => list.storage_location_outlet === 0).map((list) => list.outlet_id);

        return uniqueOutletIds.map((outletId) => {
            const outlet = outlets.find((o) => o.id === outletId);
            const outlet_name = outlet ? outlet.name : "";
            const is_have_bar = haveBarOutlets.includes(outletId);

            return {
                outlet_id: outletId,
                outlet_name: outlet_name,
                is_have_bar,
            };
        });
    };

    const getUniqueIngredientTypes = () => {
        const uniqueTypeIds = [...new Set(ingredientOrderLists.flatMap(list => list.ingredientOrderListDetails.map(detail => detail.ingredient_type_id)))];
        return ingredientTypes.filter((type) => uniqueTypeIds.includes(type.id));
    };

    return (
        <>
            <div class="row match-height justify-content-center">
                <div class="card">
                    <div class="card-content">
                        <div ref={componentRef}>
                            <h4 class="text-center mt-4">LAPORAN PENGADAAN BAHAN BAKU SEMUA OUTLET</h4>
                            <h5 class="text-center">{dateTimeFormatNow}</h5>
                            <div className="full-height d-flex justify-content-center">
                                <table className="table-bordered my-3">
                                    <thead>
                                        <tr>
                                            {/* header for ingredient name */}
                                            <th rowSpan="2" colSpan="1" className="px-2 text-center fw-bold">Nama</th>
                                            {/* header for outlet name */}
                                            {getUniqueOutlets().map((outlet, index) => (
                                                <React.Fragment key={index}>
                                                    {outlet.is_have_bar ? (
                                                        <>
                                                            {/* Render header for outlet with bar */}
                                                            <th rowspan="1" colspan="2" className="px-2 text-center fw-bold">
                                                                {outlet.outlet_name}
                                                            </th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Render header for outlet without bar */}
                                                            <th rowspan="2" colspan="1" className="px-2 text-center fw-bold">
                                                                {outlet.outlet_name}
                                                            </th>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                        <tr>
                                            {/* this cell show when order list have 2 object where have same outlet_id and then split by storage_location_outlet */}
                                            {getUniqueOutlets().filter((outlet) => outlet.is_have_bar).map((outlet, index) => (
                                                <React.Fragment key={index}>
                                                    <th className="px-2 text-center">Kitchen</th>
                                                    <th className="px-2 text-center">Bar</th>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getUniqueIngredientTypes().map((ingredientType) => (
                                            <React.Fragment key={ingredientType}>
                                                <tr>
                                                    {/* Ingredient type */}
                                                    <td colSpan={1 + ingredientOrderLists.length} className="fw-bold text-center fs-5 bg-secondary bg-opacity-25">
                                                        {ingredientType.name}
                                                    </td>
                                                </tr>
                                                {ingredientOrderLists
                                                    .flatMap((list) => list.ingredientOrderListDetails)
                                                    .filter((detail) => detail.ingredient_type_id === ingredientType.id)
                                                    .reduce((accumulator, detail) => {
                                                        // Use a set to keep track of processed ingredient_id values
                                                        if (!accumulator.processedIngredientIds.has(detail.ingredient_id)) {
                                                            accumulator.processedIngredientIds.add(detail.ingredient_id);
                                                            accumulator.rows.push(
                                                                <tr key={detail}>
                                                                    {/* Ingredient name */}
                                                                    <td className="px-2 text-center fw-bold">{detail.ingredient_name}</td>
                                                                    {/* Order quantities for each outlet */}
                                                                    {getUniqueOutlets().reduce((accumulatorOutlet, outlet) => {
                                                                        const ingredientOrderList = ingredientOrderLists
                                                                            .filter((list) => list.outlet_id === outlet.outlet_id)

                                                                        const ingredientOrderListDetail = ingredientOrderList
                                                                            .filter((list) => list.storage_location_outlet === 1)
                                                                            .flatMap((detailOrder) => detailOrder.ingredientOrderListDetails)
                                                                            .filter((detailOrder) => detailOrder.ingredient_id === detail.ingredient_id)

                                                                        const orderDetail = ingredientOrderListDetail[0];
                                                                        const unitType = ingredientUnitTypes.find((u) => u.id === orderDetail?.ingredient_unit_type_id);
                                                                        accumulatorOutlet.push(
                                                                            <>
                                                                                {orderDetail ? (
                                                                                    <>
                                                                                        <td key={outlet.outlet_id} className="px-2 text-center fw-bold">
                                                                                            {Math.round(orderDetail.order_request_quantity) + " " + unitType.name}
                                                                                        </td>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <td key={outlet.outlet_id} className="px-2 text-center bg-light"></td>
                                                                                    </>
                                                                                )}
                                                                            </>
                                                                        );

                                                                        if (outlet.is_have_bar === true) {
                                                                            const ingredientOrderListDetailBar = ingredientOrderList
                                                                                .filter((list) => list.storage_location_outlet === 0)
                                                                                .flatMap((detailOrder) => detailOrder.ingredientOrderListDetails)
                                                                                .filter((detailOrder) => detailOrder.ingredient_id === detail.ingredient_id)

                                                                            const orderDetailBar = ingredientOrderListDetailBar[0];
                                                                            const unitType = ingredientUnitTypes.find((u) => u.id === orderDetailBar?.ingredient_unit_type_id);
                                                                            accumulatorOutlet.push(
                                                                                <>
                                                                                    {orderDetailBar ? (
                                                                                        <>
                                                                                            <td key={outlet.outlet_id} className="px-2 text-center fw-bold">
                                                                                                {Math.round(orderDetailBar.order_request_quantity) + " " + unitType.name}
                                                                                            </td>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <td key={outlet.outlet_id} className="px-2 text-center bg-light"></td>
                                                                                        </>
                                                                                    )}
                                                                                </>
                                                                            );
                                                                        }

                                                                        return accumulatorOutlet;
                                                                    }, [])}
                                                                </tr>
                                                            );
                                                        }
                                                        return accumulator;
                                                    }, { processedIngredientIds: new Set(), rows: [] }).rows}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="my-3 d-flex justify-content-center">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handlePrintPDF}
                            >
                                Print PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default IngredientOrderListOutlet;
