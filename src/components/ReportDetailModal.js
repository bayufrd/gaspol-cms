import React, { useState, useEffect } from "react";
import axios from "axios";

export const ReportDetailModal = ({ show, onClose, selectedTransactionId }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if (show && selectedTransactionId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/transaction/${selectedTransactionId}`
          );
          const transactionsData = response.data.data;
          setTransaction(transactionsData);
        } catch (error) {
          console.error("Error fetching transaction:", error);
        }
      };
      fetchData();
    }
  }, [show, selectedTransactionId, apiBaseUrl]);

  const showRefundDetails =
    transaction?.refund_details && transaction.refund_details.length > 0;
  const showRefund =
    transaction?.total_refund !== 0 && transaction?.total_refund !== undefined;

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
                "Detail Laporan"
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
                {transaction && (
                  <>
                    <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                      Transaction
                    </h4>
                    <div className="report-container">
                      <div className="section-report">
                        <div className="section-report-title">
                          Invoice Number:
                        </div>
                        <div className="section-report-data">
                          {transaction.invoice_number}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Invoice Due Date:
                        </div>
                        <div className="section-report-data">
                          {transaction.invoice_due_date}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Customer Name:
                        </div>
                        <div className="section-report-data">
                          {transaction.customer_name}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Customer Seat:
                        </div>
                        <div className="section-report-data">
                          {transaction.customer_seat}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Payment Type:
                        </div>
                        <div className="section-report-data">
                          {transaction.payment_type}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Delivery Type:
                        </div>
                        <div className="section-report-data">
                          {transaction.delivery_type || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Delivery Note:
                        </div>
                        <div className="section-report-data">
                          {transaction.delivery_note || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Discount Code:
                        </div>
                        <div className="section-report-data">
                          {transaction.discount_code || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Discount Type:
                        </div>
                        <div className="section-report-data">
                          {transaction.discounts_is_percent === 0
                            ? "Potongan"
                            : transaction.discounts_is_percent === 1
                            ? "Persenan"
                            : "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Discount Value:
                        </div>
                        <div className="section-report-data">
                          {transaction.discounts_value || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">Subtotal:</div>
                        <div className="section-report-data">
                          {transaction.subtotal || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">Total:</div>
                        <div className="section-report-data">
                          {transaction.total || "-"}
                        </div>
                      </div>
                    </div>
                    <hr></hr>
                    <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                      Cart
                    </h4>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Menu Name</th>
                          <th>Menu Type</th>
                          <th>Menu Varian</th>
                          <th>Menu Price</th>
                          <th>Serving Type</th>
                          <th>Discount Code</th>
                          <th>Discount Value</th>
                          <th>Discount Type</th>
                          <th>Discounted Price</th>
                          <th>Qty</th>
                          <th>Note Item</th>
                          <th>Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transaction.cart_details.map((item, index) => (
                          <tr key={index}>
                            <td>{item.menu_name}</td>
                            <td>{item.menu_type}</td>
                            <td>{item.varian || "-"}</td>
                            <td>{item.price}</td>
                            <td>{item.serving_type_name}</td>
                            <td>{item.discount_code || "-"}</td>
                            <td>{item.discounts_value || "-"}</td>
                            <td>
                              {item.discounts_is_percent === 0
                                ? "Potongan"
                                : item.discounts_is_percent === 1
                                ? "Persenan"
                                : "-"}
                            </td>
                            <td>{item.discounted_price || "-"}</td>
                            <td>{item.qty}</td>
                            <td>{item.note_item || "-"}</td>
                            <td>{item.total_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {showRefund && (
                      <>
                        <hr></hr>
                        <h4
                          style={{ textAlign: "center", marginBottom: "3vh" }}
                        >
                          Refund
                        </h4>
                        <div className="report-container">
                          <div className="section-report">
                            <div className="section-report-title">
                              Is Refund All:
                            </div>
                            <div className="section-report-data">
                              {transaction.is_refund_all ? "Yes" : "No"}
                            </div>
                          </div>
                          <div className="section-report">
                            <div className="section-report-title">
                              Refund Reason:
                            </div>
                            <div className="section-report-data">
                              {transaction.refund_reason || "-"}
                            </div>
                          </div>
                          <div className="section-report">
                            <div className="section-report-title">
                              Total Refund:
                            </div>
                            <div className="section-report-data">
                              {transaction.total_refund}
                            </div>
                          </div>
                        </div>
                        <hr></hr>
                      </>
                    )}
                    {showRefundDetails && (
                      <>
                        <h4
                          style={{ textAlign: "center", marginBottom: "3vh" }}
                        >
                          Refund Detail
                        </h4>
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Menu Name</th>
                              <th>Menu Varian</th>
                              <th>Menu Price</th>
                              <th>Serving Type</th>
                              <th>Discount Code</th>
                              <th>Discount Value</th>
                              <th>Discount Type</th>
                              <th>Qty Refund Item</th>
                              <th>Refund Reason Item</th>
                              <th>Total Refund Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transaction.refund_details.map((item, index) => (
                              <tr key={index}>
                                <td>{item.menu_name}</td>
                                <td>{item.varian || "-"}</td>
                                <td>{item.menu_price}</td>
                                <td>{item.serving_type_name}</td>
                                <td>{item.discount_code || "-"}</td>
                                <td>{item.discounts_value || "-"}</td>
                                <td>
                                  {item.discounts_is_percent
                                    ? item.discounts_is_percent === 1
                                      ? "Persen"
                                      : "Bukan Persen"
                                    : "-"}
                                </td>
                                <td>{item.qty_refund_item}</td>
                                <td>{item.refund_reason_item || "-"}</td>
                                <td>{item.total_refund_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
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
