import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ReportDetailModal } from "./ReportDetailModal";
import { ReportPaymentModal } from "./ReportPaymentModal";
import flatpickr from "flatpickr";
import Swal from "sweetalert2";
import "flatpickr/dist/flatpickr.min.css";
import { Bar } from 'react-chartjs-2';
import { CategoryScale, LinearScale } from 'chart.js';
import Chart from 'chart.js/auto';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Report = ({ userTokenData }) => {
  Chart.register(CategoryScale, LinearScale);
  const [reports, setReports] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isShift, setIsShift] = useState(0);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isCashierReportEnabled, setIsCashierReportEnabled] = useState(false);
  const [showReportPaymentModal, setShowReportPaymentModal] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Omset",
        data: [],
        backgroundColor: [" rgba(75, 192, 192, 1)"],
        borderColor: ["rgba(53, 162, 235, 0.5)"],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    getReports();
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
  };

  const openModal = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openReportPaymentModal = () => {
    if (isShift === 0 || isShift === "0" ) {
      setSelectedShift(shifts.map(shift => shift.shift_number).join());
    } else {
      setSelectedShift(isShift);
    }
    setShowReportPaymentModal(true);
  };

  const handleSearch = async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Silakan pilih kedua tanggal (mulai dan akhir) untuk melakukan pencarian.",
      });
      return;
    }

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
      // Destroy existing chart if it exists
      if (chartData.chartInstance) {
        chartData.chartInstance.destroy();
      }

      setReports(response.data.data);
      setChartData(generateChartData(response.data.chart));
      setShifts(response.data.list_shift);
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
    }
  };

  const generateChartData = (chartData) => {
    const labels = chartData.map((entry) => entry.invoice_due_date);
    const totalTurnoverData = chartData.map((entry, index) => {
      return index % 2 === 0
        ? { totalTurnover: entry.total_turnover, color: 'rgba(53, 162, 235, 0.5)' }
        : { totalTurnover: entry.total_turnover, color: 'rgba(255, 99, 132, 0.5)' };
    });
    return {
      labels: labels,
      datasets: [
        {
          label: "Total Omset",
          data: totalTurnoverData.map((entry) => entry.totalTurnover),
          backgroundColor: totalTurnoverData.map((entry) => entry.color),
          borderWidth: 1,
        },
      ],
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Invoice Due Date',
          },
        },
      },
    };
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
        <section class="section">
          <div class="card">
            <div class="card-header">
              <div className="float-lg-start">
                <div className="card-header-report">
                  <div
                    className="button btn btn-primary rounded-pill"
                    onClick={handleSearch}
                  >
                    <i class="bi bi-search"></i> Cari
                  </div>
                  <div>
                    <input
                      type="text"
                      id="startDateInput"
                      className={`form-control`}
                      placeholder="Tanggal mulai"
                      value={startDate || ""}
                      ref={startDateInputRef}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      id="startDateInput"
                      className={`form-control`}
                      placeholder="Tanggal akhir"
                      value={endDate || ""}
                      ref={endDateInputRef}
                    />
                  </div>
                  <div class="form-check">
                    <div class="checkbox">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        checked={isSuccess}
                        onChange={(e) => {
                          setIsSuccess(!isSuccess);
                          setIsCashierReportEnabled(e.target.checked);
                        }}
                      />
                      <label for="checkbox2">Transaksi Sukses </label>
                    </div>
                  </div>
                  <div class="form-check">
                    <div class="checkbox">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        checked={isPending}
                        onChange={() => setIsPending(!isPending)}
                      />
                      <label for="checkbox2">Transaksi Pending </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center ms-2">
                    <div className="me-2">Shift:</div>
                    <div>
                      <select
                        class="form-select"
                        id="basicSelect"
                        value={isShift}
                        onChange={(e) => {
                          setIsShift(e.target.value);
                        }}
                      >
                        <option value="0">Semua</option>
                        {shifts.map((shift) => (
                          <option key={shift.shift_number} value={shift.shift_number}>
                            {shift.shift_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="float-lg-end">
                <div 
                  className={`button btn btn-primary rounded-pill ${isCashierReportEnabled ? "" : "disabled"}`}
                  onClick={openReportPaymentModal}
                >
                  Laporan Kasir
                </div>
              </div>
            </div>
            <div class="card-body">

              {/* Chart.js Bar Chart */}
              <div className="container mb-4">
                <div className="d-flex justify-content-center align-center" style={{ height: "30vh" }}>
                  <Bar data={chartData} />
                </div>
              </div>

              <table class="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Receipt Number</th>
                    <th>Customer Name</th>
                    <th>Customer Seat</th>
                    <th>Customer Cash</th>
                    <th>Customer Change</th>
                    <th>Payment Type</th>
                    <th>Delivery Type</th>
                    <th>Delivery Note</th>
                    <th>Invoice Number</th>
                    <th>Invoice Due Date</th>
                    <th>Last Data Changed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>
                      <td>{report.receipt_number || "-"}</td>
                      <td>{report.customer_name || "-"}</td>
                      <td>{report.customer_seat || "-"}</td>
                      <td>{report.customer_cash || "-"}</td>
                      <td>{report.customer_change || "-"}</td>
                      <td>{report.payment_type || "-"}</td>
                      <td>{report.delivery_type || "-"}</td>
                      <td>{report.delivery_note || "-"}</td>
                      <td>{report.invoice_number || "-"}</td>
                      <td>{report.invoice_due_date || "-"}</td>
                      <td>{report.updated_at || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(report.id)}
                          >
                            <i className="bi bi-eye"></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

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
