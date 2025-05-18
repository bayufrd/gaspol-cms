import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const PaymentTypeModal = ({
    show,
    onClose,
    onSave,
    selectedPaymentTypeId,
    getPaymentTypes,
    userTokenData,
    paymentCategories,
}) => {
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
                await axios.patch(
                    `${apiBaseUrl}/payment-management/${selectedPaymentTypeId}`,
                    paymentType
                );
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: `Payment Type berhasil diperbarui: ${paymentType.name}`,
                });
            } else {
                await axios.post(`${apiBaseUrl}/payment-management/`, paymentType);
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
                                {selectedPaymentTypeId ? "Edit Payment Type" : "Add Payment Type"}
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
                                        class={`form-control ${!isFormValid && paymentType.name === "" ? "is-invalid" : ""}`}
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
                                        <label>Status: </label>
                                        <div class="form-group">
                                            <select
                                                class="choices form-select"
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
                                <label>Category:</label>
                                <div className="form-group">
                                    <select
                                        className="form-select"
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
