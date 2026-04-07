import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/report-detail-modal.css";

export const ReportDetailModal = ({ show, onClose, selectedTransactionId }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const { isDark } = useTheme();

  const [transaction, setTransaction] = useState(null);
  const [showRefund, setShowRefund] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading
  const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
  const [intervalId, setIntervalId] = useState(null); // State for managing the interval

  useEffect(() => {
    if (show && selectedTransactionId) {
      const fetchData = async () => {
        setLoading(true); // Start loading
        setLoadingProgress(0); // Reset progress before starting
        let progress = 0;

        // Start an interval to update loading progress
        const id = setInterval(() => {
          if (progress < 100) {
            progress += 10; // Timer increases progress
            setLoadingProgress(progress);
          } else {
            clearInterval(id); // Stop the interval when finished
          }
        }, 1000); // Update every second

        setIntervalId(id); // Store the interval ID

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
        } finally {
          clearInterval(id); // Ensure the interval is cleared
          setLoading(false); // Stop loading
        }
      };
      fetchData();
    } else {
      setShowRefund(false);
    }
  }, [show, selectedTransactionId, apiBaseUrl]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const showRefundDetails =
    transaction?.refund_details && transaction.refund_details.length > 0;

  return (
    <>
      <div className={`modal fade text-left ${show ? "show" : ""}`} id="inlineForm" role="dialog" aria-labelledby="myModalLabel33" aria-modal={show ? "true" : undefined} aria-hidden={show ? undefined : "true"} style={show ? { display: "block" } : { display: "none" }}>
        <div className="modal-report modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title" id="myModalLabel33">Detail Laporan</h4>
              <button type="button" className="close" aria-label="Close" onClick={onClose}>
                <i data-feather="x"></i>x
              </button>
            </div>
            <div className="modal-body scrollable-content">
              {/* Show loading UI with progress */}
              {loading ? (
                <div className="loading-content">
                  <h5>Loading... {loadingProgress}%</h5>
                  <div className="progress">
                    <div className="progress-bar" role="progressbar" style={{ width: `${loadingProgress}%` }} aria-valuenow={loadingProgress} aria-valuemin="0" aria-valuemax="100">{loadingProgress}%</div>
                  </div>
                </div>
              ) : transaction ? (
                <>
                  <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>Transaction</h4>
                  <h5 className={`status-${transaction.status?.toLowerCase()}`}>
                    "{transaction.status}"
                  </h5>
                  <div className="transaction-info-card">
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Invoice Number</span>
                      <span className="transaction-info-value">{transaction.invoice_number || "-"}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Transaction Updated At</span>
                      <span className="transaction-info-value">{transaction.transaction_date_show}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Transaction Reference</span>
                      <span className="transaction-info-value">{transaction.transaction_ref || '-'}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Customer Name</span>
                      <span className="transaction-info-value">{transaction.customer_name}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Customer Seat</span>
                      <span className="transaction-info-value">{transaction.customer_seat}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Payment Type</span>
                      <span className="transaction-info-value">{transaction.payment_type || "-"}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Discount Code Cart</span>
                      <span className="transaction-info-value">{transaction.discount_code || "-"}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Discount Type Cart</span>
                      <span className="transaction-info-value">{transaction.discounts_is_percent === 0 ? "Potongan" : transaction.discounts_is_percent === 1 ? "Persenan" : "-"}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Discount Value Cart</span>
                      <span className="transaction-info-value">{transaction.discounts_value ? transaction.discounts_value + (transaction.discounts_is_percent === 1 ? " %" : "") : "-"}</span>
                    </div>
                    <div className="transaction-info-row">
                      <span className="transaction-info-label">Subtotal</span>
                      <span className="transaction-info-value">{transaction.subtotal || "-"}</span>
                    </div>
                    <div className="transaction-info-row transaction-info-total">
                      <span className="transaction-info-label">Total</span>
                      <span className="transaction-info-value">{transaction.total || "-"}</span>
                    </div>
                  </div>
                  {transaction.member_id !== null && (
                    <>
                      <hr></hr>
                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Membership
                      </h4>
                      <div className="transaction-info-card">
                        <div className="transaction-info-row">
                          <span className="transaction-info-label">Name</span>
                          <span className="transaction-info-value">{transaction.member_name || "-"}</span>
                        </div>
                        <div className="transaction-info-row">
                          <span className="transaction-info-label">Phone</span>
                          <span className="transaction-info-value">{transaction.member_phone_number || "-"}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {transaction.cart_details.length > 0 && (
                    <>
                      <hr></hr>
                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Cart
                      </h4>
                      <div className="cart-items-container">
                        {transaction.cart_details.map((item, index) => (
                          <div key={index} className="cart-item-card">
                            <div className="cart-item-header">
                              <span className="cart-item-number">Item {index + 1}</span>
                            </div>
                            <div className="cart-item-body">
                              <div className="cart-item-row">
                                <span className="cart-item-label">Paid Time</span>
                                <span className="cart-item-value">{item.updated_at}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Type</span>
                                <span className="cart-item-value">{item.menu_type}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Name</span>
                                <span className="cart-item-value">{item.menu_name}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Varian</span>
                                <span className="cart-item-value">{item.varian || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Serving Type</span>
                                <span className="cart-item-value">{item.serving_type_name}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Note</span>
                                <span className="cart-item-value">{item.note_item || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Qty</span>
                                <span className="cart-item-value">{item.qty}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Price</span>
                                <span className="cart-item-value">{item.price}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Code</span>
                                <span className="cart-item-value">{item.discount_code || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Value</span>
                                <span className="cart-item-value">{item.discounts_value || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Type</span>
                                <span className="cart-item-value">
                                  {item.discounts_is_percent === 0
                                    ? "Potongan"
                                    : item.discounts_is_percent === 1
                                      ? "Persenan"
                                      : "-"}
                                </span>
                              </div>
                              <div className="cart-item-row cart-item-total">
                                <span className="cart-item-label">Total Price</span>
                                <span className="cart-item-value">{item.total_price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {transaction.canceled_items.length > 0 && (
                    <>
                      <hr></hr>
                      <h4 style={{ textAlign: "center", marginBottom: "3vh" }}>
                        Canceled Items
                      </h4>
                      <div className="cart-items-container">
                        {transaction.canceled_items.map((item, index) => (
                          <div key={index} className="cart-item-card cart-item-canceled">
                            <div className="cart-item-header">
                              <span className="cart-item-number">Canceled Item {index + 1}</span>
                            </div>
                            <div className="cart-item-body">
                              <div className="cart-item-row">
                                <span className="cart-item-label">Cancel At</span>
                                <span className="cart-item-value">{item.updated_at}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Cancel Reason</span>
                                <span className="cart-item-value">{item.cancel_reason}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Type</span>
                                <span className="cart-item-value">{item.menu_type}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Name</span>
                                <span className="cart-item-value">{item.menu_name}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Varian</span>
                                <span className="cart-item-value">{item.varian || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Serving Type</span>
                                <span className="cart-item-value">{item.serving_type_name}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Note</span>
                                <span className="cart-item-value">{item.note_item || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Qty</span>
                                <span className="cart-item-value">{item.qty}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Price</span>
                                <span className="cart-item-value">{item.price}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Code</span>
                                <span className="cart-item-value">{item.discount_code || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Value</span>
                                <span className="cart-item-value">{item.discounts_value || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Type</span>
                                <span className="cart-item-value">
                                  {item.discounts_is_percent === 0
                                    ? "Potongan"
                                    : item.discounts_is_percent === 1
                                      ? "Persenan"
                                      : "-"}
                                </span>
                              </div>
                              <div className="cart-item-row cart-item-total">
                                <span className="cart-item-label">Total Price</span>
                                <span className="cart-item-value">{item.total_price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                      <div className="transaction-info-card">
                        <div className="transaction-info-row">
                          <span className="transaction-info-label">Status</span>
                          <span className="transaction-info-value" style={{ color: transaction.is_refund_all ? '#fd7e14' : 'initial' }}>
                            {transaction.is_refund_all ? "Refunded" : "-"}
                          </span>
                        </div>
                        <div className="transaction-info-row">
                          <span className="transaction-info-label">Refund All Reason</span>
                          <span className="transaction-info-value">{transaction.refund_all_reason || "-"}</span>
                        </div>
                        <div className="transaction-info-row">
                          <span className="transaction-info-label">Refund Payment Type All</span>
                          <span className="transaction-info-value">{transaction.refund_payment_type_all_name || "-"}</span>
                        </div>
                        <div className="transaction-info-row transaction-info-total">
                          <span className="transaction-info-label">Total Refund</span>
                          <span className="transaction-info-value">{transaction.total_refund}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {showRefundDetails && (
                    <>
                      <hr></hr>
                      <h4
                        style={{ textAlign: "center", marginBottom: "3vh" }}
                      >
                        Refund Detail
                      </h4>
                      <div className="cart-items-container">
                        {transaction.refund_details.map((item, index) => (
                          <div key={index} className="cart-item-card">
                            <div className="cart-item-header">
                              <span className="cart-item-number">Refund Item {index + 1}</span>
                            </div>
                            <div className="cart-item-body">
                              <div className="cart-item-row">
                                <span className="cart-item-label">Refund Time</span>
                                <span className="cart-item-value">{item.updated_at}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Type</span>
                                <span className="cart-item-value">{item.menu_type}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Name</span>
                                <span className="cart-item-value">{item.menu_name}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Varian</span>
                                <span className="cart-item-value">{item.varian || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Serving Type</span>
                                <span className="cart-item-value">{item.serving_type_name}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Note Item</span>
                                <span className="cart-item-value">{item.note_item || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Qty Refund Item</span>
                                <span className="cart-item-value">{item.qty_refund_item}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Menu Price</span>
                                <span className="cart-item-value">{item.menu_price}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Code</span>
                                <span className="cart-item-value">{item.discount_code || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Value</span>
                                <span className="cart-item-value">{item.discounts_value || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Discount Type</span>
                                <span className="cart-item-value">{item.discounts_is_percent ? (item.discounts_is_percent === 1 ? "Persen" : "Bukan Persen") : "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Refund Reason Item</span>
                                <span className="cart-item-value">{item.refund_reason_item || "-"}</span>
                              </div>
                              <div className="cart-item-row">
                                <span className="cart-item-label">Payment Type Refund</span>
                                <span className="cart-item-value">{item.payment_type_name || "-"}</span>
                              </div>
                              <div className="cart-item-row cart-item-total">
                                <span className="cart-item-label">Total Refund Price</span>
                                <span className="cart-item-value">{item.total_refund_price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
      <div className={show ? "modal-backdrop fade show" : undefined}></div>
    </>
  );
};