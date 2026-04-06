import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { ReportDetailModal } from "./ReportDetailModal";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx'; 

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
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showShiftDetails, setShowShiftDetails] = useState(true);
  const [showExpenditures, setShowExpenditures] = useState(false);
  const [showPaymentReports, setShowPaymentReports] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showDetailIncome, setShowDetailIncome] = useState(false);
  const [showRefunds, setShowRefunds] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadSections, setDownloadSections] = useState({
    shift: true,
    expenditure: true,
    laporan: true,
    pemasukan: true,
    transaksi: true,
    detailPemasukan: true,
    pengeluaranRefunded: true,
  });
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (showDetailPaymentModal) {
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
  }, [showDetailPaymentModal]);

  function toPascalCaseWithSpaces(text) {
    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function formatRupiah(value) {
    const number = Number(value);
    if (isNaN(number)) {
      return value; // Kembalikan original jika tidak bisa diparsing ke angka
    }
    return number.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  useEffect(() => {
    if (!show || !startDate || !endDate) return;

    // Jika sedang fetching, hentikan
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setProgress(0);
    setLoading(true);

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 150);

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
          setShiftDetails(paymentReportData.shift_details);
          setExpenditures(paymentReportData.expenditures);
          setStartDateShift(paymentReportData.start_date);
          setEndDateShift(paymentReportData.end_date);
        }

        setProgress(100);
      } catch (error) {
        if (error.response?.data?.code === 404) {
          Swal.fire({
            icon: "error",
            title: "Data Tidak ditemukan!",
            text: error.response.data.message,
          });
        }
        console.error("Error fetching payment report:", error);
        onClose();
      } finally {
        clearInterval(interval);
        setLoading(false);
        isFetchingRef.current = false; // reset guard
      }
    };

    fetchData();
  }, [show, startDate, endDate, shiftNumber]);


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
      if (item.menu_varian_id == null) {
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

  // useEffect(() => {
  //   if (show && startDate && endDate) {
  //     const fetchData = async () => {
  //       try {
  //         const response = await axios.get(`${apiBaseUrl}/payment-report`, {
  //           params: {
  //             outlet_id: userTokenData.outlet_id,
  //             start_date: startDate,
  //             end_date: endDate,
  //             is_shift: shiftNumber,
  //           },
  //         });
  //         const paymentReportData = response.data.data;
  //         setPaymentReport(paymentReportData);
  //         if (paymentReportData) {
  //           setStartDateShift(paymentReportData.start_date);
  //           setEndDateShift(paymentReportData.end_date);
  //         }
  //         if (paymentReportData.shift_details) {
  //           setShiftDetails(paymentReportData.shift_details);
  //         }
  //         if (paymentReportData.expenditures) {
  //           setExpenditures(paymentReportData.expenditures);
  //         }
  //       } catch (error) {
  //         if (error.response.data.code === 404) {
  //           Swal.fire({
  //             icon: "error",
  //             title: "Data Tidak ditemukan!",
  //             text: error.response.data.message,
  //           });
  //         }
  //         console.error("Error fetching payment report:", error);
  //         onClose();
  //       }
  //     };
  //     fetchData();
  //   } else {
  //     setPaymentReport(null);
  //     setShiftDetails(null);
  //     setExpenditures(null);
  //     setWithOutDiscount(false);
  //     setWithDiscountCart(false);
  //     setWithDiscountPerItem(false);
  //     setDiscountType(0);
  //   }
  // }, [
  //   show,
  //   apiBaseUrl,
  //   userTokenData,
  //   startDate,
  //   endDate,
  //   shiftNumber,
  //   onClose,
  // ]);

  const handleExportPDF = () => {
    if (!paymentReport) return;
    
    const params = new URLSearchParams({
      outlet_id: userTokenData.outlet_id,
      start_date: startDate,
      end_date: endDate,
      is_shift: shiftNumber || 0,
      sections: JSON.stringify(downloadSections),
    });
    
    window.open(`${apiBaseUrl}/report/download-pdf?${params.toString()}`, '_blank');
  };

  const handleExportDOCX = () => {
    if (!paymentReport) return;
    
    const params = new URLSearchParams({
      outlet_id: userTokenData.outlet_id,
      start_date: startDate,
      end_date: endDate,
      is_shift: shiftNumber || 0,
      sections: JSON.stringify(downloadSections),
    });
    
    window.open(`${apiBaseUrl}/report/download-docx?${params.toString()}`, '_blank');
  };

  const handleExportExcel = () => {
    if (!paymentReport) return;
    
    const params = new URLSearchParams({
      outlet_id: userTokenData.outlet_id,
      start_date: startDate,
      end_date: endDate,
      is_shift: shiftNumber || 0,
      sections: JSON.stringify(downloadSections),
    });
    
    window.open(`${apiBaseUrl}/report/download-excel?${params.toString()}`, '_blank');
  };

  const handlePrintThermal = () => {
    if (!paymentReport) return;
    
    const params = new URLSearchParams({
      outlet_id: userTokenData.outlet_id,
      start_date: startDate,
      end_date: endDate,
      is_shift: shiftNumber || 0,
      sections: JSON.stringify(downloadSections),
    });
    
    const thermalWindow = window.open(`${apiBaseUrl}/report/print-thermal?${params.toString()}`, 'thermal', 'width=400,height=600');
    setTimeout(() => {
      thermalWindow.print();
    }, 1000);
  };

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
      {/* Show loading progress even if paymentReport is null initially */}
      {loading && (
        <div className="loading-container text-center">
          <div className="progress" style={{ height: '30px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {progress}%
            </div>
          </div>
        </div>
      )}
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
              className="modal-report modal-dialog modal-dialog-centered modal-dialog-scrollable"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header d-flex justify-content-between align-items-center">
                  <h4 className="modal-title" id="myModalLabel33">
                    "Laporan Kasir"
                  </h4>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowDownloadModal(true)}
                      title="Download Data"
                    >
                      📥 Download Data
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={onClose}
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
                <div>
                  <div className="modal-body scrollable-content">
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
                            style={{ cursor: "pointer", textAlign: "center" }}
                            onClick={() => setShowShiftDetails(!showShiftDetails)}
                          >
                            {showShiftDetails ? "▼" : "►"} Rincian Shift
                          </h5>
                          {showShiftDetails && (
                            <table className="table table-striped text-center">
                              <thead>
                                <tr>
                                  <th>Casher Name</th>
                                  <th>Total Discount</th>
                                  <th>Total Amount Shift</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>{shiftDetails.casher_name || "-"}</td>
                                  <td>{formatRupiah(shiftDetails.total_discount) || "-"}</td>
                                  <td>{formatRupiah(shiftDetails.total_amount) || "-"}</td>
                                </tr>
                              </tbody>
                            </table>
                          )}
                          {expenditures && (
                            <>
                              <br></br>
                              <hr></hr>
                              <h5
                                style={{ cursor: "pointer", textAlign: "center" }}
                                onClick={() => setShowExpenditures(!showExpenditures)}
                              >
                                {showExpenditures ? "▼" : "►"} Rincian Expenditure / Pengeluaran
                              </h5>
                              {showExpenditures && (
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
                                        <td>{formatRupiah(expense.nominal) || "-"}</td>
                                      </tr>
                                    ))}
                                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                      <td>Total</td>
                                      <td>{formatRupiah(expenditures.totalExpense)}</td>
                                    </tr>
                                  </tbody>
                                </table>)}
                            </>
                          )}
                          <br></br>
                          <hr></hr>
                        </>
                      )}
                      <h5
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => setShowPaymentReports(!showPaymentReports)}
                      >
                        {showPaymentReports ? "▼" : "►"} Rincian Laporan
                      </h5>
                      {showPaymentReports && (
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
                                  <td>{formatRupiah(totalLaporan)}</td>
                                </tr>
                              )
                            )}
                          </tbody>

                        </table>)}

                      <br></br>
                      <hr></hr>
                      <h5
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => setShowDetailIncome(!showDetailIncome)}
                      >
                        {showDetailIncome ? "▼" : "►"} Rincian Pemasukan
                      </h5>
                      {showDetailIncome && (

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
                                  <td>{formatRupiah(item.total_price)}</td>
                                </tr>
                              ))}
                              <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                <td colSpan="4">Total</td>
                                <td>{formatRupiah(groupedCartDetails.reduce((sum, item) => sum + (item.total_price || 0), 0))}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>)}

                      <br></br>
                      <hr></hr>

                      <h5
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => setShowTransactions(!showTransactions)}
                      >
                        {showTransactions ? "▼" : "►"} Semua Transaksi
                      </h5>

                      {showTransactions && (
                        <div>
                          <div className="d-flex justify-content-center gap-5">
                            <div className="form-check">
                              <div className="checkbox">
                                <input
                                  id="withoutDiscount"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={withOutDiscount}
                                  onChange={() => {
                                    setWithOutDiscount(!withOutDiscount);
                                    handleDiscountType(!withOutDiscount, withDiscountCart, withDiscountPerItem);
                                  }}
                                />
                                <label htmlFor="withoutDiscount">Tanpa Diskon</label>
                              </div>
                            </div>
                            <div className="form-check">
                              <div className="checkbox">
                                <input
                                  id="discountCart"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={withDiscountCart}
                                  onChange={() => {
                                    setWithDiscountCart(!withDiscountCart);
                                    handleDiscountType(withOutDiscount, !withDiscountCart, withDiscountPerItem);
                                  }}
                                />
                                <label htmlFor="discountCart">Diskon Keranjang</label>
                              </div>
                            </div>
                            <div className="form-check">
                              <div className="checkbox">
                                <input
                                  id="discountPerItem"
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={withDiscountPerItem}
                                  onChange={() => {
                                    setWithDiscountPerItem(!withDiscountPerItem);
                                    handleDiscountType(withOutDiscount, withDiscountCart, !withDiscountPerItem);
                                  }}
                                />
                                <label htmlFor="discountPerItem">Diskon Per-Item</label>
                              </div>
                            </div>
                          </div>

                          {paymentReport.transactions.length > 0 ? (
                            <table className="table table-striped">
                              <thead>
                                <tr>
                                  <th>Nomor Invoice</th>
                                  <th>Tipe Pembayaran</th>
                                  <th>Waktu Pembayaran</th>
                                  <th>Kode Diskon</th>
                                  <th>Tipe Diskon</th>
                                  <th>Subtotal</th>
                                  <th>Total</th>
                                  <th>Total Refund</th>
                                  <th>Terakhir Refund</th>
                                  <th>Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paymentReport.transactions
                                  .filter(transaction => {
                                    // Sederhanakan logika filter
                                    switch (discountType) {
                                      case 0: return true; // Semua transaksi
                                      case 1: return transaction.discount_type === 0; // Tanpa diskon
                                      case 2: return transaction.discount_type === 1; // Diskon Keranjang
                                      case 3: return transaction.discount_type === 2; // Diskon Per-Item
                                      case 4: return [0, 1].includes(transaction.discount_type); // Tanpa Diskon atau Diskon Keranjang
                                      case 5: return [0, 2].includes(transaction.discount_type); // Tanpa Diskon atau Diskon Per-Item
                                      case 6: return [1, 2].includes(transaction.discount_type); // Diskon Keranjang atau Diskon Per-Item
                                      default: return false;
                                    }
                                  })
                                  .map((transaction, index) => (
                                    <tr key={index}>
                                      <td>{transaction.invoice_number || "-"}</td>
                                      <td>{transaction.payment_type || "-"}</td>
                                      <td>{transaction.invoice_due_date || "-"}</td>
                                      <td>{transaction.transaction_discount_code || "-"}</td>
                                      <td>
                                        {transaction.discount_type === 1
                                          ? "Diskon Keranjang"
                                          : transaction.discount_type === 2
                                            ? "Diskon Per-Item"
                                            : "-"}
                                      </td>
                                      <td>{formatRupiah(transaction.subtotal) || "-"}</td>
                                      <td>{formatRupiah(transaction.total) || "-"}</td>
                                      <td>{formatRupiah(transaction.total_refund) || "-"}</td>
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
                                  ))}
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                  <td colSpan="5">Total</td>
                                  <td>{formatRupiah(paymentReport.transactions.reduce((sum, t) => sum + (t.subtotal || 0), 0))}</td>
                                  <td>{formatRupiah(paymentReport.transactions.reduce((sum, t) => sum + (t.total || 0), 0))}</td>
                                  <td>{formatRupiah(paymentReport.transactions.reduce((sum, t) => sum + (t.total_refund || 0), 0))}</td>
                                  <td colSpan="2"></td>
                                </tr>
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-center text-muted">Tidak ada transaksi</p>
                          )}
                        </div>
                      )}

                      <br></br>
                      <hr></hr>

                      <h5
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => setShowDetailIncome(!showDetailIncome)}
                      >
                        {showDetailIncome ? "▼" : "►"} Detail Pemasukan
                      </h5>
                      {showDetailIncome && (

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
                                  <td>{formatRupiah(cartDetail.price) || "-"}</td>
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
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                              <td colSpan="11">Total</td>
                              <td>{formatRupiah(paymentReport.cart_details.reduce((sum, item) => sum + (item.total_price || 0), 0))}</td>
                            </tr>
                          </tbody>
                        </table>)}
                      <br></br>
                      <hr></hr>
                      <h5
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => setShowRefunds(!showRefunds)}
                      >
                        {showRefunds ? "▼" : "►"} Pengeluaran / Refunded
                      </h5>
                      {showRefunds && (
                        paymentReport.refund && paymentReport.refund[0] ? (
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
                              <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                <td colSpan="13">Total</td>
                                <td>{formatRupiah(paymentReport.refund[0].reduce((sum, r) => sum + (r.total_refund_price || 0), 0))}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <h6 style={{ textAlign: "center" }}>Data Kosong</h6>
                        )
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={show ? "modal-backdrop fade show" : undefined}></div>

          {/* Download Data Modal */}
          <div
            className={`modal fade text-left ${showDownloadModal ? "show" : ""}`}
            id="downloadDataModal"
            role="dialog"
            aria-labelledby="downloadModalLabel"
            aria-modal={showDownloadModal ? "true" : undefined}
            aria-hidden={showDownloadModal ? undefined : "true"}
            style={{
              display: showDownloadModal ? "block" : "none",
              zIndex: "1050",
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="downloadModalLabel">
                    📥 Download Data
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowDownloadModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Shift Info */}
                  <div className="mb-3 p-2 border rounded bg-light">
                    <small className="text-muted d-block mb-2">
                      <strong>Shift :</strong> {selectedShift}
                    </small>
                    <small className="text-muted d-block">
                      {startDateShift === endDateShift
                        ? `"${startDateShift}"`
                        : `"${startDateShift}" -- s/d -- "${endDateShift}"`}
                    </small>
                  </div>

                  {/* Section Checkboxes */}
                  <div className="mb-3 p-2 border rounded bg-light">
                    <small className="text-muted d-block mb-2">
                      <i className="bi bi-check2-square me-1"></i>
                      Pilih bagian yang akan diikutsertakan:
                    </small>
                    <div className="row">
                      <div className="col-12 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="chkShift"
                            checked={true}
                            disabled
                          />
                          <label className="form-check-label small text-muted" htmlFor="chkShift">
                            ► Rincian Shift (Default ON tidak bisa di off)
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="chkLaporan"
                            checked={true}
                            disabled
                          />
                          <label className="form-check-label small text-muted" htmlFor="chkLaporan">
                            ► Rincian Laporan (Default ON tidak bisa di off)
                          </label>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="chkExpenditure"
                            checked={downloadSections.expenditure}
                            onChange={(e) =>
                              setDownloadSections((prev) => ({
                                ...prev,
                                expenditure: e.target.checked,
                              }))
                            }
                          />
                          <label className="form-check-label small" htmlFor="chkExpenditure">
                            ► Rincian Expenditure / Pengeluaran
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="chkPemasukan"
                            checked={downloadSections.pemasukan}
                            onChange={(e) =>
                              setDownloadSections((prev) => ({
                                ...prev,
                                pemasukan: e.target.checked,
                              }))
                            }
                          />
                          <label className="form-check-label small" htmlFor="chkPemasukan">
                            ► Rincian Pemasukan
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="chkTransaksi"
                            checked={downloadSections.transaksi}
                            onChange={(e) =>
                              setDownloadSections((prev) => ({
                                ...prev,
                                transaksi: e.target.checked,
                              }))
                            }
                          />
                          <label className="form-check-label small" htmlFor="chkTransaksi">
                            ► Semua Transaksi
                          </label>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="chkDetailPemasukan"
                            checked={downloadSections.detailPemasukan}
                            onChange={(e) =>
                              setDownloadSections((prev) => ({
                                ...prev,
                                detailPemasukan: e.target.checked,
                              }))
                            }
                          />
                          <label className="form-check-label small" htmlFor="chkDetailPemasukan">
                            ► Detail Pemasukan
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="chkPengeluaranRefunded"
                            checked={downloadSections.pengeluaranRefunded}
                            onChange={(e) =>
                              setDownloadSections((prev) => ({
                                ...prev,
                                pengeluaranRefunded: e.target.checked,
                              }))
                            }
                          />
                          <label className="form-check-label small" htmlFor="chkPengeluaranRefunded">
                            ► Pengeluaran / Refunded
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Format Buttons */}
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => {
                          handleExportPDF();
                          setShowDownloadModal(false);
                        }}
                      >
                        <i className="bi bi-file-pdf me-1"></i> PDF
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        className="btn btn-info w-100"
                        onClick={() => {
                          handleExportDOCX();
                          setShowDownloadModal(false);
                        }}
                      >
                        <i className="bi bi-file-word me-1"></i> DOCX
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        className="btn btn-warning w-100"
                        onClick={() => {
                          handlePrintThermal();
                          setShowDownloadModal(false);
                        }}
                      >
                        <i className="bi bi-receipt me-1"></i> Thermal
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={() => {
                          handleExportExcel();
                          setShowDownloadModal(false);
                        }}
                      >
                        <i className="bi bi-file-spreadsheet me-1"></i> Excel
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDownloadModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          {showDownloadModal && <div className="modal-backdrop fade show"></div>}

          <ReportDetailModal
            show={showDetailPaymentModal}
            onClose={() => setShowDetailPaymentModal(false)}
            selectedTransactionId={selectedTransactionId}
          />
        </>
      )
      }
    </>
  );
};
