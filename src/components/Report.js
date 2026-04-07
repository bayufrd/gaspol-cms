import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import { ReportDetailModal } from "./ReportDetailModal";
import { ReportPaymentModal } from "./ReportPaymentModal";
import flatpickr from "flatpickr";
import Swal from "sweetalert2";
import "flatpickr/dist/flatpickr.min.css";
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

const Report = ({ userTokenData }) => {
  const { isDark } = useTheme();

  const [reports, setReports] = useState([]);
  const [shifts, setShifts] = useState([]);
  // Set default dates to today (April 7, 2026)
  const today = new Date(2026, 3, 7).toISOString().split('T')[0]; // April 7, 2026
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const [isSuccess, setIsSuccess] = useState(true);
  const [isPending, setIsPending] = useState(true);
  const [isShift, setIsShift] = useState(0);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isCashierReportEnabled, setIsCashierReportEnabled] = useState(false);
  const [showReportPaymentModal, setShowReportPaymentModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState('bar'); // Default to bar chart
  const [searchQuery, setSearchQuery] = useState(''); // Search functionality


  const [chartData, setChartData] = useState([]);

  // Loader states
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingIntervalRef = useRef(null);


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
    getReports();
  }, []);
  useEffect(() => {
    const triggerSearch = () => {
      if (startDate && endDate) {
        handleSearch();
      }
    };

    triggerSearch();
  }, [startDate, endDate, isSuccess, isPending, isShift]); // Trigger search on changes

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

  useEffect(() => {
    let startDatePicker, endDatePicker;
    if (startDateInputRef.current) {
      startDatePicker = flatpickr(startDateInputRef.current, {
        enableTime: false,
        dateFormat: "Y-m-d",
        onChange: (selectedDates, dateStr) => {
          setStartDate(dateStr);
        },
      });
    }

    if (endDateInputRef.current) {
      endDatePicker = flatpickr(endDateInputRef.current, {
        enableTime: false,
        dateFormat: "Y-m-d",
        onChange: (selectedDates, dateStr) => {
          setEndDate(dateStr);
        },
      });
    }

    return () => {
      if (startDatePicker) {
        startDatePicker.destroy();
      }
      if (endDatePicker) {
        endDatePicker.destroy();
      }
    };
  }, []);

  const getReports = async () => {
    const response = await axios.get(`${apiBaseUrl}/report`, {
      params: {
        outlet_id: userTokenData.outlet_id,
      },
    });
    setReports(response.data.data);
    setShifts(response.data.list_shift);

    // Enable cashier report if there are reports
    setIsCashierReportEnabled(response.data.data && response.data.data.length > 0);
  };

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


  const handleSearch = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingInterval(); // Start loading progress interval

    if ((startDate && !endDate) || (!startDate && endDate)) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Silakan pilih kedua tanggal (mulai dan akhir) untuk melakukan pencarian.",
      });
      clearInterval(loadingIntervalRef.current); // Clear loading interval if error
      setLoading(false);
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj > endDateObj) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir!",
      });
      clearInterval(loadingIntervalRef.current); // Clear loading interval if error
      setLoading(false);
      return;
    }

    const diffMilliseconds = endDateObj - startDateObj;
    const diffDays = Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24));

    // if (diffDays > 10) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Gagal",
    //     text: "Pemilihan tanggal tidak bisa melebihi 10 hari!",
    //   });
    //   clearInterval(loadingIntervalRef.current); // Clear loading interval if error
    //   setLoading(false);
    //   return;
    // }

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
      });

      setReports(response.data.data);
      setChartData(generateChartData(response.data.chart));
      setShifts(response.data.list_shift);

      // Enable cashier report if there are reports
      setIsCashierReportEnabled(response.data.data && response.data.data.length > 0);
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat mengambil laporan.",
      });
    } finally {
      clearInterval(loadingIntervalRef.current); // Clear loading interval
      setLoading(false); // End loading
      setLoadingProgress(0); // Reset loading progress
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
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tanggal mulai"
                    value={startDate || ""}
                    ref={startDateInputRef}
                    readOnly
                  />
                </div>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tanggal akhir"
                    value={endDate || ""}
                    ref={endDateInputRef}
                    readOnly
                  />
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    id="isSuccess"
                    type="checkbox"
                    checked={isSuccess}
                    onChange={() => setIsSuccess(!isSuccess)}
                  />
                  <label className="form-check-label" htmlFor="isSuccess">Sukses</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    id="isPending"
                    type="checkbox"
                    checked={isPending}
                    onChange={() => setIsPending(!isPending)}
                  />
                  <label className="form-check-label" htmlFor="isPending">Pending</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text">Shift</span>
                  <select
                    className="form-select"
                    value={isShift}
                    onChange={(e) => setIsShift(e.target.value)}
                  >
                    <option value="0">Semua</option>
                    {shifts.map((shift) => (
                      <option key={shift.shift_number} value={shift.shift_number}>
                        {shift.shift_number}
                      </option>
                    ))}
                  </select>
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
              <div className="chart-type-selector">
                <div className="chart-selector-group">
                  <label className="chart-option">
                    <input
                      type="radio"
                      name="chart"
                      checked={selectedChart === 'bar'}
                      onChange={() => setSelectedChart('bar')}
                      className="chart-radio"
                    />
                    <span className="chart-label">📊 Bar Chart</span>
                  </label>
                  <label className="chart-option">
                    <input
                      type="radio"
                      name="chart"
                      checked={selectedChart === 'line'}
                      onChange={() => setSelectedChart('line')}
                      className="chart-radio"
                    />
                    <span className="chart-label">📈 Line Chart</span>
                  </label>
                  <label className="chart-option">
                    <input
                      type="radio"
                      name="chart"
                      checked={selectedChart === 'pie'}
                      onChange={() => setSelectedChart('pie')}
                      className="chart-radio"
                    />
                    <span className="chart-label">🥧 Pie Chart</span>
                  </label>
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
                  Menampilkan {filteredReports.length} dari {reports.length} data
                </small>
              </div>

              {filteredReports.length > 0 ? (
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
                        {filteredReports.map((report, index) => (
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
                      {filteredReports.map((report, index) => (
                        <div
                          key={report.id}
                          className="report-card-item"
                          onClick={() => openModal(report.id)}
                        >
                          <div className="report-card-header">
                            <div className="report-card-number">{index + 1}</div>
                            <div className="report-card-content">
                              <span className={`report-status-badge report-status-${report.status?.toLowerCase()}`}>
                                {report.status || "-"}
                              </span>
                              <span className="report-card-receipt">{report.receipt_number || "-"}</span>
                            </div>
                          </div>

                          <div className="report-card-body">
                            <div className="report-card-row">
                              <span className="report-card-label">Customer</span>
                              <span className="report-card-value">{report.customer_name || "-"}</span>
                            </div>
                            <div className="report-card-row">
                              <span className="report-card-label">Seat</span>
                              <span className="report-card-value">{report.customer_seat || "-"}</span>
                            </div>
                            <div className="report-card-row">
                              <span className="report-card-label">Total</span>
                              <span className="report-card-value">{formatRupiah(report.total) || "-"}</span>
                            </div>
                            <div className="report-card-row">
                              <span className="report-card-label">Cash</span>
                              <span className="report-card-value">{formatRupiah(report.customer_cash) || "-"}</span>
                            </div>
                            <div className="report-card-row">
                              <span className="report-card-label">Change</span>
                              <span className="report-card-value">{formatRupiah(report.customer_change) || "-"}</span>
                            </div>
                            <div className="report-card-row">
                              <span className="report-card-label">Payment</span>
                              <span className="report-card-value">{report.payment_type || "-"}</span>
                            </div>
                            <div className="report-card-row">
                              <span className="report-card-label">Invoice</span>
                              <span className="report-card-value">{report.invoice_number || "-"}</span>
                            </div>
                            <div className="report-card-row">
                              <span className="report-card-label">Updated</span>
                              <span className="report-card-value">{report.invoice_due_date || report.updated_at}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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