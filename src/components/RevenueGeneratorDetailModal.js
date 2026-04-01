import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

export const RevenueGeneratorDetailModal = ({ show, onClose, batchId }) => {
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [batchData, setBatchData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingDetailProgress, setLoadingDetailProgress] = useState(0);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [loadingRefundDetail, setLoadingRefundDetail] = useState(false);
  const [loadingRefundDetailProgress, setLoadingRefundDetailProgress] = useState(0);
  const [refundsData, setRefundsData] = useState([]);
  const [expendituresData, setExpendituresData] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [loadingRefundsProgress, setLoadingRefundsProgress] = useState(0);
  const [loadingExpenditures, setLoadingExpenditures] = useState(false);
  const [loadingExpendituresProgress, setLoadingExpendituresProgress] = useState(0);
  
  // Print states - for new tab
  const [showCashierInput, setShowCashierInput] = useState(false);
  const [cashierNames, setCashierNames] = useState(['']);
  const [inputValues, setInputValues] = useState(['']); // Local state for immediate input response
  const debounceTimerRef = useRef(null);
  
  // Section checkboxes for download - default all checked
  const [downloadSections, setDownloadSections] = useState({
    expenditure: true,
    income: true,
    transactions: true,
    incomeDetail: true,
    refunded: true,
    report: true,
    shift: true
  });
  
  const loadingIntervalRef = useRef(null);

  // Months data
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  // Format currency
  const formatRupiah = (value) => {
    const number = Number(value);
    if (isNaN(number)) return value;
    return number.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  useEffect(() => {
    if (show && batchId) {
      fetchBatchDetail();
      setSelectedTransaction(null);
      setRefundsData([]);
      setExpendituresData([]);
      setCashierNames(['']);
      setInputValues(['']);
      setShowCashierInput(false);
      setDownloadSections({
        expenditure: true,
        income: true,
        transactions: true,
        incomeDetail: true,
        refunded: true,
        report: true,
        shift: true
      });
    }
  }, [show, batchId]);

  // Start loading progress
  const startLoadingProgress = (setProgress) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) progress = 95;
      setProgress(Math.floor(progress));
    }, 200);
    return interval;
  };

  const fetchBatchDetail = async () => {
    setLoading(true);
    setLoadingProgress(0);
    const interval = startLoadingProgress(setLoadingProgress);
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/logs/${batchId}`);
      if (response.data.success) {
        setBatchData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching batch detail:", error);
    } finally {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => setLoading(false), 200);
    }
  };

  // Fetch refunds for this batch
  const fetchRefunds = async () => {
    if (refundsData.length > 0) return;
    setLoadingRefunds(true);
    setLoadingRefundsProgress(0);
    const interval = startLoadingProgress(setLoadingRefundsProgress);
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/refunds/${batchId}`);
      if (response.data.success) {
        setRefundsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    } finally {
      clearInterval(interval);
      setLoadingRefundsProgress(100);
      setTimeout(() => setLoadingRefunds(false), 200);
    }
  };

  // Fetch expenditures for this batch
  const fetchExpenditures = async () => {
    if (expendituresData.length > 0) return;
    setLoadingExpenditures(true);
    setLoadingExpendituresProgress(0);
    const interval = startLoadingProgress(setLoadingExpendituresProgress);
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/expenditures/${batchId}`);
      if (response.data.success) {
        setExpendituresData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching expenditures:", error);
    } finally {
      clearInterval(interval);
      setLoadingExpendituresProgress(100);
      setTimeout(() => setLoadingExpenditures(false), 200);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'refunds') {
      fetchRefunds();
    } else if (tab === 'expenditures') {
      fetchExpenditures();
    }
  };

  // Fetch transaction detail with items
  const fetchTransactionDetail = async (transactionId) => {
    setLoadingDetail(true);
    setLoadingDetailProgress(0);
    const interval = startLoadingProgress(setLoadingDetailProgress);
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/transaction-detail/${transactionId}`);
      if (response.data.success) {
        setSelectedTransaction(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching transaction detail:", error);
    } finally {
      clearInterval(interval);
      setLoadingDetailProgress(100);
      setTimeout(() => {
        setLoadingDetail(false);
        setLoadingDetailProgress(0);
      }, 200);
    }
  };

  const fetchRefundDetail = async (refundId) => {
    setLoadingRefundDetail(true);
    setLoadingRefundDetailProgress(0);
    const interval = startLoadingProgress(setLoadingRefundDetailProgress);
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/refund-detail/${refundId}`);
      if (response.data.success) {
        setSelectedRefund(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching refund detail:", error);
    } finally {
      clearInterval(interval);
      setLoadingRefundDetailProgress(100);
      setTimeout(() => {
        setLoadingRefundDetail(false);
        setLoadingRefundDetailProgress(0);
      }, 200);
    }
  };

  // Cashier name management with debounce
  const addCashierName = () => {
    setCashierNames([...cashierNames, '']);
    setInputValues([...inputValues, '']);
  };

  const removeCashierName = (index) => {
    if (cashierNames.length > 1) {
      const newNames = cashierNames.filter((_, i) => i !== index);
      const newInputs = inputValues.filter((_, i) => i !== index);
      setCashierNames(newNames);
      setInputValues(newInputs);
    }
  };

  const updateCashierName = (index, value) => {
    // Update input immediately for responsive typing
    const newInputs = [...inputValues];
    newInputs[index] = value;
    setInputValues(newInputs);
    
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce state update by 500ms to reduce re-renders
    debounceTimerRef.current = setTimeout(() => {
      const newNames = [...cashierNames];
      newNames[index] = value;
      setCashierNames(newNames);
    }, 500);
  };

  // Handle print with cashier names - opens server-rendered HTML in new tab
  const handlePrintLaporanKasir = () => {
    const validCashierNames = cashierNames.filter(name => name.trim() !== '');
    if (validCashierNames.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Kasir Kosong',
        text: 'Harap isi minimal 1 nama kasir',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    // Build URL with cashier names as query param
    const cashiersParam = encodeURIComponent(validCashierNames.join(','));
    const printUrl = `${apiBaseUrl}/revenue-generator/print-report/${batchId}?cashiers=${cashiersParam}`;
    
    // Open server-rendered page directly - no need to fetch data on frontend
    const printWindow = window.open(printUrl, '_blank');
    
    if (!printWindow) {
      Swal.fire({
        icon: 'error',
        title: 'Popup Diblokir',
        text: 'Popup diblokir oleh browser. Silakan izinkan popup untuk situs ini.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  // Handle thermal print - 58mm thermal printer format
  const handlePrintThermal = () => {
    const validCashierNames = cashierNames.filter(name => name.trim() !== '');
    if (validCashierNames.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Kasir Kosong',
        text: 'Harap isi minimal 1 nama kasir',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    // Build URL with cashier names as query param
    const cashiersParam = encodeURIComponent(validCashierNames.join(','));
    const printUrl = `${apiBaseUrl}/revenue-generator/print-thermal/${batchId}?cashiers=${cashiersParam}`;
    
    // Open server-rendered thermal page in new tab
    const printWindow = window.open(printUrl, '_blank');
    
    if (!printWindow) {
      Swal.fire({
        icon: 'error',
        title: 'Popup Diblokir',
        text: 'Popup diblokir oleh browser. Silakan izinkan popup untuk situs ini.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  if (!show) return null;

  return (
    <div 
      className={`modal fade ${show ? "show" : ""}`} 
      style={{ display: show ? "block" : "none", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Detail Batch #{batchId}
            </h5>
            <div className="d-flex gap-2">
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <h5>Loading... {loadingProgress}%</h5>
                <div className="progress">
                  <div className="progress-bar" role="progressbar" style={{ width: `${loadingProgress}%` }} aria-valuenow={loadingProgress} aria-valuemin="0" aria-valuemax="100">{loadingProgress}%</div>
                </div>
              </div>
            ) : batchData ? (
              <div>
                {/* Header Info - Outlet, Periode, Status */}
                <div className="card mb-3 shadow-sm">
                  <div className="card-body py-2 px-3">
                    <div className="row align-items-center g-2">
                      <div className="col-md-4">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-shop text-primary me-2" style={{ fontSize: '1rem' }}></i>
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: '1' }}>Outlet</small>
                            <strong style={{ fontSize: '0.95rem' }}>{batchData.outlet_name}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar3 text-info me-2" style={{ fontSize: '1rem' }}></i>
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: '1' }}>Periode</small>
                            <strong style={{ fontSize: '0.95rem' }}>
                              {months.find(m => m.value === batchData.target_month)?.label} {batchData.target_year}
                            </strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-bullseye text-success me-2" style={{ fontSize: '1rem' }}></i>
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: '1' }}>Target Revenue</small>
                            <strong className="text-success" style={{ fontSize: '0.95rem' }}>Rp {formatRupiah(batchData.target_revenue)}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2 text-center">
                        <span className={`badge px-2 py-1 ${batchData.status === 'active' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.75rem' }}>
                          <i className={`bi ${batchData.status === 'active' ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                          {batchData.status === 'active' ? 'Active' : 'Rolled Back'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Summary Cards */}
                <div className="row mb-3 g-2">
                  <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: '3px solid #17a2b8' }}>
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Revenue Existing</p>
                            <h5 className="mb-0 fw-bold" style={{ color: '#17a2b8', fontSize: '1.1rem' }}>Rp {formatRupiah(batchData.existing_revenue)}</h5>
                          </div>
                          <i className="bi bi-database text-info" style={{ fontSize: '1rem' }}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: '3px solid #28a745' }}>
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Revenue Generated</p>
                            <h5 className="mb-0 fw-bold text-success" style={{ fontSize: '1.1rem' }}>Rp {formatRupiah(batchData.generated_revenue)}</h5>
                          </div>
                          <i className="bi bi-lightning-charge text-success" style={{ fontSize: '1rem' }}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: '3px solid #007bff' }}>
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Total Revenue</p>
                            <h5 className="mb-0 fw-bold text-primary" style={{ fontSize: '1.1rem' }}>Rp {formatRupiah(batchData.actual_total_revenue)}</h5>
                          </div>
                          <i className="bi bi-wallet2 text-primary" style={{ fontSize: '1rem' }}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid - List Format */}
                <div className="mb-3 p-2 border rounded bg-light">
                  <h6 className="mb-2 fw-bold" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-bar-chart-line me-1 text-primary" style={{ fontSize: '0.85rem' }}></i>
                    Statistik Data
                  </h6>
                  <div className="row g-1">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center py-1 px-2" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">
                          <i className="bi bi-receipt me-1" style={{ fontSize: '0.8rem' }}></i>
                          Transaksi
                        </span>
                        <strong>{formatRupiah(batchData.total_transactions_created || 0)}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center py-1 px-2" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">
                          <i className="bi bi-cart3 me-1" style={{ fontSize: '0.8rem' }}></i>
                          Carts
                        </span>
                        <strong>{formatRupiah(batchData.total_carts_created || 0)}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center py-1 px-2" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">
                          <i className="bi bi-box-seam me-1" style={{ fontSize: '0.8rem' }}></i>
                          Items
                        </span>
                        <strong>{formatRupiah(batchData.total_cart_details_created || 0)}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center py-1 px-2" style={{ fontSize: '0.85rem' }}>
                        <span className="text-warning">
                          <i className="bi bi-arrow-return-left me-1" style={{ fontSize: '0.8rem' }}></i>
                          Refund
                        </span>
                        <strong className="text-warning">{batchData.total_refunds_created || 0}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center py-1 px-2" style={{ fontSize: '0.85rem' }}>
                        <span className="text-danger">
                          <i className="bi bi-cash-stack me-1" style={{ fontSize: '0.8rem' }}></i>
                          Pengeluaran
                        </span>
                        <strong className="text-danger">{batchData.total_expenditures_created || 0}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center py-1 px-2" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">
                          <i className="bi bi-person-badge me-1" style={{ fontSize: '0.8rem' }}></i>
                          Created By
                        </span>
                        <strong className="text-truncate" style={{ maxWidth: '150px' }} title={batchData.generated_by_username || 'System'}>
                          {batchData.generated_by_username || 'System'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund & Expenditure Summary - List Format */}
                {(batchData.total_refund_amount > 0 || batchData.total_expenditure_amount > 0) && (
                  <div className="mb-3 p-2 border rounded" style={{ backgroundColor: '#fff8f0' }}>
                    {batchData.total_refund_amount > 0 && (
                      <div className="d-flex justify-content-between align-items-center py-1 px-2 mb-1">
                        <span className="text-warning" style={{ fontSize: '0.85rem' }}>
                          <i className="bi bi-arrow-counterclockwise me-1" style={{ fontSize: '0.8rem' }}></i>
                          Total Refund
                        </span>
                        <strong className="text-warning" style={{ fontSize: '0.9rem' }}>- Rp {formatRupiah(batchData.total_refund_amount)}</strong>
                      </div>
                    )}
                    {batchData.total_expenditure_amount > 0 && (
                      <div className="d-flex justify-content-between align-items-center py-1 px-2">
                        <span className="text-danger" style={{ fontSize: '0.85rem' }}>
                          <i className="bi bi-cash-coin me-1" style={{ fontSize: '0.8rem' }}></i>
                          Total Pengeluaran
                        </span>
                        <strong className="text-danger" style={{ fontSize: '0.9rem' }}>- Rp {formatRupiah(batchData.total_expenditure_amount)}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Options Used */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Opsi yang Digunakan</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-wrap gap-3">
                      <span className={`badge ${batchData.use_ppn ? 'bg-success' : 'bg-secondary'}`}>
                        {batchData.use_ppn ? '✓' : '✗'} PPN
                      </span>
                      <span className={`badge ${batchData.weekend_boost ? 'bg-success' : 'bg-secondary'}`}>
                        {batchData.weekend_boost ? '✓' : '✗'} Weekend Boost
                      </span>
                      <span className={`badge ${batchData.booking_mode ? 'bg-success' : 'bg-secondary'}`}>
                        {batchData.booking_mode ? '✓' : '✗'} Booking Mode
                      </span>
                      <span className={`badge ${batchData.generate_refunds ? 'bg-success' : 'bg-secondary'}`}>
                        {batchData.generate_refunds ? '✓' : '✗'} Generate Refunds
                      </span>
                      <span className={`badge ${batchData.generate_expenditures ? 'bg-success' : 'bg-secondary'}`}>
                        {batchData.generate_expenditures ? '✓' : '✗'} Generate Expenditures
                      </span>
                      {(batchData.math_perfect_mode === 1 || batchData.math_perfect_mode === true) && (
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-lightning-charge-fill me-1"></i>
                          Math Perfect Mode 🧪
                        </span>
                      )}
                      {batchData.price_adjustment_percent !== 0 && (
                        <span className="badge bg-info">
                          Price Adj: {batchData.price_adjustment_percent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Print Laporan Kasir Section (Collapsible) - Positioned after Options */}
                <div className="card mb-4 border-success">
                  <div 
                    className="card-header bg-success text-white d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowCashierInput(!showCashierInput)}
                  >
                    <h6 className="mb-0 text-white">
                      <i className="bi bi-printer me-2 text-white"></i>
                      Print Laporan Kasir
                    </h6>
                    <span className="text-white">{showCashierInput ? '▼' : '►'}</span>
                  </div>
                  {showCashierInput && (
                    <div className="card-body">
                      {/* Cashier Name Input */}
                      <div className="mb-3">
                        <label className="form-label">
                          <strong>Nama Kasir</strong>
                          <small className="text-muted ms-2">(bisa lebih dari satu)</small>
                        </label>
                        {inputValues.map((name, index) => (
                          <div key={index} className="input-group mb-2">
                            <span className="input-group-text">{index + 1}</span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nama kasir..."
                              value={name}
                              onChange={(e) => updateCashierName(index, e.target.value)}
                            />
                            {inputValues.length > 1 && (
                              <button 
                                className="btn btn-outline-danger"
                                type="button"
                                onClick={() => removeCashierName(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          type="button"
                          onClick={addCashierName}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Tambah Kasir
                        </button>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-success w-100 mb-2"
                        onClick={handlePrintLaporanKasir}
                      >
                        <i className="bi bi-printer me-1"></i>
                        Lihat Laporan Kasir (Buka di Tab Baru)
                      </button>

                      <button 
                        type="button" 
                        className="btn btn-outline-success w-100 mb-3"
                        onClick={handlePrintThermal}
                      >
                        <i className="bi bi-receipt me-1"></i>
                        Print Thermal 58mm
                      </button>
                      
                      {/* Section Checkboxes for Download */}
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
                                id="chkReport"
                                checked={true}
                                disabled
                              />
                              <label className="form-check-label small text-muted" htmlFor="chkReport">
                                Rincian Laporan (Default)
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="chkShift"
                                checked={true}
                                disabled
                              />
                              <label className="form-check-label small text-muted" htmlFor="chkShift">
                                Rincian Shift (Default)
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
                                onChange={(e) => setDownloadSections(prev => ({ ...prev, expenditure: e.target.checked }))}
                              />
                              <label className="form-check-label small" htmlFor="chkExpenditure">
                                Rincian Expenditure
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="chkIncome"
                                checked={downloadSections.income}
                                onChange={(e) => setDownloadSections(prev => ({ ...prev, income: e.target.checked }))}
                              />
                              <label className="form-check-label small" htmlFor="chkIncome">
                                Rincian Pemasukan
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="chkTransactions"
                                checked={downloadSections.transactions}
                                onChange={(e) => setDownloadSections(prev => ({ ...prev, transactions: e.target.checked }))}
                              />
                              <label className="form-check-label small" htmlFor="chkTransactions">
                                Semua Transaksi
                              </label>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="chkIncomeDetail"
                                checked={downloadSections.incomeDetail}
                                onChange={(e) => setDownloadSections(prev => ({ ...prev, incomeDetail: e.target.checked }))}
                              />
                              <label className="form-check-label small" htmlFor="chkIncomeDetail">
                                Detail Pemasukan
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="chkRefunded"
                                checked={downloadSections.refunded}
                                onChange={(e) => setDownloadSections(prev => ({ ...prev, refunded: e.target.checked }))}
                              />
                              <label className="form-check-label small" htmlFor="chkRefunded">
                                Pengeluaran / Refunded
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Download Buttons */}
                      <div className="row g-2">
                        <div className="col-4">
                          <button 
                            type="button" 
                            className="btn btn-outline-success w-100"
                            onClick={() => {
                              const validNames = cashierNames.filter(n => n.trim());
                              if (validNames.length === 0) {
                                Swal.fire({
                                  icon: 'warning',
                                  title: 'Nama Kasir Kosong',
                                  text: 'Harap isi minimal 1 nama kasir',
                                  toast: true,
                                  position: 'top-end',
                                  showConfirmButton: false,
                                  timer: 3000
                                });
                                return;
                              }
                              const cashiersParam = encodeURIComponent(validNames.join(','));
                              const sectionsParam = encodeURIComponent(JSON.stringify(downloadSections));
                              window.open(`${apiBaseUrl}/revenue-generator/download-excel/${batchId}?cashiers=${cashiersParam}&sections=${sectionsParam}`, '_blank');
                            }}
                          >
                            <i className="bi bi-file-earmark-excel me-1"></i>
                            Download Excel
                          </button>
                        </div>
                        <div className="col-4">
                          <button 
                            type="button" 
                            className="btn btn-outline-primary w-100"
                            onClick={() => {
                              const validNames = cashierNames.filter(n => n.trim());
                              if (validNames.length === 0) {
                                Swal.fire({
                                  icon: 'warning',
                                  title: 'Nama Kasir Kosong',
                                  text: 'Harap isi minimal 1 nama kasir',
                                  toast: true,
                                  position: 'top-end',
                                  showConfirmButton: false,
                                  timer: 3000
                                });
                                return;
                              }
                              const cashiersParam = encodeURIComponent(validNames.join(','));
                              const sectionsParam = encodeURIComponent(JSON.stringify(downloadSections));
                              window.open(`${apiBaseUrl}/revenue-generator/download-word/${batchId}?cashiers=${cashiersParam}&sections=${sectionsParam}`, '_blank');
                            }}
                          >
                            <i className="bi bi-file-earmark-word me-1"></i>
                            Download Word
                          </button>
                        </div>
                        <div className="col-4">
                          <button 
                            type="button" 
                            className="btn btn-outline-danger w-100"
                            onClick={() => {
                              const validNames = cashierNames.filter(n => n.trim());
                              if (validNames.length === 0) {
                                Swal.fire({
                                  icon: 'warning',
                                  title: 'Nama Kasir Kosong',
                                  text: 'Harap isi minimal 1 nama kasir',
                                  toast: true,
                                  position: 'top-end',
                                  showConfirmButton: false,
                                  timer: 3000
                                });
                                return;
                              }
                              const cashiersParam = encodeURIComponent(validNames.join(','));
                              const sectionsParam = encodeURIComponent(JSON.stringify(downloadSections));
                              window.open(`${apiBaseUrl}/revenue-generator/download-pdf/${batchId}?cashiers=${cashiersParam}&sections=${sectionsParam}`, '_blank');
                            }}
                          >
                            <i className="bi bi-file-earmark-pdf me-1"></i>
                            Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                      onClick={() => handleTabChange('summary')}
                    >
                      Daily Summary
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                      onClick={() => handleTabChange('transactions')}
                    >
                      Transactions ({batchData.transactions?.length || 0})
                    </button>
                  </li>
                  {batchData.total_refunds_created > 0 && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'refunds' ? 'active' : ''}`}
                        onClick={() => handleTabChange('refunds')}
                      >
                        <i className="bi bi-arrow-return-left me-1"></i>
                        Refunds ({batchData.total_refunds_created})
                      </button>
                    </li>
                  )}
                  {batchData.total_expenditures_created > 0 && (
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'expenditures' ? 'active' : ''}`}
                        onClick={() => handleTabChange('expenditures')}
                      >
                        <i className="bi bi-cash-stack me-1"></i>
                        Pengeluaran ({batchData.total_expenditures_created})
                      </button>
                    </li>
                  )}
                </ul>

                {/* Tab Content */}
                {activeTab === 'summary' && batchData.dailyBreakdown && (
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead className="table-dark">
                        <tr>
                          <th>Tanggal</th>
                          <th>Jumlah Transaksi</th>
                          <th>Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchData.dailyBreakdown.map((day, index) => (
                          <tr key={index}>
                            <td>
                              {new Date(day.date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </td>
                            <td>{day.transaction_count}</td>
                            <td>Rp {formatRupiah(day.daily_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-secondary">
                        <tr>
                          <th>Total</th>
                          <th>{batchData.dailyBreakdown.reduce((sum, d) => sum + d.transaction_count, 0)}</th>
                          <th>Rp {formatRupiah(batchData.dailyBreakdown.reduce((sum, d) => sum + parseFloat(d.daily_total), 0))}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {activeTab === 'transactions' && batchData.transactions && (
                  <div className="row">
                    {/* Transactions List */}
                    <div className={selectedTransaction ? "col-md-6" : "col-12"}>
                      <div className="table-responsive" style={{ maxHeight: "400px", overflow: "auto" }}>
                        <table className="table table-bordered table-striped table-sm table-hover">
                          <thead className="table-dark sticky-top">
                            <tr>
                              <th>#</th>
                              <th>Receipt Number</th>
                              <th>Customer</th>
                              <th>Seat</th>
                              <th>Payment</th>
                              <th>Total</th>
                              <th>Tanggal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batchData.transactions.map((trx, index) => (
                              <tr 
                                key={trx.transaction_id}
                                className={selectedTransaction?.transaction_id === trx.transaction_id ? 'table-primary' : ''}
                                style={{ cursor: 'pointer' }}
                                onClick={() => !loadingDetail && fetchTransactionDetail(trx.transaction_id)}
                              >
                                <td>{index + 1}</td>
                                <td><code style={{ fontSize: '0.75rem' }}>{trx.receipt_number}</code></td>
                                <td>{trx.customer_name}</td>
                                <td>{trx.customer_seat || '-'}</td>
                                <td><span className="badge bg-secondary">{trx.payment_type}</span></td>
                                <td>Rp {formatRupiah(trx.total)}</td>
                                <td style={{ fontSize: '0.8rem' }}>
                                  {new Date(trx.invoice_due_date).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Transaction Detail Panel */}
                    {selectedTransaction && (
                      <div className="col-md-6">
                        <div className="card border-primary">
                          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <span><i className="bi bi-receipt me-2"></i>Detail Transaksi</span>
                            <button 
                              className="btn btn-sm btn-light"
                              onClick={() => setSelectedTransaction(null)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                          <div className="card-body" style={{ maxHeight: "350px", overflow: "auto" }}>
                            {loadingDetail ? (
                              <div style={{ textAlign: "center", padding: "15px" }}>
                                <h6>Loading... {loadingDetailProgress}%</h6>
                                <div className="progress">
                                  <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${loadingDetailProgress}%` }} aria-valuenow={loadingDetailProgress} aria-valuemin="0" aria-valuemax="100">{loadingDetailProgress}%</div>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Transaction Info */}
                                <div className="mb-3">
                                  <table className="table table-sm table-borderless">
                                    <tbody>
                                      <tr>
                                        <td className="text-muted" style={{ width: '40%' }}>Invoice:</td>
                                        <td><code>{selectedTransaction.invoice_number}</code></td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted">Receipt:</td>
                                        <td><code>{selectedTransaction.receipt_number}</code></td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted">Transaction Ref:</td>
                                        <td><code style={{ fontSize: '0.75rem' }}>{selectedTransaction.transaction_ref}</code></td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted">Customer:</td>
                                        <td>{selectedTransaction.customer_name} (Seat: {selectedTransaction.customer_seat || '-'})</td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted">Payment:</td>
                                        <td>
                                          <span className="badge bg-info">{selectedTransaction.payment_type}</span>
                                          {selectedTransaction.payment_category && (
                                            <small className="text-muted ms-1">({selectedTransaction.payment_category})</small>
                                          )}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted">Cash:</td>
                                        <td>Rp {formatRupiah(selectedTransaction.customer_cash)}</td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted">Change:</td>
                                        <td>Rp {formatRupiah(selectedTransaction.customer_change)}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                {/* Items */}
                                <h6 className="border-bottom pb-2">
                                  <i className="bi bi-basket me-1"></i>
                                  Items ({selectedTransaction.items?.length || 0})
                                </h6>
                                {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                                  <table className="table table-sm table-striped">
                                    <thead>
                                      <tr>
                                        <th>Menu</th>
                                        <th>Varian</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-end">Harga</th>
                                        <th className="text-end">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedTransaction.items.map((item, idx) => (
                                        <tr key={idx}>
                                          <td>
                                            {item.menu_name}
                                            {item.menu_type && <small className="text-muted d-block">{item.menu_type}</small>}
                                          </td>
                                          <td>{item.varian || '-'}</td>
                                          <td className="text-center">{item.qty}</td>
                                          <td className="text-end">Rp {formatRupiah(item.price)}</td>
                                          <td className="text-end">Rp {formatRupiah(item.total_price)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="table-secondary">
                                      <tr>
                                        <th colSpan="3">Subtotal</th>
                                        <th colSpan="2" className="text-end">Rp {formatRupiah(selectedTransaction.subtotal)}</th>
                                      </tr>
                                      <tr>
                                        <th colSpan="3">Total</th>
                                        <th colSpan="2" className="text-end text-primary">Rp {formatRupiah(selectedTransaction.total)}</th>
                                      </tr>
                                    </tfoot>
                                  </table>
                                ) : (
                                  <p className="text-muted">Tidak ada item</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Refunds Tab Content */}
                {activeTab === 'refunds' && (
                  <div className="table-responsive">
                    {/* Refund Detail Panel (similar to transaction detail) */}
                    {selectedRefund && (
                      <div className="card mb-3 border-warning">
                        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            <i className="bi bi-receipt-cutoff me-2"></i>
                            Refund Detail: {selectedRefund.receipt_number}
                          </h6>
                          <button 
                            className="btn btn-sm btn-close" 
                            onClick={() => setSelectedRefund(null)}
                            disabled={loadingRefundDetail}
                          ></button>
                        </div>
                        <div className="card-body">
                          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {loadingRefundDetail ? (
                              <div className="text-center py-4">
                                <div className="spinner-border text-warning" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2">Loading refund detail... {loadingRefundDetailProgress}%</p>
                                <div className="progress" style={{ height: '5px' }}>
                                  <div className="progress-bar bg-warning" style={{ width: `${loadingRefundDetailProgress}%` }}></div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="row g-2 mb-3">
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Refund ID</small>
                                    <strong>#{selectedRefund.refund_id}</strong>
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Transaction Ref</small>
                                    <code>{selectedRefund.receipt_number}</code>
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Customer</small>
                                    <strong>{selectedRefund.customer_name}</strong>
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Seat</small>
                                    {selectedRefund.customer_seat || '-'}
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Refund Reason</small>
                                    <span className="badge bg-danger">{selectedRefund.refund_reason}</span>
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Payment Type</small>
                                    <span className="badge bg-secondary">{selectedRefund.payment_type}</span>
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Refund Date</small>
                                    {new Date(selectedRefund.refund_created_at).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">Transaction Date</small>
                                    {new Date(selectedRefund.transaction_created_at).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>

                                <h6 className="border-bottom pb-2 mb-2">
                                  <i className="bi bi-box-seam me-2"></i>
                                  Refunded Items ({selectedRefund.items?.length || 0})
                                </h6>
                                {selectedRefund.items && selectedRefund.items.length > 0 ? (
                                  <table className="table table-sm table-striped">
                                    <thead>
                                      <tr>
                                        <th>Menu</th>
                                        <th>Varian</th>
                                        <th className="text-center">Qty Refund</th>
                                        <th className="text-end">Harga</th>
                                        <th className="text-end">Total Refund</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedRefund.items.map((item, idx) => (
                                        <tr key={idx}>
                                          <td>
                                            {item.menu_name}
                                            {item.menu_type && <small className="text-muted d-block">{item.menu_type}</small>}
                                          </td>
                                          <td>{item.varian || '-'}</td>
                                          <td className="text-center">
                                            {item.qty_refund_item}
                                            <small className="text-muted d-block">of {item.original_qty}</small>
                                          </td>
                                          <td className="text-end">Rp {formatRupiah(item.price)}</td>
                                          <td className="text-end text-danger">-Rp {formatRupiah(item.total_refund_price)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="table-warning">
                                      <tr>
                                        <th colSpan="4">Total Refund</th>
                                        <th className="text-end text-danger">-Rp {formatRupiah(selectedRefund.total_refund)}</th>
                                      </tr>
                                    </tfoot>
                                  </table>
                                ) : (
                                  <p className="text-muted">Tidak ada item (Full refund)</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Refunds Table */}
                    {loadingRefunds ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <h5>Loading Refunds... {loadingRefundsProgress}%</h5>
                        <div className="progress">
                          <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${loadingRefundsProgress}%` }} aria-valuenow={loadingRefundsProgress} aria-valuemin="0" aria-valuemax="100">{loadingRefundsProgress}%</div>
                        </div>
                      </div>
                    ) : refundsData.length > 0 ? (
                      <table className="table table-bordered table-striped table-sm">
                        <thead className="table-warning">
                          <tr>
                            <th>#</th>
                            <th>Transaction</th>
                            <th>Customer</th>
                            <th>Alasan</th>
                            <th>Payment Type</th>
                            <th>Total Refund</th>
                            <th>Tanggal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {refundsData.map((refund, index) => (
                            <tr 
                              key={refund.refund_id}
                              onClick={() => !loadingRefundDetail && fetchRefundDetail(refund.refund_id)}
                              style={{ cursor: 'pointer' }}
                              className={selectedRefund?.refund_id === refund.refund_id ? 'table-warning' : ''}
                            >
                              <td>{index + 1}</td>
                              <td><code style={{ fontSize: '0.75rem' }}>{refund.receipt_number}</code></td>
                              <td>{refund.customer_name}</td>
                              <td>{refund.refund_reason}</td>
                              <td><span className="badge bg-secondary">{refund.payment_type}</span></td>
                              <td className="text-danger">-Rp {formatRupiah(refund.total_refund)}</td>
                              <td style={{ fontSize: '0.8rem' }}>
                                {new Date(refund.created_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-warning">
                          <tr>
                            <th colSpan="5">Total Refund</th>
                            <th colSpan="2" className="text-danger">-Rp {formatRupiah(refundsData.reduce((sum, r) => sum + parseFloat(r.total_refund), 0))}</th>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                        <p className="mt-2">Tidak ada data refund</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Expenditures Tab Content */}
                {activeTab === 'expenditures' && (
                  <div className="table-responsive">
                    {loadingExpenditures ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <h5>Loading Pengeluaran... {loadingExpendituresProgress}%</h5>
                        <div className="progress">
                          <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${loadingExpendituresProgress}%` }} aria-valuenow={loadingExpendituresProgress} aria-valuemin="0" aria-valuemax="100">{loadingExpendituresProgress}%</div>
                        </div>
                      </div>
                    ) : expendituresData.length > 0 ? (
                      <table className="table table-bordered table-striped table-sm">
                        <thead className="table-danger">
                          <tr>
                            <th>#</th>
                            <th>Deskripsi</th>
                            <th>Nominal</th>
                            <th>Tanggal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expendituresData.map((exp, index) => (
                            <tr key={exp.expenditure_id}>
                              <td>{index + 1}</td>
                              <td>{exp.description}</td>
                              <td className="text-danger">-Rp {formatRupiah(exp.nominal)}</td>
                              <td style={{ fontSize: '0.8rem' }}>
                                {new Date(exp.created_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-danger">
                          <tr>
                            <th colSpan="2">Total Pengeluaran</th>
                            <th colSpan="2" className="text-danger">-Rp {formatRupiah(expendituresData.reduce((sum, e) => sum + parseFloat(e.nominal), 0))}</th>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                        <p className="mt-2">Tidak ada data pengeluaran</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Rollback Info */}
                {batchData.status === 'rolled_back' && (
                  <div className="alert alert-warning mt-4">
                    <h6><i className="bi bi-exclamation-triangle me-2"></i>Batch ini sudah di-rollback</h6>
                    <ul className="mb-0">
                      <li>Rolled back at: {new Date(batchData.rolled_back_at).toLocaleString('id-ID')}</li>
                      <li>Rolled back by: {batchData.rolled_back_by_username || 'Unknown'}</li>
                    </ul>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-muted mt-4" style={{ fontSize: "0.85rem" }}>
                  <p className="mb-1">
                    <strong>Created:</strong> {new Date(batchData.created_at).toLocaleString('id-ID')}
                  </p>
                  <p className="mb-0">
                    <strong>Updated:</strong> {new Date(batchData.updated_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-exclamation-circle" style={{ fontSize: "3rem" }}></i>
                <p className="mt-2">Data tidak ditemukan</p>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueGeneratorDetailModal;
