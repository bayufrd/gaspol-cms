import React, { useState, useEffect } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { ReportDetailModal } from "./ReportDetailModal";
import Swal from "sweetalert2";

export const ReportPaymentModal = ({
  show,
  onClose,
  userTokenData,
  startDate,
  endDate,
  shiftNumber,
  selectedShift,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [paymentReport, setPaymentReport] = useState(null);
  const [startDateShift, setStartDateShift] = useState(null);
  const [endDateShift, setEndDateShift] = useState(null);
  const [shiftDetails, setShiftDetails] = useState(null);
  const [expenditures, setExpenditures] = useState(null);
  const [withOutDiscount, setWithOutDiscount] = useState(false);
  const [withDiscountCart, setWithDiscountCart] = useState(false);
  const [withDiscountPerItem, setWithDiscountPerItem] = useState(false);
  const [discountType, setDiscountType] = useState(0);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showDetailPaymentModal, setShowDetailPaymentModal] = useState(false);
  const componentRef = React.useRef();

  function toPascalCaseWithSpaces(text) {
    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  const filePdfName =
    startDate === endDate
      ? `${userTokenData.outlet_name}-${startDate}`
      : `${userTokenData.outlet_name}-${startDate}-${endDate}`;

  const handlePrintPDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: filePdfName,
  });
  
  const groupCartDetails = (cartDetails) => {
    const grouped = cartDetails.reduce((acc, item) => {
      if(item.menu_varian_id == null) {
        item.menu_varian_id = 0;
      }
      const key = `${item.menu_id}-${item.menu_varian_id}`;
      if (!acc[key]) {
        acc[key] = {
          ...item,
          total_quantity: 0,
          total_price: 0,
        };
      }
      acc[key].total_quantity += item.qty;
      acc[key].total_price += item.total_price;
      return acc;
    }, {});

    // Convert the grouped object into an array
    const groupedArray = Object.values(grouped);

    // Sort the grouped array by menu_name in ascending order
    groupedArray.sort((a, b) => a.menu_name.localeCompare(b.menu_name));
    
    return groupedArray;
  };

  const groupedCartDetails = paymentReport && paymentReport.cart_details ? groupCartDetails(paymentReport.cart_details) : [];

  // const groupRefunds = (refunds) => {
  //   const grouped = refunds.reduce((acc, item) => {
  //      if(item.menu_varian_id == null) {
  //        item.menu_varian_id = 0;
  //      }
  //     const key = `${item.menu_id}-${item.menu_varian_id}`;
  //     if (!acc[key]) {
  //       acc[key] = {
  //         ...item,
  //         total_quantity: 0,
  //         total_price: 0,
  //       };
  //     }
  //     acc[key].total_quantity += item.qty;
  //     acc[key].total_price += item.total_price;
  //     return acc;
  //   }, {});
  //   return Object.values(grouped);
  // };

  // const groupedRefunds = paymentReport.refund ? groupRefunds(paymentReport.refund[0]) : [];

  useEffect(() => {
    if (show && startDate && endDate) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${apiBaseUrl}/payment-report`, {
            params: {
              outlet_id: userTokenData.outlet_id,
              start_date: startDate,
              end_date: endDate,
              is_shift: shiftNumber,
            },
          });
          const paymentReportData = response.data.data;
          setPaymentReport(paymentReportData);
          if (paymentReportData) {
            setStartDateShift(paymentReportData.start_date);
            setEndDateShift(paymentReportData.end_date);
          }
          if (paymentReportData.shift_details) {
            setShiftDetails(paymentReportData.shift_details);
          }
          if (paymentReportData.expenditures) {
            setExpenditures(paymentReportData.expenditures);
          }
        } catch (error) {
          if (error.response.data.code === 404) {
            Swal.fire({
              icon: "error",
              title: "Data Tidak ditemukan!",
              text: error.response.data.message,
            });
          }
          console.error("Error fetching payment report:", error);
          onClose();
        }
      };
      fetchData();
    } else {
      setPaymentReport(null);
      setShiftDetails(null);
      setExpenditures(null);
      setWithOutDiscount(false);
      setWithDiscountCart(false);
      setWithDiscountPerItem(false);
      setDiscountType(0);
    }
  }, [
    show,
    apiBaseUrl,
    userTokenData,
    startDate,
    endDate,
    shiftNumber,
    onClose,
  ]);

  const handleDiscountType = (
    withOutDiscountCheck,
    cartDiscountCheck,
    perItemDiscountCheck
  ) => {
    let discountTypeShow = 0;
    if (
      (withOutDiscountCheck === false &&
        cartDiscountCheck === false &&
        perItemDiscountCheck === false) ||
      (withOutDiscountCheck === true &&
        cartDiscountCheck === true &&
        perItemDiscountCheck === true)
    ) {
      discountTypeShow = 0;
    } else if (
      withOutDiscountCheck === true &&
      cartDiscountCheck === false &&
      perItemDiscountCheck === false
    ) {
      discountTypeShow = 1;
    } else if (
      withOutDiscountCheck === false &&
      cartDiscountCheck === true &&
      perItemDiscountCheck === false
    ) {
      discountTypeShow = 2;
    } else if (
      withOutDiscountCheck === false &&
      cartDiscountCheck === false &&
      perItemDiscountCheck === true
    ) {
      discountTypeShow = 3;
    } else if (
      withOutDiscountCheck === true &&
      cartDiscountCheck === true &&
      perItemDiscountCheck === false
    ) {
      discountTypeShow = 4;
    } else if (
      withOutDiscountCheck === true &&
      cartDiscountCheck === false &&
      perItemDiscountCheck === true
    ) {
      discountTypeShow = 5;
    } else if (
      withOutDiscountCheck === false &&
      cartDiscountCheck === true &&
      perItemDiscountCheck === true
    ) {
      discountTypeShow = 6;
    }
    setDiscountType(discountTypeShow);
  };

  const openReportPaymentDetail = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowDetailPaymentModal(true);
  };

  return (
    <>
      {paymentReport && (
        <>
          <div
            className={`modal fade text-left ${show ? "show" : ""}`}
            id="inlineForm"
            role="dialog"
            aria-labelledby="myModalLabel33"
            aria-modal={show ? "true" : undefined}
            aria-hidden={show ? undefined : "true"}
            style={{
              display: show ? "block" : "none",
              ...(showDetailPaymentModal ? { zIndex: "1039" } : {}),
            }}
          >
            <div
              class="modal-report modal-dialog modal-dialog-centered modal-dialog-scrollable"
              role="document"
            >
              <div class="modal-content">
                <div class="modal-header">
                  <h4 class="modal-title" id="myModalLabel33">
                    "Laporan Kasir"
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
                    <div ref={componentRef}>
                      <br></br>
                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Laporan Kasir
                      </h4>
                      <h5 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Shift : {selectedShift}
                      </h5>
                      <h5 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        {startDateShift === endDateShift
                          ? `"${startDateShift}"`
                          : `"${startDateShift}" -- s/d -- "${endDateShift}"`}
                      </h5>
                      <hr></hr>
                      {shiftDetails && (
                        <>
                          <h5
                            style={{ textAlign: "center", marginBottom: "3vh" }}
                          >
                            Rincian Shift
                          </h5>
                          <table className="table table-striped text-center">
                            <thead>
                              <th>Casher Name</th>
                              <th>Actual Ending Cash</th>
                              <th>Cash Difference</th>
                              <th>Expected Ending Cash</th>
                              <th>Total Discount</th>
                              <th>Total Amount Shift</th>
                              <th>Total Expense</th>
                            </thead>
                            <tbody>
                              <td>{shiftDetails.casher_name || "-"}</td>
                              <td>{shiftDetails.actual_ending_cash || "-"}</td>
                              <td>{shiftDetails.cash_difference || "-"}</td>
                              <td>
                                {shiftDetails.expected_ending_cash || "-"}
                              </td>
                              <td>{shiftDetails.total_discount || "-"}</td>
                              <td>{shiftDetails.total_amount || "-"}</td>
                              <td>
                                {expenditures && expenditures.totalExpense
                                  ? expenditures.totalExpense
                                  : "-"}
                              </td>
                            </tbody>
                          </table>
                          {expenditures && (
                            <>
                              <br></br>
                              <hr></hr>
                              <h5 style={{ textAlign: "center" }}>
                                Rincian Expenditures
                              </h5>
                              <table className="table table-striped">
                                <thead>
                                  <tr>
                                    <th>Description</th>
                                    <th>Nominal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expenditures.lists.map((expense, index) => (
                                    <tr key={index}>
                                      <td>{expense.description || "-"}</td>
                                      <td>{expense.nominal || "-"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </>
                          )}
                          <br></br>
                          <hr></hr>
                        </>
                      )}
                      <h5 style={{ textAlign: "center" }}>Rincian Laporan</h5>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Jenis Laporan</th>
                            <th>Total Laporan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(paymentReport.payment_reports).map(
                            ([jenisLaporan, totalLaporan], index) => (
                              <tr key={index}>
                                <td>{toPascalCaseWithSpaces(jenisLaporan)}</td>
                                <td>{totalLaporan}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>

                      <br></br>
                      <hr></hr>

                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Pemasukan
                      </h4>
                      
                      <div className="table-responsive">
                        <table className="table table-striped text-center">
                          <thead>
                            <tr>
                              <th>Menu Type</th>
                              <th>Menu Name</th>
                              <th>Varian</th>
                              <th>Total Sold Quantity</th>
                              <th>Total Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedCartDetails.map((item, index) => (
                              <tr key={index}>
                                <td>{item.menu_type}</td>
                                <td>{item.menu_name}</td>
                                <td>{item.varian || "-"}</td>
                                <td>{item.total_quantity}</td>
                                <td>{item.total_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <br></br>
                      <hr></hr>

                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Semua Transaksi
                      </h4>
                      <div className="d-flex justify-content-center gap-5">
                        <div class="form-check">
                          <div class="checkbox">
                            <input
                              type="checkbox"
                              class="form-check-input"
                              checked={withOutDiscount}
                              onChange={() => {
                                setWithOutDiscount(!withOutDiscount);
                                handleDiscountType(!withOutDiscount, withDiscountCart, withDiscountPerItem);
                              }}
                            />
                            <label for="checkbox2">Tanpa Diskon </label>
                          </div>
                        </div>
                        <div class="form-check">
                          <div class="checkbox">
                            <input
                              type="checkbox"
                              class="form-check-input"
                              checked={withDiscountCart}
                              onChange={() => {
                                setWithDiscountCart(!withDiscountCart);
                                handleDiscountType(withOutDiscount, !withDiscountCart, withDiscountPerItem);
                              }}
                            />
                            <label for="checkbox2">Diskon Keranjang</label>
                          </div>
                        </div>
                        <div class="form-check">
                          <div class="checkbox">
                            <input
                              type="checkbox"
                              class="form-check-input"
                              checked={withDiscountPerItem}
                              onChange={() => {
                                setWithDiscountPerItem(!withDiscountPerItem);
                                handleDiscountType(withOutDiscount, withDiscountCart, !withDiscountPerItem);
                              }}
                            />
                            <label for="checkbox2">Diskon Per-Item</label>
                          </div>
                        </div>
                      </div>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Invoice Number</th>
                            <th>Payment Type</th>
                            <th>Time to Make Payment</th>
                            <th>Discount Code</th>
                            <th>Discount Type</th>
                            {/* <th>Discount Type</th>
                            <th>Max Discount Value</th>
                            <th>Discount Value</th> */}
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th>Total Refund</th>
                            <th>Last Time For Refund</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentReport.transactions
                          .filter(transaction => {
                            if (discountType === 0) {
                              return true;
                            } else if (discountType === 1) {
                              return transaction.discount_type === 0;
                            } else if (discountType === 2) {
                              return transaction.discount_type === 1;
                            } else if (discountType === 3) {
                              return transaction.discount_type === 2;
                            } else if (discountType === 4) {
                              return transaction.discount_type === 0 || transaction.discount_type === 1;
                            } else if (discountType === 5) {
                              return transaction.discount_type === 0 || transaction.discount_type === 2;
                            } else if (discountType === 6) {
                              return transaction.discount_type === 1 || transaction.discount_type === 2;
                            } else {
                              return false;
                            }
                          })
                          .map(
                            (transaction, index) => (
                              <tr key={index}>
                                <td>{transaction.invoice_number || "-"}</td>
                                <td>{transaction.payment_type || "-"}</td>
                                <td>{transaction.invoice_due_date || "-"}</td>
                                <td>
                                  {transaction.transaction_discount_code || "-"}
                                </td>
                                <td>
                                  {transaction.discount_type === 1
                                    ? "Discount Cart"
                                    : transaction.discount_type === 2
                                    ? "Discount Per-Item"
                                    : "-"}
                                </td>
                                {/* <td>
                                  {transaction.discounts_is_percent === 0
                                    ? "Potongan"
                                    : transaction.discounts_is_percent === 1
                                    ? "Persenan"
                                    : "-"}
                                </td>
                                <td>{transaction.max_discount || "-"}</td>
                                <td>{transaction.discounts_value || "-"}</td> */}
                                <td>{transaction.subtotal || "-"}</td>
                                <td>{transaction.total || "-"}</td>
                                <td>{transaction.total_refund || "-"}</td>
                                <td>{transaction.refund_updated_at || "-"}</td>
                                <td>
                                  <div className="action-buttons">
                                    <div
                                      className="buttons btn info btn-primary"
                                      onClick={() => openReportPaymentDetail(transaction.transaction_id)}
                                    >
                                      <i className="bi bi-eye"></i>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>

                      <br></br>
                      <hr></hr>

                      <h5 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Detail Pemasukan
                      </h5>

                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Menu Type</th>
                            <th>Menu Name</th>
                            <th>Varian</th>
                            <th>Serving Type</th>
                            <th>Note Item</th>
                            <th>Quantity</th>
                            <th>Menu Price</th>
                            <th>Discount Code</th>
                            <th>Discounts Value</th>
                            <th>Discounts Type</th>
                            <th>Discounted Price</th>
                            <th>Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentReport.cart_details.map(
                            (cartDetail, index) => (
                              <tr key={index}>
                                <td>{cartDetail.menu_type || "-"}</td>
                                <td>{cartDetail.menu_name || "-"}</td>
                                <td>{cartDetail.varian || "-"}</td>
                                <td>{cartDetail.serving_type_name || "-"}</td>
                                <td>{cartDetail.note_item || "-"}</td>
                                <td>{cartDetail.qty || "-"}</td>
                                <td>{cartDetail.price || "-"}</td>
                                <td>{cartDetail.discount_code || "-"}</td>
                                <td>{cartDetail.discounts_value || "-"}</td>
                                <td>
                                  {cartDetail.discounts_is_percent === 0
                                    ? "Potongan"
                                    : cartDetail.discounts_is_percent === 1
                                    ? "Persen"
                                    : "-"}
                                </td>
                                <td>{cartDetail.discounted_price || "-"}</td>
                                <td>{cartDetail.total_price || "-"}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>

                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Pengeluaran
                      </h4>
                      {paymentReport.refund && paymentReport.refund[0] ? (
                        <>
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Menu Type</th>
                                <th>Menu Name</th>
                                <th>Varian</th>
                                <th>Serving Type</th>
                                <th>Note Item</th>
                                <th>Quantity Refund Item</th>
                                <th>Menu Price</th>
                                <th>Discount Code</th>
                                <th>Discounts Value</th>
                                <th>Discounts Type</th>
                                <th>Discounted Price</th>
                                <th>Refund Reason Item</th>
                                <th>Payment Type Refund</th>
                                <th>Total Refund Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentReport.refund[0].map((refund, index) => (
                                <tr key={index}>
                                  <td>{refund.menu_type || "-"}</td>
                                  <td>{refund.menu_name || "-"}</td>
                                  <td>{refund.varian || "-"}</td>
                                  <td>{refund.serving_type_name || "-"}</td>
                                  <td>{refund.note_item || "-"}</td>
                                  <td>{refund.qty_refund_item || "-"}</td>
                                  <td>{refund.menu_price || "-"}</td>
                                  <td>{refund.discount_code || "-"}</td>
                                  <td>{refund.discounts_value || "-"}</td>
                                  <td>
                                    {refund.discounts_is_percent === 0
                                      ? "Potongan"
                                      : refund.discounts_is_percent === 1
                                      ? "Persen"
                                      : "-"}
                                  </td>
                                  <td>{refund.discounted_price || "-"}</td>
                                  <td>{refund.refund_reason_item || "-"}</td>
                                  <td>{refund.payment_type_name || "-"}</td>
                                  <td>{refund.total_refund_price || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      ) : (
                        <h6 style={{ textAlign: "center" }}>Data Kosong</h6>
                      )}
                    </div>
                    <hr></hr>
                    <div className="login-button">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handlePrintPDF}
                      >
                        Print PDF
                      </button>
                    </div>
                  </div>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={show && `modal-backdrop fade show`}></div>
          <ReportDetailModal
            show={showDetailPaymentModal}
            onClose={() => setShowDetailPaymentModal(false)}
            selectedTransactionId={selectedTransactionId}
          />
        </>
      )}
    </>
  );
};
