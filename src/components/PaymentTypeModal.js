import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { useTheme } from "../contexts/ThemeContext";

export const PaymentTypeModal = ({
    show,
    onClose,
    onSave,
    selectedPaymentTypeId,
    getPaymentTypes,
    userTokenData,
    paymentCategories,
}) => {
    const { isDark = false } = useTheme() || {};
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    const initialPaymentTypeState = useMemo(
        () => ({
            name: "",
            is_active: 1,
            outlet_id: userTokenData.outlet_id,
            payment_category_id: 1,
        }),
        [userTokenData]
    );

    const [paymentType, setPaymentType] = useState(initialPaymentTypeState);
    const [isFormValid, setIsFormValid] = useState(true);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        if (show && selectedPaymentTypeId) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(
                        `${apiBaseUrl}/payment-management/${selectedPaymentTypeId}`
                    );
                    const paymentTypeData = response.data.data;
                    setPaymentType(paymentTypeData);
                } catch (error) {
                    console.error("Error fetching payment:", error);
                }
            };
            fetchData();
        } else {
            setPaymentType(initialPaymentTypeState);
            setIsFormValid(true);
        }
    }, [show, selectedPaymentTypeId, apiBaseUrl, initialPaymentTypeState, userTokenData]);

    const handleInputChange = (field, value) => {
        setPaymentType((prevPaymentType) => ({
            ...prevPaymentType,
            [field]: value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const isPaymentTypeNameValid = paymentType.name === "";

        if (
            isPaymentTypeNameValid
        ) {
            setIsFormValid(false);
            return;
        }

        try {
            if (selectedPaymentTypeId) {
                // For update: only send name, payment_category_id, is_active (outlet_id cannot be changed)
                await axios.patch(
                    `${apiBaseUrl}/payment-management/${selectedPaymentTypeId}`,
                    {
                        name: paymentType.name,
                        payment_category_id: paymentType.payment_category_id,
                        is_active: Number(paymentType.is_active)
                    }
                );
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: `Payment Type berhasil diperbarui: ${paymentType.name}`,
                });
            } else {
                // For create: send all fields including outlet_id
                await axios.post(`${apiBaseUrl}/payment-management/`, {
                    name: paymentType.name,
                    outlet_id: paymentType.outlet_id,
                    is_active: Number(paymentType.is_active),
                    payment_category_id: paymentType.payment_category_id
                });
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: `${paymentType.name} berhasil ditambahkan!`,
                });
            }
            onSave(paymentType);
            setPaymentType(initialPaymentTypeState);
            onClose();
        } catch (error) {
            Swal.fire({
                title: "Gagal",
                text: "Terdapat data yang tidak valid",
                icon: "error",
            });
        }
    };

    // const handleDeletePaymentType = async () => {
    //     try {
    //         await axios.delete(`${apiBaseUrl}/payment-management/${selectedPaymentTypeId}`);
    //         Swal.fire({
    //             icon: "success",
    //             title: "Success!",
    //             text: `${paymentType.name} berhasil dihapus!`,
    //         });
    //         setShowDeleteConfirmation(false);
    //         await getPaymentTypes();
    //         onClose();
    //     } catch (error) {
    //         console.error("Error deleting payment type:", error);
    //     }
    // };

    return (
        <>
            {show && <div className="modal-backdrop fade show"></div>}
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
                    <div class="modal-content scrollable-content" style={{ backgroundColor: isDark ? "#2d2d2d" : "white", color: isDark ? "#e0e0e0" : "#2d3436" }}>
                        <div class="modal-header" style={{ backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa", borderBottomColor: isDark ? "#444" : "#e9ecef" }}>
                            <h4 class="modal-title" id="myModalLabel33" style={{ color: isDark ? "#ffffff" : "#2d3436", fontWeight: "600" }}>
                                {selectedPaymentTypeId ? "Edit Payment Type" : "Add Payment Type"}
                            </h4>
                            <button
                                type="button"
                                class="close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={onClose}
                                style={{ color: isDark ? "#ffffff" : "#2d3436" }}
                            >
                                <i data-feather="x"></i>x
                            </button>
                        </div>
                        <div>
                            <div class="modal-body scrollable-content" style={{ backgroundColor: isDark ? "#2d2d2d" : "white", color: isDark ? "#e0e0e0" : "#2d3436" }}>
                                <label style={{ color: isDark ? "#ffffff" : "#2d3436" }}>Nama: </label>
                                <div class="form-group">
                                    <input
                                        type="text"
                                        placeholder="Nama"
                                        class={`form-control ${!isFormValid && paymentType.name === "" ? "is-invalid" : ""}`}
                                        style={{ backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa", color: isDark ? "#e0e0e0" : "#2d3436", borderColor: isDark ? "#555" : "#ddd" }}
                                        value={paymentType.name}
                                        onChange={(e) => {
                                            handleInputChange("name", e.target.value);
                                            setIsFormValid(true);
                                        }}
                                    />
                                    {!isFormValid && paymentType.name === "" ? (
                                        <div className="invalid-feedback">
                                            Nama harus diisi
                                        </div>
                                    ) : null}
                                </div>
                                {selectedPaymentTypeId && (
                                    <>
                                        <label style={{ color: isDark ? "#ffffff" : "#2d3436" }}>Status: </label>
                                        <div class="form-group">
                                            <select
                                                class="choices form-select"
                                                style={{ backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa", color: isDark ? "#e0e0e0" : "#2d3436", borderColor: isDark ? "#555" : "#ddd" }}
                                                value={paymentType.is_active}
                                                onChange={(e) => {
                                                    handleInputChange("is_active", e.target.value);
                                                }}
                                            >
                                                <option value="1">Aktif</option>
                                                <option value="0">Tidak Aktif</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <label style={{ color: isDark ? "#ffffff" : "#2d3436" }}>Category:</label>
                                <div className="form-group">
                                    <select
                                        className="form-select"
                                        style={{ backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa", color: isDark ? "#e0e0e0" : "#2d3436", borderColor: isDark ? "#555" : "#ddd" }}
                                        value={paymentType.payment_category_id}
                                        onChange={(e) =>
                                            handleInputChange("payment_category_id", e.target.value)
                                        }
                                    >
                                        {paymentCategories &&
                                            paymentCategories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                {/* {selectedPaymentTypeId && (
                                    <div className="delete-modal">
                                        <button
                                            type="button"
                                            class="btn btn-danger rounded-pill"
                                            data-bs-dismiss="modal"
                                            onClick={() => setShowDeleteConfirmation(true)}
                                        >
                                            <span class="d-none d-sm-block">Hapus Payment Type!</span>
                                        </button>
                                    </div>
                                )} */}
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
                // onConfirmDelete={handleDeletePaymentType}
                onCancelDelete={() => setShowDeleteConfirmation(false)}
                purposeDialog={"serving type"}
            />
        </>
    );
};
