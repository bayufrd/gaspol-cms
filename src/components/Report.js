import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Checkbox, DatePicker, Select, Tooltip as AntTooltip } from "antd";
import idID from "antd/es/date-picker/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useTheme } from "../contexts/ThemeContext";
import { ReportDetailModal } from "./ReportDetailModal";
import { ReportPaymentModal } from "./ReportPaymentModal";
import Swal from "../utils/alerts";
import {
  ResponsiveContainer,
  BarChart,
  Bar as ReBar,
  LineChart,
  Line as ReLine,
  PieChart,
  Pie as RePie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "../styles/report-module.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const REPORT_BATCH_SIZE = 50;
const CHART_COLORS = [
  "#FF6B35",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
];

const { RangePicker } = DatePicker;
dayjs.locale("id");

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Report = ({ userTokenData }) => {
  const { isDark } = useTheme();

  const [reports, setReports] = useState([]);
  const [shifts, setShifts] = useState([]);
  const today = formatLocalDate();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [draftRange, setDraftRange] = useState([dayjs(today), dayjs(today)]);
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const isSuccess = true;
  const [isPending, setIsPending] = useState(true);
  const [isShift, setIsShift] = useState(0);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isCashierReportEnabled, setIsCashierReportEnabled] = useState(false);
  const [showReportPaymentModal, setShowReportPaymentModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState('bar'); // Default to bar chart
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(REPORT_BATCH_SIZE);
  const [reportError, setReportError] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Loader states
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingIntervalRef = useRef(null);
  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const requestControllerRef = useRef(null);


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
    const triggerSearch = () => {
      if (startDate && endDate) {
        handleSearch();
      }
    };

    triggerSearch();
  }, [startDate, endDate, isSuccess, isPending, isShift]); // Trigger search on changes

  useEffect(() => () => {
    requestControllerRef.current?.abort();
    clearInterval(loadingIntervalRef.current);
  }, []);

  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

  const openModal = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      (report.status && report.status.toLowerCase().includes(query)) ||
      (report.receipt_number && report.receipt_number.toLowerCase().includes(query)) ||
      (report.customer_name && report.customer_name.toLowerCase().includes(query)) ||
      (report.customer_seat && report.customer_seat.toString().toLowerCase().includes(query)) ||
      (report.payment_type && report.payment_type.toLowerCase().includes(query)) ||
      (report.invoice_number && report.invoice_number.toLowerCase().includes(query)) ||
      (formatRupiah(report.total) && formatRupiah(report.total).toLowerCase().includes(query)) ||
      (formatRupiah(report.customer_cash) && formatRupiah(report.customer_cash).toLowerCase().includes(query)) ||
      (formatRupiah(report.customer_change) && formatRupiah(report.customer_change).toLowerCase().includes(query))
    );
  });
  const visibleReports = filteredReports.slice(0, visibleCount);
  const hasMoreReports = visibleCount < filteredReports.length;

  useEffect(() => {
    setVisibleCount(REPORT_BATCH_SIZE);
  }, [searchQuery, reports]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreReports) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setVisibleCount((count) => Math.min(count + REPORT_BATCH_SIZE, filteredReports.length));
      window.requestAnimationFrame(() => { loadingMoreRef.current = false; });
    }, { rootMargin: "240px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreReports, filteredReports.length]);

  const openReportPaymentModal = async () => {
    try {
      // Set loading state to true
      setLoading(true);
      setLoadingProgress(0); // Reset progress when starting
      setLoadingInterval(); // Start loading progress increment

      const shiftNumber = parseInt(isShift);

      // Prepare the selected shift value
      if (shiftNumber === 0) {
        if (shifts.length > 0) {
          setSelectedShift(shifts.map(shift => shift.shift_number).join(", "));
        } else {
          setSelectedShift(`"Belum ada shift"`);
        }
      } else if (shiftNumber > 0) {
        setSelectedShift(shiftNumber);
      } else {
        setSelectedShift(isShift);
      }

      // Show the ReportPaymentModal
      setShowReportPaymentModal(true);

      // Simulate fetching or loading report payments
      await new Promise(resolve => setTimeout(resolve, 5000));  // Simulate a delay for testing
    } catch (error) {
      console.error("Error while opening report payment modal:", error);
      // Handle error as needed, potentially using Swal to alert the error
    } finally {
      clearInterval(loadingIntervalRef.current); // Clear loading interval
      setLoadingProgress(0); // Reset progress once loading is done
      setLoading(false); // End loading
    }
  };


  const applyDateRange = () => {
    if (!draftRange?.[0] || !draftRange?.[1]) return;
    setStartDate(draftRange[0].format("YYYY-MM-DD"));
    setEndDate(draftRange[1].format("YYYY-MM-DD"));
    setIsRangeOpen(false);
  };

  const clearDateRange = () => setDraftRange(null);

  const cancelDateRange = () => {
    setDraftRange(startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null);
    setIsRangeOpen(false);
  };

  const handleSearch = async () => {
    if (!startDate || !endDate) return;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setLoading(true);
    setReportError(null);
    setVisibleCount(REPORT_BATCH_SIZE);
    setLoadingProgress(0);
    setLoadingInterval();

    const outlet_id = userTokenData.outlet_id;
    const start_date = startDate;
    const end_date = endDate;

    const is_success = isSuccess;
    const is_pending = isPending;

    try {
      const response = await axios.get(`${apiBaseUrl}/report`, {
        params: {
          outlet_id,
          start_date,
          end_date,
          is_success,
          is_pending,
        },
        signal: controller.signal,
      });

      setReports(response.data.data);
      setChartData(generateChartData(response.data.chart));
      setShifts(response.data.list_shift);

      // Enable cashier report if there are reports
      setIsCashierReportEnabled(response.data.data && response.data.data.length > 0);
    } catch (error) {
      if (error.code !== "ERR_CANCELED") {
        console.error("Gagal mengambil data laporan:", error);
        setReportError("Laporan gagal dimuat. Periksa koneksi lalu coba lagi.");
      }
    } finally {
      if (requestControllerRef.current === controller) {
        clearInterval(loadingIntervalRef.current);
        setLoading(false);
        setLoadingProgress(0);
      }
    }
  };
  const setLoadingInterval = () => {
    loadingIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 10, 100)); // Increment loading progress
    }, 200); // Increment every 200ms
  };

  const generateChartData = (chartPayload = []) => {
    if (!Array.isArray(chartPayload)) return [];

    return chartPayload.map((entry, index) => ({
      name: entry.invoice_due_date,
      total: Number(entry.total_turnover) || 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Laporan</h3>
            </div>
          </div>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="report-filters">
                <div className="report-range-filter">
                  <label htmlFor="reportDateRange">Periode laporan</label>
                  <RangePicker
                    id="reportDateRange"
                    className="report-range-picker"
                    value={draftRange}
                    open={isRangeOpen}
                    locale={idID}
                    format="DD MMM YYYY"
                    separator={<i className="bi bi-arrow-right" aria-hidden="true"></i>}
                    placeholder={["Tanggal mulai", "Tanggal selesai"]}
                    allowClear={false}
                    inputReadOnly
                    onOpenChange={(open) => {
                      if (open) {
                        setDraftRange([dayjs(startDate), dayjs(endDate)]);
                        setIsRangeOpen(true);
                      }
                    }}
                    onCalendarChange={(dates) => setDraftRange(dates)}
                    renderExtraFooter={() => (
                      <div className="report-range-footer">
                        <button type="button" className="btn btn-link" onClick={clearDateRange}>Reset</button>
                        <div>
                          <button type="button" className="btn btn-light" onClick={cancelDateRange}>Batal</button>
                          <button type="button" className="btn btn-primary" disabled={!draftRange?.[0] || !draftRange?.[1]} onClick={applyDateRange}>Terapkan</button>
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div className="report-status-filter" aria-label="Filter status transaksi">
                  <Checkbox checked={isSuccess} disabled>Sukses</Checkbox>
                  <Checkbox checked={isPending} onChange={(event) => setIsPending(event.target.checked)}>Pending</Checkbox>
                </div>
                <div className="report-shift-filter">
                  <label htmlFor="reportShift">Shift</label>
                  <Select
                    id="reportShift"
                    className="report-shift-select"
                    value={isShift}
                    onChange={setIsShift}
                    options={[
                      { value: 0, label: "Semua shift" },
                      ...shifts.map((shift) => ({
                        value: shift.shift_number,
                        label: `Shift ${shift.shift_number}`,
                      })),
                    ]}
                  />
                </div>
                <div className="report-btn-group">
                  <button
                    className={`btn btn-primary ${isCashierReportEnabled ? "" : "disabled"}`}
                    onClick={() => setShowReportPaymentModal(true)}
                    disabled={!isCashierReportEnabled}
                  >
                    <i className="bi bi-file-earmark-pdf"></i> Laporan Kasir
                  </button>
                </div>
              </div>
              {/* Loading Modal Display */}
              {loading && (
                <div className="modal loading-modal show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                  <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Loading...</h5>
                      </div>
                      <div className="modal-body">
                        <h6>{loadingProgress}%</h6>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${loadingProgress}%` }}
                            aria-valuenow={loadingProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {loadingProgress}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="chart-type-selector" role="group" aria-label="Pilih jenis grafik">
                <div className="chart-selector-group">
                  {[
                    { type: "bar", icon: "bi-bar-chart-fill", label: "Grafik batang" },
                    { type: "line", icon: "bi-graph-up-arrow", label: "Grafik garis" },
                    { type: "pie", icon: "bi-pie-chart-fill", label: "Grafik lingkaran" },
                  ].map(({ type, icon, label }) => (
                    <AntTooltip title={label} key={type}>
                      <button
                        type="button"
                        className={`chart-icon-button${selectedChart === type ? " is-active" : ""}`}
                        aria-label={label}
                        aria-pressed={selectedChart === type}
                        onClick={() => setSelectedChart(type)}
                      >
                        <i className={`bi ${icon}`} aria-hidden="true"></i>
                      </button>
                    </AntTooltip>
                  ))}
                </div>
              </div>

              <div className="chart-container">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={340}>
                    {selectedChart === "bar" ? (
                      <BarChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 6 }}>
                        <CartesianGrid stroke={isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(107, 114, 128, 0.2)"} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: isDark ? "#cbd5e1" : "#374151", fontSize: 12 }} />
                        <YAxis tick={{ fill: isDark ? "#cbd5e1" : "#374151", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                            color: isDark ? "#f8fafc" : "#111827",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => formatRupiah(value)}
                        />
                        <Legend wrapperStyle={{ color: isDark ? "#cbd5e1" : "#374151" }} />
                        <ReBar dataKey="total" name="Total Omset" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`bar-cell-${entry.name}-${index}`} fill={entry.fill} />
                          ))}
                        </ReBar>
                      </BarChart>
                    ) : selectedChart === "line" ? (
                      <LineChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 6 }}>
                        <CartesianGrid stroke={isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(107, 114, 128, 0.2)"} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: isDark ? "#cbd5e1" : "#374151", fontSize: 12 }} />
                        <YAxis tick={{ fill: isDark ? "#cbd5e1" : "#374151", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                            color: isDark ? "#f8fafc" : "#111827",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => formatRupiah(value)}
                        />
                        <Legend wrapperStyle={{ color: isDark ? "#cbd5e1" : "#374151" }} />
                        <ReLine
                          type="monotone"
                          dataKey="total"
                          name="Total Omset"
                          stroke="#FF6B35"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#FF6B35" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                            color: isDark ? "#f8fafc" : "#111827",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => formatRupiah(value)}
                        />
                        <Legend wrapperStyle={{ color: isDark ? "#cbd5e1" : "#374151" }} />
                        <RePie
                          data={chartData}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`pie-cell-${entry.name}-${index}`} fill={entry.fill} />
                          ))}
                        </RePie>
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: "center", color: isDark ? "#cbd5e1" : "#9ca3af" }}>
                    <p>Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
              </div>

              <div className="report-search-wrapper">
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x-circle me-2"></i>Hapus Filter
                  </button>
                )}
                <small className="text-muted">
                  Menampilkan {visibleReports.length} dari {filteredReports.length} transaksi
                </small>
              </div>

              {reportError ? (
                <div className="report-error-state" role="alert">
                  <i className="bi bi-wifi-off" aria-hidden="true"></i>
                  <p>{reportError}</p>
                  <button type="button" className="btn btn-outline-primary" onClick={handleSearch}>Coba lagi</button>
                </div>
              ) : filteredReports.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="desktop-view">
                    <table className="table table-striped report-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Status</th>
                          <th>Receipt</th>
                          <th>Name</th>
                          <th>Seat</th>
                          <th>Total</th>
                          <th>Cash</th>
                          <th>Change</th>
                          <th>Payment</th>
                          <th>Invoice</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleReports.map((report, index) => (
                          <tr key={report.id} onClick={() => openModal(report.id)} style={{ cursor: 'pointer' }}>
                            <td>{index + 1}</td>
                            <td className={`report-status-${report.status?.toLowerCase()}`}>
                              {report.status || "-"}
                            </td>
                            <td>{report.receipt_number || "-"}</td>
                            <td>{report.customer_name || "-"}</td>
                            <td>{report.customer_seat || "-"}</td>
                            <td>{formatRupiah(report.total) || "-"}</td>
                            <td>{formatRupiah(report.customer_cash) || "-"}</td>
                            <td>{formatRupiah(report.customer_change) || "-"}</td>
                            <td>{report.payment_type || "-"}</td>
                            <td>{report.invoice_number || "-"}</td>
                            <td>{report.invoice_due_date || report.updated_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="mobile-view">
                    <div className="reports-card-container">
                      {visibleReports.map((report, index) => (
                        <div
                          key={report.id}
                          className="report-card-item"
                          onClick={() => openModal(report.id)}
                        >
                          <div className="report-card-summary">
                            <div className="report-card-identity">
                              <span className="report-card-number">#{index + 1}</span>
                              <div>
                                <h6>{report.customer_name || "Tanpa nama"}</h6>
                                <span className="report-card-receipt">{report.receipt_number || report.invoice_number || "-"}</span>
                              </div>
                            </div>
                            <div className="report-card-total">
                              <span>Total</span>
                              <strong>Rp{formatRupiah(report.total) || "0"}</strong>
                            </div>
                          </div>

                          <div className="report-card-meta">
                            <span className={`report-status-badge report-status-${report.status?.toLowerCase()}`}>
                              {report.status || "-"}
                            </span>
                            {report.payment_type && <span><i className="bi bi-credit-card" aria-hidden="true"></i>{report.payment_type}</span>}
                            {report.customer_seat !== null && report.customer_seat !== undefined && report.customer_seat !== "" && <span><i className="bi bi-geo-alt" aria-hidden="true"></i>Meja {report.customer_seat}</span>}
                          </div>

                          <div className="report-card-details">
                            {report.invoice_number && <span title={report.invoice_number}><i className="bi bi-receipt" aria-hidden="true"></i>{report.invoice_number}</span>}
                            {(report.invoice_due_date || report.updated_at) && <time><i className="bi bi-clock" aria-hidden="true"></i>{report.invoice_due_date || report.updated_at}</time>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="report-load-more" ref={loadMoreRef} aria-live="polite">
                    {hasMoreReports ? (
                      <>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span>Memuat transaksi berikutnya…</span>
                      </>
                    ) : <span>Semua transaksi sudah ditampilkan</span>}
                  </div>
                </>
              ) : (
                <div className="report-empty-state">
                  <i className="bi bi-inbox"></i>
                  <p>
                    {searchQuery ? `Tidak ada data yang cocok dengan "${searchQuery}"` : 'Tidak ada data yang ditampilkan'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Loading Overlay Modal */}
      {loading && (
        <div className="modal loading-modal show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Loading...</h5>
              </div>
              <div className="modal-body">
                <h6>{loadingProgress}%</h6>
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${loadingProgress}%` }}
                    aria-valuenow={loadingProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {loadingProgress}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReportDetailModal
        show={showModal}
        onClose={closeModal}
        selectedTransactionId={selectedTransactionId}
      />

      <ReportPaymentModal
        show={showReportPaymentModal}
        onClose={() => setShowReportPaymentModal(false)}
        userTokenData={userTokenData}
        startDate={startDate}
        endDate={endDate}
        shiftNumber={isShift}
        selectedShift={selectedShift}
      />
    </div>
  );
};

export default Report;