import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const IngredientReport = ({ userTokenData }) => {
    const [ingredientOrderLists, setIngredientOrderLists] = useState([]);
    const [ingredientOrderListDetails, setIngredientOrderListDetails] = useState([]);
    const [dateTimeFormatNow, setDateTimeFormatNow] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        getIngredientReport();
    }, []);

    const getIngredientReport = async () => {
        const response = await axios.get(`${apiBaseUrl}/ingredient-report`, {
            params: {
                outlet_id: userTokenData.outlet_id,
            },
        });
        setIngredientOrderLists(response.data.data.ingredeintOrderList);
        setIngredientOrderListDetails(response.data.data.ingredientOrderListDetails);
        setDateTimeFormatNow(response.data.data.date_time_now);
    };

    const handleEditButton = () => {
        setIsEditing(true);
    };

    const handleCancelButton = () => {
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setIngredientOrderLists(prevLists => ({
          ...prevLists,
          [field]: value,
        }));
      };
      
      const handleDetailChange = (detailId, field, value) => {
        setIngredientOrderListDetails(prevDetails =>
          prevDetails.map(detail => {
            if (detail.ingredient_order_list_detail_id === detailId) {
              return {
                ...detail,
                [field]: value,
              };
            }
            return detail;
          })
        );
      };

    const handleSaveButton = async () => {
        try {
            const payload = {
                ingredient_order_lists: ingredientOrderLists.map(orderList => ({
                    id: orderList.id,
                    kordinator_shift_pertama: orderList.kordinator_shift_pertama || '',
                    kordinator_shift_kedua: orderList.kordinator_shift_kedua || '',
                    checker_shift_pertama: orderList.checker_shift_pertama || '',
                    checker_shift_kedua: orderList.checker_shift_kedua || '',
                })),
                ingredient_order_list_details: ingredientOrderListDetails.map(detail => ({
                    ingredient_order_list_detail_id: detail.ingredient_order_list_detail_id,
                    current_shift_pertama: detail.current_shift_pertama || 0,
                    tambahan_shift_pertama: detail.tambahan_shift_pertama || 0,
                    akhir_shift_pertama: detail.akhir_shift_pertama || 0,
                    tambahan_shift_kedua: detail.tambahan_shift_kedua || 0,
                    akhir_shift_kedua: detail.akhir_shift_kedua || 0,
                })),
            };

            await axios.patch(`${apiBaseUrl}/ingredient-order`, payload);
            setIsEditing(false);

            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Laporan bahan baku berhasil diubah!",
            });
        } catch (error) {
            console.error("Failed to save data:", error.message);
        }
    };

    return (
        <>
            <h3 class="text-center">Laporan Bahan Baku {userTokenData.outlet_name}</h3>
            <h5 class="text-center mb-4">{dateTimeFormatNow}</h5>
            <div class="row match-height justify-content-center">
                {ingredientOrderLists !== 0 && (
                    <div class="col-8">
                        <div className="row row-nav">
                        </div>
                        <div class="card">
                            <div class="card-content">
                                <div className="full-height">
                                    <div class="card-body scrollable-content">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th rowSpan="3" className="border-end">Nama</th>
                                                    <th colSpan="8" class="border-end text-center">Shift Pertama</th>
                                                    <th colSpan="6" class="border-end text-center">Shift Kedua</th>
                                                </tr>
                                                <tr>
                                                    <th rowSpan="2" class="text-center">Awal</th>
                                                    <th rowSpan="2" class="text-center">Pagi</th>
                                                    <th rowSpan="2" class="text-center">Tambah</th>
                                                    <th rowSpan="2" class="text-center">Total</th>
                                                    <th rowSpan="2" class="text-center">Akhir</th>
                                                    <th rowSpan="1" colSpan="3" class="border-start border-end  text-center">Penjualan</th>
                                                    <th rowSpan="2" class="text-center">Tambah</th>
                                                    <th rowSpan="2" class="text-center">Total</th>
                                                    <th rowSpan="2" class="text-center">Akhir</th>
                                                    <th rowSpan="1" colSpan="3" class="border-start border-end  text-center">Penjualan</th>
                                                </tr>
                                                <tr>
                                                    <th class="border-start text-center">D</th>
                                                    <th class="border text-center">K</th>
                                                    <th class="border-end text-center">R</th>

                                                    <th class="border-start text-center">D</th>
                                                    <th class="border text-center">K</th>
                                                    <th class="border-end text-center">R</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-group-divider">
                                                {ingredientOrderListDetails.map((ingredientReportDetail) => {
                                                    return (
                                                        <tr
                                                            key={
                                                                ingredientReportDetail.ingredient_order_list_detail_id
                                                            }
                                                        >
                                                            <td className="fw-bold border-end">{ingredientReportDetail.ingredient_name}</td>
                                                            <td className="text-center">{ingredientReportDetail.awal || 0}</td>
                                                            <td>
                                                                {/* Shift 1 */}
                                                                <input
                                                                    type="number"
                                                                    value={ingredientReportDetail.current_shift_pertama || 0}
                                                                    class="form-control text-center"
                                                                    disabled={!isEditing}
                                                                    onChange={(e) => handleDetailChange(ingredientReportDetail.ingredient_order_list_detail_id, 'current_shift_pertama', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                {/* Tambahan Shift 1 */}
                                                                <input
                                                                    type="number"
                                                                    value={ingredientReportDetail.tambahan_shift_pertama || 0}
                                                                    class="form-control text-center"
                                                                    disabled={!isEditing}
                                                                    onChange={(e) => handleDetailChange(ingredientReportDetail.ingredient_order_list_detail_id, 'tambahan_shift_pertama', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-center">{ingredientReportDetail.total_shift_pertama}</td>
                                                            <td>
                                                                {/* Akhir Shift 1 */}
                                                                <input
                                                                    type="number"
                                                                    value={ingredientReportDetail.akhir_shift_pertama || 0}
                                                                    class="form-control text-center"
                                                                    disabled={!isEditing}
                                                                    onChange={(e) => handleDetailChange(ingredientReportDetail.ingredient_order_list_detail_id, 'akhir_shift_pertama', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="border-start text-center">{ingredientReportDetail.real_shift_pertama || 0}</td>
                                                            <td className="border">
                                                                {/* Penjualan Shift 1 */}
                                                                <input
                                                                    type="number"
                                                                    value={ingredientReportDetail.penjualan_shift_pertama || 0}
                                                                    class="form-control text-center"
                                                                    disabled={!isEditing}
                                                                    onChange={(e) => handleDetailChange(ingredientReportDetail.ingredient_order_list_detail_id, 'penjualan_shift_pertama', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="border-end text-center">{ingredientReportDetail.selisih_shift_pertama || 0}</td>
                                                            <td>
                                                                {/* Tambahan Malam */}
                                                                <input
                                                                    type="number"
                                                                    value={ingredientReportDetail.tambahan_shift_kedua || 0}
                                                                    class="form-control text-center"
                                                                    disabled={!isEditing}
                                                                    onChange={(e) => handleDetailChange(ingredientReportDetail.ingredient_order_list_detail_id, 'tambahan_shift_kedua', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-center">{ingredientReportDetail.total_shift_kedua || 0}</td>
                                                            <td>
                                                                {/* Akhir Malam */}
                                                                <input
                                                                    type="number"
                                                                    value={ingredientReportDetail.akhir_shift_kedua || 0}
                                                                    class="form-control text-center"
                                                                    disabled={!isEditing}
                                                                    onChange={(e) => handleDetailChange(ingredientReportDetail.ingredient_order_list_detail_id, 'akhir_shift_kedua', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="border-start text-center">{ingredientReportDetail.real_shift_kedua || 0}</td>
                                                            <td className="border">
                                                                {/* Penjualan Shift 2 */}
                                                                <input
                                                                    type="number"
                                                                    value={ingredientReportDetail.penjualan_shift_kedua || 0}
                                                                    class="form-control text-center"
                                                                    disabled={!isEditing}
                                                                    onChange={(e) => handleDetailChange(ingredientReportDetail.ingredient_order_list_detail_id, 'penjualan_shift_kedua', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="border-end text-center">{ingredientReportDetail.selisih_shift_kedua || 0}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        <table className="table">
                                        <thead>
                                            <tr>
                                                <th class="col-3 text-center">KORDINATOR SHIFT 1</th>
                                                <th class="col-3 text-center border-end">DICEK OLEH</th>
                                                <th class="col-3 text-center">KORDINATOR SHIFT 2</th>
                                                <th class="col-3 text-center">DICEK OLEH</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={ingredientOrderLists?.kordinator_shift_pertama || ""}
                                                        class="form-control text-center"
                                                        disabled={!isEditing}
                                                        onChange={(e) => handleChange("kordinator_shift_pertama", e.target.value)}
                                                    />
                                                </td>
                                                <td className="border-end">
                                                    <input
                                                        type="text"
                                                        value={ingredientOrderLists?.checker_shift_pertama || ""}
                                                        class="form-control text-center"
                                                        disabled={!isEditing}
                                                        onChange={(e) => handleChange("checker_shift_pertama", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={ingredientOrderLists?.kordinator_shift_kedua || ""}
                                                        class="form-control text-center"
                                                        disabled={!isEditing}
                                                        onChange={(e) => handleChange("kordinator_shift_kedua", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={ingredientOrderLists?.checker_shift_kedua || ""}
                                                        class="form-control text-center"
                                                        disabled={!isEditing}
                                                        onChange={(e) => handleChange("checker_shift_kedua", e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                                <div class="mb-3 d-flex justify-content-center">
                                    {isEditing ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-secondary mb-1 mx-2"
                                                onClick={handleCancelButton}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary mb-1"
                                            // onClick={handleSaveButton}
                                            >
                                                Simpan
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-primary mb-1"
                                            onClick={handleEditButton}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default IngredientReport;
