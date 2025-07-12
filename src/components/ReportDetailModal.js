import React, { useState, useEffect } from "react";
import axios from "axios";

export const ReportDetailModal = ({ show, onClose, selectedTransactionId }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [transaction, setTransaction] = useState(null);
  const [showRefund, setShowRefund] = useState(false);

  useEffect(() => {
    if (show && selectedTransactionId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/transaction/${selectedTransactionId}`, {
            params: {
              is_report: true,
            },
          }
          );
          const transactionsData = response.data.data;
          setTransaction(transactionsData);
          if (transactionsData.total_refund > 0) {
            setShowRefund(true);
          }
        } catch (error) {
          console.error("Error fetching transaction:", error);
        }
      };
      fetchData();
    } else {
      setShowRefund(false);
    }
  }, [show, selectedTransactionId, apiBaseUrl]);

  const showRefundDetails =
    transaction?.refund_details && transaction.refund_details.length > 0;

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
                    <h5 style={{ textAlign: "center", marginBottom: "3vh", color: transaction.status === 'Paid' ? '#198754' : transaction.status === 'Pending' ? '#6f42c1' : transaction.status === 'Canceled' ? '#dc3545' : transaction.status === 'Refunded' ? '#fd7e14' : '#000000' }}>
                      "{transaction.status}"
                    </h5>
                    <div className="report-container">
                      <div className="section-report">
                        <div className="section-report-title">
                          Invoice Number:
                        </div>
                        <div className="section-report-data">
                          {transaction.invoice_number || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Transaction Updated At:
                        </div>
                        <div className="section-report-data">
                          {transaction.transaction_date_show}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Transaction Reference:
                        </div>
                        <div className="section-report-data">
                          {transaction.transaction_ref || '-'}
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
                          {transaction.payment_type || "-"}
                        </div>
                      </div>
                      {/* <div className="section-report">
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
                      </div> */}
                      <div className="section-report">
                        <div className="section-report-title">
                          Discount Code Cart:
                        </div>
                        <div className="section-report-data">
                          {transaction.discount_code || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">
                          Discount Type Cart:
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
                          Discount Value Cart:
                        </div>
                        <div className="section-report-data">
                          {transaction.discounts_value ? transaction.discounts_value + (transaction.discounts_is_percent === 1 ? " %" : "") : "-"}
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
                      {transaction.member_id !== null && (
                      <>
                        <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                          Membership
                        </h4>
                        <div className="section-report">
                        <div className="section-report-title">Name:</div>
                        <div className="section-report-data">
                          {transaction.member_name || "-"}
                        </div>
                      </div>
                      <div className="section-report">
                        <div className="section-report-title">Phone:</div>
                        <div className="section-report-data">
                          {transaction.member_phone_number || "-"}
                        </div>
                      </div>
                      </>
                    )}
                    </div>
                    

                    {transaction.cart_details.length > 0 && (
                      <>
                        <hr></hr>
                        <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                          Cart
                        </h4>
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Paid Time</th>
                              <th>Menu Type</th>
                              <th>Menu Name</th>
                              <th>Menu Varian</th>
                              <th>Serving Type</th>
                              <th>Note Item</th>
                              <th>Qty</th>
                              <th>Menu Price</th>
                              <th>Discount Code</th>
                              <th>Discount Value</th>
                              <th>Discount Type</th>
                              {/* <th>Discounted Price</th> */}
                              <th>Total Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transaction.cart_details.map((item, index) => (
                              <tr key={index}>
                                <td>{item.updated_at}</td>
                                <td>{item.menu_type}</td>
                                <td>{item.menu_name}</td>
                                <td>{item.varian || "-"}</td>
                                <td>{item.serving_type_name}</td>
                                <td>{item.note_item || "-"}</td>
                                <td>{item.qty}</td>
                                <td>{item.price}</td>
                                <td>{item.discount_code || "-"}</td>
                                <td>{item.discounts_value || "-"}</td>
                                <td>
                                  {item.discounts_is_percent === 0
                                    ? "Potongan"
                                    : item.discounts_is_percent === 1
                                      ? "Persenan"
                                      : "-"}
                                </td>
                                {/* <td>{item.discounted_price || "-"}</td> */}
                                <td>{item.total_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>


                    )}
                    {transaction.canceled_items.length > 0 && (
                      <>
                        <hr></hr>
                        <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                          Canceled Items
                        </h4>
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Cancel At</th>
                              <th>Cancel Reason</th>
                              <th>Menu Type</th>
                              <th>Menu Name</th>
                              <th>Menu Varian</th>
                              <th>Serving Type</th>
                              <th>Note Item</th>
                              <th>Qty</th>
                              <th>Menu Price</th>
                              <th>Discount Code</th>
                              <th>Discount Value</th>
                              <th>Discount Type</th>
                              {/* <th>Discounted Price</th> */}
                              <th>Total Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transaction.canceled_items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.updated_at}</td>
                                <td>{item.cancel_reason}</td>
                                <td>{item.menu_type}</td>
                                <td>{item.menu_name}</td>
                                <td>{item.varian || "-"}</td>
                                <td>{item.serving_type_name}</td>
                                <td>{item.note_item || "-"}</td>
                                <td>{item.qty}</td>
                                <td>{item.price}</td>
                                <td>{item.discount_code || "-"}</td>
                                <td>{item.discounts_value || "-"}</td>
                                <td>
                                  {item.discounts_is_percent === 0
                                    ? "Potongan"
                                    : item.discounts_is_percent === 1
                                      ? "Persenan"
                                      : "-"}
                                </td>
                                {/* <td>{item.discounted_price || "-"}</td> */}
                                <td>{item.total_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
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
                              Status:
                            </div>
                            <div className="section-report-data"
                              style={{ color: transaction.is_refund_all ? '#fd7e14' : 'initial' }}
                            >
                              {transaction.is_refund_all ? "Refunded" : "-"}
                            </div>
                          </div>
                          <div className="section-report">
                            <div className="section-report-title">
                              Refund All Reason:
                            </div>
                            <div className="section-report-data">
                              {transaction.refund_all_reason || "-"}
                            </div>
                          </div>
                          <div className="section-report">
                            <div className="section-report-title">
                              Refund Payment Type All:
                            </div>
                            <div className="section-report-data">
                              {transaction.refund_payment_type_all_name || "-"}
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
                              <th>Refund Time</th>
                              <th>Menu Type</th>
                              <th>Menu Name</th>
                              <th>Menu Varian</th>
                              <th>Serving Type</th>
                              <th>Note Item</th>
                              <th>Qty Refund Item</th>
                              <th>Menu Price</th>
                              <th>Discount Code</th>
                              <th>Discount Value</th>
                              <th>Discount Type</th>
                              <th>Refund Reason Item</th>
                              <th>Payment Type Refund</th>
                              <th>Total Refund Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transaction.refund_details.map((item, index) => (
                              <tr key={index}>
                                <td>{item.updated_at}</td>
                                <td>{item.menu_type}</td>
                                <td>{item.menu_name}</td>
                                <td>{item.varian || "-"}</td>
                                <td>{item.serving_type_name}</td>
                                <td>{item.note_item || "-"}</td>
                                <td>{item.qty_refund_item}</td>
                                <td>{item.menu_price}</td>
                                <td>{item.discount_code || "-"}</td>
                                <td>{item.discounts_value || "-"}</td>
                                <td>
                                  {item.discounts_is_percent
                                    ? item.discounts_is_percent === 1
                                      ? "Persen"
                                      : "Bukan Persen"
                                    : "-"}
                                </td>
                                <td>{item.refund_reason_item || "-"}</td>
                                <td>{item.payment_type_name || "-"}</td>
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
