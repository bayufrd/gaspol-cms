import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ReportDetailModal } from "./ReportDetailModal";
import { ReportPaymentModal } from "./ReportPaymentModal";
import flatpickr from "flatpickr";
import Swal from "sweetalert2";
import "flatpickr/dist/flatpickr.min.css";
import { Bar, Line, Pie } from 'react-chartjs-2'; // Import Line and Pie chart
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
  const [selectedChart, setSelectedChart] = useState('bar'); // Default to bar chart


  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Omset",
        data: [],
        backgroundColor: ["rgba(75, 192, 192, 1)"],
        borderColor: ["rgba(53, 162, 235, 0.5)"],
        borderWidth: 1,
      },
    ],
  });

  // Loader states
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingIntervalRef = useRef(null);

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

      if (chartData.chartInstance) {
        chartData.chartInstance.destroy();
      }
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
  const colors = [
    'rgba(255, 99, 132, 1)',  // Red
    'rgba(54, 162, 235, 1)',   // Blue
    'rgba(255, 206, 86, 1)',   // Yellow
    'rgba(75, 192, 192, 1)',   // Cyan
    'rgba(153, 102, 255, 1)',  // Purple
    'rgba(255, 159, 64, 1)',   // Orange
    'rgba(127, 255, 0, 1)',    // Green
    'rgba(128, 0, 128, 1)',    // Purple
  ];
  const setLoadingInterval = () => {
    loadingIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 10, 100)); // Increment loading progress
    }, 200); // Increment every 200ms
  };

  const generateChartData = (chartData) => {
    const labels = chartData.map((entry) => entry.invoice_due_date);
    const totalTurnoverData = chartData.map((entry) => entry.total_turnover);

    // Use the colors array and map it to the length of the data
    const backgroundColors = totalTurnoverData.map((_, index) =>
      colors[index % colors.length] // Loop through the colors array
    );

    const openReportPage = async () => {
      const shiftNumber = parseInt(isShift);
      const outlet_id = userTokenData.outlet_id;

      // Constructing the report URL with query parameters
      const reportUrl = `/report?outlet_id=${outlet_id}&start_date=${startDate}&end_date=${endDate}&is_success=${isSuccess}&is_pending=${isPending}&is_shift=${shiftNumber}`;

      window.open(reportUrl, '_blank'); // Open the report in a new tab
    };

    return {
      labels: labels,
      datasets: [
        {
          label: "Total Omset",
          data: totalTurnoverData,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('1', '0.5')), // Make borders lighter
          borderWidth: 1,
        },
      ],
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
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="float-lg-start">
                <div className="card-header-report">
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
                      id="endDateInput"
                      className={`form-control`}
                      placeholder="Tanggal akhir"
                      value={endDate || ""}
                      ref={endDateInputRef}
                    />
                  </div>
                  <div className="form-check">
                    <div className="checkbox">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isSuccess}
                        onChange={(e) => {
                          setIsSuccess(!isSuccess);
                        }}
                      />
                      <label htmlFor="checkbox2">Transaksi Sukses </label>
                    </div>
                  </div>
                  <div className="form-check">
                    <div className="checkbox">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isPending}
                        onChange={() => setIsPending(!isPending)}
                      />
                      <label htmlFor="checkbox2">Transaksi Pending </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center ms-2">
                    <div className="me-2">Shift:</div>
                    <div>
                      <select
                        className="form-select"
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
              <div className="container mb-4">
                <div className="d-flex justify-content-center align-center" style={{ height: "300px", width: "100%" }}>
                  {/* Setting a fixed height to match the previous design */}
                  {selectedChart === 'bar' && <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                  {selectedChart === 'line' && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                  {selectedChart === 'pie' && <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                </div>
              </div>
              {/* Checkbox selection for charts */}
              <div className="d-flex align-items-center mb-2">
                <div className="me-2">Tampilkan Chart:</div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="barChart"
                    checked={selectedChart === 'bar'}
                    onChange={() => setSelectedChart('bar')}
                  />
                  <label className="form-check-label" htmlFor="barChart">Bar Chart</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="lineChart"
                    checked={selectedChart === 'line'}
                    onChange={() => setSelectedChart('line')}
                  />
                  <label className="form-check-label" htmlFor="lineChart">Line Chart</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="pieChart"
                    checked={selectedChart === 'pie'}
                    onChange={() => setSelectedChart('pie')}
                  />
                  <label className="form-check-label" htmlFor="pieChart">Pie Chart</label>
                </div>
              </div>

              <table className="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Status</th>
                    <th>Receipt Number</th>
                    <th>Name</th>
                    <th>Seat</th>
                    <th>Total</th>
                    <th>Cash</th>
                    <th>Change</th>
                    <th>Payment Type</th>
                    <th>Invoice Number</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>
                      <td style={{ color: report.status === 'Paid' ? '#198754' : report.status === 'Pending' ? '#6f42c1' : report.status === 'Canceled' ? '#dc3545' : report.status === 'Refunded' ? '#fd7e14' : '#000000' }}>
                        {report.status || "-"}
                      </td>
                      <td>{report.receipt_number || "-"}</td>
                      <td>{report.customer_name || "-"}</td>
                      <td>{report.customer_seat || "-"}</td>
                      <td>{report.total || "-"}</td>
                      <td>{report.customer_cash || "-"}</td>
                      <td>{report.customer_change || "-"}</td>
                      <td>{report.payment_type || "-"}</td>
                      <td>{report.invoice_number || "-"}</td>
                      <td>{report.invoice_due_date ? report.invoice_due_date : report.updated_at}</td>
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