import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/report-detail-modal.css";

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "" && value !== "-";

const fallback = (value) => hasValue(value) ? value : "-";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(number)
    : fallback(value);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const normalized = typeof value === "string"
    ? value.replace(/^[^,]+,\s*/, "").replace(" ", "T")
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return fallback(value);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatDiscountType = (value) =>
  value === 0 ? "Potongan" : value === 1 ? "Persentase" : "-";

const formatDiscount = (value, isPercent) => {
  if (value === null || value === undefined || value === "") return "-";
  return isPercent === 1 ? `${formatNumber(value)}%` : formatCurrency(value);
};

const getStatusTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (["success", "successful", "paid", "completed", "selesai"].some((key) => normalized.includes(key))) return "success";
  if (["cancel", "failed", "gagal", "void"].some((key) => normalized.includes(key))) return "danger";
  if (["refund", "pending", "process", "proses"].some((key) => normalized.includes(key))) return "warning";
  return "neutral";
};

const InfoRow = ({ label, children, emphasis = false }) => {
  if (!hasValue(children)) return null;

  return (
    <div className={`report-detail-row${emphasis ? " report-detail-row--emphasis" : ""}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
};

const Section = ({ title, count, children }) => (
  <section className="report-detail-section">
    <div className="report-detail-section__heading">
      <h5>{title}</h5>
      {count !== undefined && <span>{formatNumber(count)} item</span>}
    </div>
    {children}
  </section>
);

const ItemCard = ({ item, index, type = "cart" }) => {
  const canceled = type === "canceled";
  const refund = type === "refund";
  const title = refund ? "Item Refund" : canceled ? "Item Dibatalkan" : "Item Pesanan";
  const price = refund ? item.menu_price : item.price;
  const total = refund ? item.total_refund_price : item.total_price;

  return (
    <article className={`report-item-card report-item-card--${type}`}>
      <header className="report-item-card__header">
        <div>
          <span className="report-item-card__eyebrow">{title} {index + 1}</span>
          <h6>{fallback(item.menu_name)}</h6>
        </div>
        <strong>{formatCurrency(total)}</strong>
      </header>
      <dl className="report-item-card__grid">
        <InfoRow label={refund ? "Waktu refund" : canceled ? "Waktu dibatalkan" : "Diperbarui"}>{formatDateTime(item.updated_at)}</InfoRow>
        <InfoRow label="Jenis menu">{fallback(item.menu_type)}</InfoRow>
        <InfoRow label="Varian">{fallback(item.varian)}</InfoRow>
        <InfoRow label="Penyajian">{fallback(item.serving_type_name)}</InfoRow>
        <InfoRow label="Catatan">{fallback(item.note_item)}</InfoRow>
        <InfoRow label={refund ? "Qty refund" : "Qty"}>{formatNumber(refund ? item.qty_refund_item : item.qty)}</InfoRow>
        <InfoRow label="Harga menu">{formatCurrency(price)}</InfoRow>
        <InfoRow label="Kode diskon">{fallback(item.discount_code)}</InfoRow>
        <InfoRow label="Jenis diskon">{formatDiscountType(item.discounts_is_percent)}</InfoRow>
        <InfoRow label="Nilai diskon">{formatDiscount(item.discounts_value, item.discounts_is_percent)}</InfoRow>
        {canceled && <InfoRow label="Alasan pembatalan">{fallback(item.cancel_reason)}</InfoRow>}
        {refund && <InfoRow label="Alasan refund">{fallback(item.refund_reason_item)}</InfoRow>}
        {refund && <InfoRow label="Metode refund">{fallback(item.payment_type_name)}</InfoRow>}
      </dl>
    </article>
  );
};

export const ReportDetailModal = ({ show, onClose, selectedTransactionId }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const { isDark } = useTheme();
  const [transaction, setTransaction] = useState(null);
  const [showRefund, setShowRefund] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!show || !selectedTransactionId) {
      setShowRefund(false);
      return undefined;
    }

    let active = true;
    let progress = 0;
    setLoading(true);
    setLoadingProgress(0);
    const id = setInterval(() => {
      progress = Math.min(progress + 10, 90);
      if (active) setLoadingProgress(progress);
    }, 1000);

    axios.get(`${apiBaseUrl}/transaction/${selectedTransactionId}`, {
      params: { is_report: true },
    }).then((response) => {
      if (!active) return;
      const data = response.data.data;
      setTransaction(data);
      setShowRefund(data.total_refund > 0);
      setLoadingProgress(100);
    }).catch((error) => {
      console.error("Error fetching transaction:", error);
    }).finally(() => {
      clearInterval(id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [show, selectedTransactionId, apiBaseUrl]);

  const cartDetails = transaction?.cart_details || [];
  const canceledItems = transaction?.canceled_items || [];
  const refundDetails = transaction?.refund_details || [];

  return (
    <>
      <div
        className={`modal fade text-left report-detail-modal ${show ? "show" : ""}`}
        role="dialog"
        aria-labelledby="reportDetailTitle"
        aria-modal={show ? "true" : undefined}
        aria-hidden={show ? undefined : "true"}
        data-theme={isDark ? "dark" : "light"}
        style={{ display: show ? "block" : "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <header className="modal-header">
              <div className="report-detail-title">
                <span className="report-detail-title__eyebrow">Laporan transaksi</span>
                <h4 className="modal-title" id="reportDetailTitle">Detail Laporan</h4>
              </div>
              <div className="report-detail-header-actions">
                {transaction && (
                  <span className={`report-status report-status--${getStatusTone(transaction.status)}`}>
                    {fallback(transaction.status)}
                  </span>
                )}
                <button type="button" className="report-detail-close" aria-label="Tutup detail laporan" onClick={onClose}>
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              </div>
            </header>

            <div className="modal-body">
              {loading ? (
                <div className="report-detail-loading" role="status" aria-live="polite">
                  <div className="report-detail-loading__meta"><span>Memuat detail laporan</span><strong>{loadingProgress}%</strong></div>
                  <div className="progress"><div className="progress-bar" style={{ width: `${loadingProgress}%` }} /></div>
                </div>
              ) : transaction ? (
                <div className="report-detail-content">
                  <Section title="Transaksi">
                    <dl className="report-detail-panel report-detail-grid">
                      <InfoRow label="Nomor invoice">{fallback(transaction.invoice_number)}</InfoRow>
                      <InfoRow label="Waktu transaksi">{formatDateTime(transaction.transaction_date_show)}</InfoRow>
                      <InfoRow label="Referensi transaksi">{fallback(transaction.transaction_ref)}</InfoRow>
                      <InfoRow label="Nama pelanggan">{fallback(transaction.customer_name)}</InfoRow>
                      <InfoRow label="Nomor meja">{fallback(transaction.customer_seat)}</InfoRow>
                      <InfoRow label="Metode pembayaran">{fallback(transaction.payment_type)}</InfoRow>
                      <InfoRow label="Kode diskon cart">{fallback(transaction.discount_code)}</InfoRow>
                      <InfoRow label="Jenis diskon cart">{formatDiscountType(transaction.discounts_is_percent)}</InfoRow>
                      <InfoRow label="Nilai diskon cart">{formatDiscount(transaction.discounts_value, transaction.discounts_is_percent)}</InfoRow>
                      <InfoRow label="Subtotal">{formatCurrency(transaction.subtotal)}</InfoRow>
                      <InfoRow label="Total" emphasis>{formatCurrency(transaction.total)}</InfoRow>
                    </dl>
                  </Section>

                  {transaction.member_id !== null && (hasValue(transaction.member_name) || hasValue(transaction.member_phone_number)) && (
                    <Section title="Membership">
                      <dl className="report-detail-panel report-detail-grid">
                        <InfoRow label="Nama member">{transaction.member_name}</InfoRow>
                        <InfoRow label="Nomor telepon">{transaction.member_phone_number}</InfoRow>
                      </dl>
                    </Section>
                  )}

                  {cartDetails.length > 0 && (
                    <Section title="Cart" count={cartDetails.length}>
                      <div className="report-item-list">{cartDetails.map((item, index) => <ItemCard key={item.id || index} item={item} index={index} />)}</div>
                    </Section>
                  )}

                  {canceledItems.length > 0 && (
                    <Section title="Item Dibatalkan" count={canceledItems.length}>
                      <div className="report-item-list">{canceledItems.map((item, index) => <ItemCard key={item.id || index} item={item} index={index} type="canceled" />)}</div>
                    </Section>
                  )}

                  {showRefund && (
                    <Section title="Refund">
                      <dl className="report-detail-panel report-detail-grid">
                        <InfoRow label="Status">{transaction.is_refund_all ? "Refunded" : "-"}</InfoRow>
                        <InfoRow label="Alasan refund penuh">{fallback(transaction.refund_all_reason)}</InfoRow>
                        <InfoRow label="Metode refund">{fallback(transaction.refund_payment_type_all_name)}</InfoRow>
                        <InfoRow label="Total refund" emphasis>{formatCurrency(transaction.total_refund)}</InfoRow>
                      </dl>
                    </Section>
                  )}

                  {refundDetails.length > 0 && (
                    <Section title="Detail Refund" count={refundDetails.length}>
                      <div className="report-item-list">{refundDetails.map((item, index) => <ItemCard key={item.id || index} item={item} index={index} type="refund" />)}</div>
                    </Section>
                  )}
                </div>
              ) : <div className="report-detail-empty">-</div>}
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
};
