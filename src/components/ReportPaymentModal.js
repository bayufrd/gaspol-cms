import React, { useState, useEffect } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";

export const ReportPaymentModal = ({
  show,
  onClose,
  userTokenData,
  startDate,
  endDate,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [paymentReport, setPaymentReport] = useState(null);
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

  useEffect(() => {
    if (show && startDate && endDate) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${apiBaseUrl}/payment-report`, {
            params: {
              outlet_id: userTokenData.outlet_id,
              start_date: startDate,
              end_date: endDate,
            },
          });
          const paymentReportData = response.data.data;
          setPaymentReport(paymentReportData);
        } catch (error) {
          console.error("Error fetching payment report:", error);
        }
      };
      fetchData();
    }
  }, [show, apiBaseUrl, userTokenData, startDate, endDate]);

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
                {paymentReport && (
                  <>
                    <div ref={componentRef}>
                      <br></br>
                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Laporan Kasir
                      </h4>
                      <h5 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        {startDate === endDate
                          ? `"${startDate}"`
                          : `"${startDate}" --- s/d --- "${endDate}"`}
                      </h5>
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
                        Semua Transaksi
                      </h4>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Invoice Number</th>
                            <th>Payment Type</th>
                            <th>Total Transaction</th>
                            <th>Total Refund</th>
                            <th>Last Time For Refund</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentReport.transactions.map(
                            (transaction, index) => (
                              <tr key={index}>
                                <td>{transaction.invoice_number || "-"}</td>
                                <td>{transaction.payment_type || "-"}</td>
                                <td>{transaction.total || "-"}</td>
                                <td>{transaction.total_refund || "-"}</td>
                                <td>{transaction.refund_updated_at || "-"}</td>
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
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Menu Name</th>
                            <th>Menu Type</th>
                            <th>Varian</th>
                            <th>Serving Type Name</th>
                            <th>Menu Price</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                            <th>Note Item</th>
                            <th>Discount Code</th>
                            <th>Discounts Value</th>
                            <th>Discounted Price</th>
                            <th>Discounts Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentReport.cart_details.map(
                            (cartDetail, index) => (
                              <tr key={index}>
                                <td>{cartDetail.menu_name || "-"}</td>
                                <td>{cartDetail.menu_type || "-"}</td>
                                <td>{cartDetail.varian || "-"}</td>
                                <td>{cartDetail.serving_type_name || "-"}</td>
                                <td>{cartDetail.price || "-"}</td>
                                <td>{cartDetail.qty || "-"}</td>
                                <td>{cartDetail.total_price || "-"}</td>
                                <td>{cartDetail.note_item || "-"}</td>
                                <td>{cartDetail.discount_code || "-"}</td>
                                <td>{cartDetail.discounts_value || "-"}</td>
                                <td>{cartDetail.discounted_price || "-"}</td>
                                <td>
                                  {cartDetail.discounts_is_percent
                                    ? cartDetail.discounts_is_percent === 1
                                      ? "Persen"
                                      : "Bukan Persen"
                                    : "-"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>

                      <br></br>
                      <hr></hr>

                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Pengeluaran
                      </h4>
                      {paymentReport.refund && paymentReport.refund[0] ? (
                        <>
                          <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Menu Name</th>
                            <th>Varian</th>
                            <th>Menu Price</th>
                            <th>Quantity Refund Item</th>
                            <th>Total Refund Price</th>
                            <th>Refund Reason Item</th>
                            <th>Serving Type Name</th>
                            <th>Note Item</th>
                            <th>Discount Code</th>
                            <th>Discounts Value</th>
                            <th>Discounted Price</th>
                            <th>Discounts Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentReport.refund[0].map((refund, index) => (
                            <tr key={index}>
                              <td>{refund.menu_name || "-"}</td>
                              <td>{refund.varian || "-"}</td>
                              <td>{refund.menu_price || "-"}</td>
                              <td>{refund.qty_refund_item || "-"}</td>
                              <td>{refund.total_refund_price || "-"}</td>
                              <td>{refund.refund_reason_item || "-"}</td>
                              <td>{refund.serving_type_name || "-"}</td>
                              <td>{refund.note_item || "-"}</td>
                              <td>{refund.discount_code || "-"}</td>
                              <td>{refund.discounts_value || "-"}</td>
                              <td>{refund.discounted_price || "-"}</td>
                              <td>
                                {refund.discounts_is_percent
                                  ? refund.discounts_is_percent === 1
                                    ? "Persen"
                                    : "Bukan Persen"
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                        </>
                      ) : <h6 style={{textAlign:"center"}}>Data Kosong</h6>}
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
                  </>
                )}
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
    </>
  );
};
