import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { RevenueGeneratorDetailModal } from "./RevenueGeneratorDetailModal";
import { RevenueGeneratorDocModal } from "./RevenueGeneratorDocModal";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const RevenueGenerator = ({ userTokenData }) => {
  // Form states
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [targetRevenue, setTargetRevenue] = useState("");
  const [usePpn, setUsePpn] = useState(true);
  const [ppnPercent, setPpnPercent] = useState(10);
  const [weekendBoost, setWeekendBoost] = useState(true);
  const [bookingMode, setBookingMode] = useState(true);
  const [generateRefunds, setGenerateRefunds] = useState(true);
  const [generateExpenditures, setGenerateExpenditures] = useState(true);
  const [mathPerfectMode, setMathPerfectMode] = useState(false);
  
  // Data states
  const [outlets, setOutlets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [templateMenus, setTemplateMenus] = useState([]);
  const [excludedMenuIds, setExcludedMenuIds] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rollingBackId, setRollingBackId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  
  // Refs
  const loadingIntervalRef = useRef(null);
  const debounceRef = useRef(null);

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

  // Years (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Format currency
  const formatRupiah = (value) => {
    const number = Number(value);
    if (isNaN(number)) return value;
    return number.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Load outlets and logs on mount
  useEffect(() => {
    fetchOutlets();
    fetchLogs();
    fetchTemplateMenus();
  }, []);

  // Debounce preview calculation when inputs change
  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only run if all required fields are filled
    if (selectedOutlet && selectedMonth && selectedYear && targetRevenue) {
      setLoadingPreview(true);
      debounceRef.current = setTimeout(() => {
        fetchPreview();
      }, 500); // 500ms debounce
    } else {
      setPreviewData(null);
      setLoadingPreview(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [selectedOutlet, selectedMonth, selectedYear, targetRevenue]);

  // Fetch preview data
  const fetchPreview = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/preview`, {
        params: {
          outlet_id: selectedOutlet,
          month: selectedMonth,
          year: selectedYear,
          target_revenue: parseFloat(targetRevenue.replace(/\./g, "")),
          excluded_menu_ids: excludedMenuIds.join(',')
        }
      });

      if (response.data.success) {
        setPreviewData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching preview:", error);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Fetch outlets for dropdown
  const fetchOutlets = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/outlets`);
      if (response.data.success) {
        setOutlets(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
    }
  };

  // Fetch template menus for optional exclusion
  const fetchTemplateMenus = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/template-menus`);
      if (response.data.success) {
        setTemplateMenus(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching template menus:', error);
    }
  };

  // Fetch all generation logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/revenue-generator/logs`);
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate revenue
  const handleGenerate = async () => {
    if (!selectedOutlet || !selectedMonth || !selectedYear || !targetRevenue) {
      Swal.fire({
        icon: "warning",
        title: "Data Tidak Lengkap",
        text: "Silakan lengkapi semua field yang diperlukan"
      });
      return;
    }

    // Confirmation
    const result = await Swal.fire({
      title: "Konfirmasi Generate",
      html: `
        <p>Anda akan men-generate transaksi untuk:</p>
        <ul style="text-align: left;">
          <li>Outlet: ${outlets.find(o => o.id === parseInt(selectedOutlet))?.name || selectedOutlet}</li>
          <li>Periode: ${months.find(m => m.value === parseInt(selectedMonth))?.label} ${selectedYear}</li>
          <li>Target: Rp ${formatRupiah(targetRevenue.replace(/\./g, ""))}</li>
        </ul>
        <p><strong>Proses ini tidak dapat dibatalkan secara otomatis!</strong></p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Generate!",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    setGenerating(true);
    setLoadingProgress(0);
    
    // Start progress interval
    loadingIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 2, 95));
    }, 500);

    try {
      const response = await axios.post(`${apiBaseUrl}/revenue-generator/generate`, {
        outlet_id: parseInt(selectedOutlet),
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        target_revenue: parseFloat(targetRevenue.replace(/\./g, "")),
        use_ppn: usePpn,
        ppn_percent: ppnPercent,
        weekend_boost: weekendBoost,
        booking_mode: bookingMode,
        generate_refunds: generateRefunds,
        generate_expenditures: generateExpenditures,
        math_perfect_mode: mathPerfectMode,
        excluded_menu_ids: excludedMenuIds,
        user_id: userTokenData?.id,
        username: userTokenData?.username || userTokenData?.name
      });

      clearInterval(loadingIntervalRef.current);
      setLoadingProgress(100);

      if (response.data.success) {
        let resultHtml = `
            <p>Revenue berhasil di-generate!</p>
            <ul style="text-align: left;">
              <li>Transaksi dibuat: ${response.data.data.transactions_created}</li>
              <li>Revenue generated: Rp ${formatRupiah(response.data.data.generated_revenue)}</li>
              <li>Total revenue: Rp ${formatRupiah(response.data.data.actual_total_revenue)}</li>
            </ul>
        `;
        
        if (response.data.data.refunds_created > 0) {
          resultHtml += `
            <ul style="text-align: left;">
              <li>Refund dibuat: ${response.data.data.refunds_created}</li>
              <li>Total refund: Rp ${formatRupiah(response.data.data.total_refund_amount)}</li>
            </ul>
          `;
        }
        
        if (response.data.data.expenditures_created > 0) {
          resultHtml += `
            <ul style="text-align: left;">
              <li>Pengeluaran dibuat: ${response.data.data.expenditures_created}</li>
              <li>Total pengeluaran: Rp ${formatRupiah(response.data.data.total_expenditure_amount)}</li>
            </ul>
          `;
        }
        
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: resultHtml
        });
        
        // Reset form
        setPreviewData(null);
        setTargetRevenue("");
        
        // Refresh logs
        fetchLogs();
      }
    } catch (error) {
      clearInterval(loadingIntervalRef.current);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Gagal men-generate revenue"
      });
    } finally {
      setGenerating(false);
      setLoadingProgress(0);
    }
  };

  // Rollback batch
  const handleRollback = async (batchId, outletName, month, year) => {
    const result = await Swal.fire({
      title: "Konfirmasi Rollback",
      html: `
        <p>Anda akan menghapus semua transaksi generated untuk:</p>
        <ul style="text-align: left;">
          <li>Outlet: ${outletName}</li>
          <li>Periode: ${months.find(m => m.value === month)?.label} ${year}</li>
          <li>Batch ID: ${batchId}</li>
        </ul>
        <p><strong>Semua transaksi dalam batch ini akan dihapus!</strong></p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Rollback!",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    setRollingBackId(batchId);
    
    // Show loading dialog
    Swal.fire({
      title: "Memproses Rollback...",
      html: `<p>Menghapus data batch #${batchId}</p><p>Mohon tunggu...</p>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await axios.post(`${apiBaseUrl}/revenue-generator/rollback/${batchId}`, {
        user_id: userTokenData?.id,
        username: userTokenData?.username || userTokenData?.name
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Rollback berhasil dilakukan"
        });
        fetchLogs();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Gagal melakukan rollback"
      });
    } finally {
      setRollingBackId(null);
    }
  };

  // Hard delete batch (requires admin password)
  const handleHardDelete = async (batchId, outletName, month, year) => {
    const { value: password } = await Swal.fire({
      title: "Konfirmasi Hard Delete",
      html: `
        <p><strong style="color: red;">⚠️ PERHATIAN: Ini adalah HARD DELETE!</strong></p>
        <p>Data akan dihapus permanen dari database, tidak bisa dikembalikan!</p>
        <ul style="text-align: left;">
          <li>Outlet: ${outletName}</li>
          <li>Periode: ${months.find(m => m.value === month)?.label} ${year}</li>
          <li>Batch ID: ${batchId}</li>
        </ul>
        <p>Masukkan password admin untuk melanjutkan:</p>
      `,
      input: "password",
      inputPlaceholder: "Password Admin",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Hapus Permanen!",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value) {
          return "Password harus diisi!";
        }
      }
    });

    if (!password) return;

    setDeletingId(batchId);
    
    // Show loading dialog
    Swal.fire({
      title: "Memproses Hard Delete...",
      html: `<p>Menghapus permanen data batch #${batchId}</p><p>Mohon tunggu...</p>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await axios.delete(`${apiBaseUrl}/revenue-generator/hard-delete/${batchId}`, {
        data: {
          admin_password: password,
          user_id: userTokenData?.id,
          username: userTokenData?.username || userTokenData?.name
        }
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: `
            <p>Data berhasil dihapus permanen!</p>
            <ul style="text-align: left;">
              <li>Transaksi dihapus: ${response.data.data.transactions_deleted}</li>
              <li>Carts dihapus: ${response.data.data.carts_deleted}</li>
              <li>Refund dihapus: ${response.data.data.refunds_deleted}</li>
              <li>Pengeluaran dihapus: ${response.data.data.expenditures_deleted}</li>
            </ul>
          `
        });
        fetchLogs();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Gagal melakukan hard delete"
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Cleanup all rolled back batches
  const handleCleanup = async () => {
    const result = await Swal.fire({
      title: "Cleanup Data",
      html: `
        <p>Ini akan membersihkan semua data generated yang tersisa dari batch yang sudah di-rollback.</p>
        <p><strong>Gunakan ini jika preview masih menunjukkan data dari batch yang sudah di-rollback.</strong></p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Cleanup!",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.post(`${apiBaseUrl}/revenue-generator/cleanup`);
      
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Cleanup Berhasil!",
          html: `
            <ul style="text-align: left;">
              <li>Batch dibersihkan: ${response.data.data.cleaned_batches}</li>
              <li>Transaksi dihapus: ${response.data.data.transactions_deleted}</li>
              <li>Carts dihapus: ${response.data.data.carts_deleted}</li>
            </ul>
          `
        });
        fetchLogs();
        setPreviewData(null);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Gagal melakukan cleanup"
      });
    }
  };

  // Open detail modal
  const openDetailModal = (batchId) => {
    setSelectedBatchId(batchId);
    setShowDetailModal(true);
  };

  // Handle target revenue input with formatting
  const handleTargetRevenueChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value) {
      value = parseInt(value).toLocaleString("id-ID").replace(/,/g, ".");
    }
    setTargetRevenue(value);
  };

  // Check if user can access this feature (outlet 0 or 4)
  const canAccess = userTokenData?.outlet_id === 0 || userTokenData?.outlet_id === 4;

  if (!canAccess) {
    return (
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12">
              <div className="alert alert-danger">
                <h4>Akses Ditolak</h4>
                <p>Anda tidak memiliki akses ke fitur ini.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Revenue Generator</h3>
              <p className="text-subtitle text-muted">Generate transaksi</p>
            </div>
            <div className="col-12 col-md-6 order-md-2 order-first">
              <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowDocModal(true)}
                >
                  <i className="bi bi-book me-2"></i>
                  Dokumentasi
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Generator Form */}
        <section className="section">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Generate Revenue Baru</h4>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Outlet Selection */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Outlet Tujuan</label>
                  <select 
                    className="form-select"
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                  >
                    <option value="">-- Pilih Outlet --</option>
                    {outlets.map(outlet => (
                      <option 
                        key={outlet.id} 
                        value={outlet.id}
                        disabled={!outlet.is_selectable}
                      >
                        {outlet.name} {!outlet.is_selectable ? "(Tidak tersedia)" : ""}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">Hanya outlet ID 4 dan di atas 12 yang bisa dipilih</small>
                </div>

                {/* Month Selection */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Bulan</label>
                  <select 
                    className="form-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="">-- Pilih Bulan --</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Selection */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Tahun</label>
                  <select 
                    className="form-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Target Revenue */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Target Pendapatan (Rp)</label>
                  <div className="input-group">
                    <span className="input-group-text">Rp</span>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="Contoh: 100.000.000"
                      value={targetRevenue}
                      onChange={handleTargetRevenueChange}
                    />
                  </div>
                </div>

                {/* Opsi Tambahan */}
                <div className="col-12 mb-3">
                  <button 
                    className="btn btn-outline-secondary w-100" 
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    {showAdvancedOptions ? 'Sembunyikan Opsi Tambahan' : 'Tampilkan Opsi Tambahan'}
                  </button>
                  {showAdvancedOptions && (
                    <div className="mt-3 p-3 border rounded">
                      {/* Gunakan PPN */}
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="usePpn"
                          checked={usePpn}
                          onChange={(e) => setUsePpn(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="usePpn">
                          <strong>Gunakan PPN</strong>
                          <br/>
                          <small className="text-muted">
                            Menambahkan pajak ke setiap transaksi. <strong>TIDAK berlaku</strong> untuk pembayaran online delivery (GoFood, GrabFood, ShopeeFood) karena sudah include. Default: 10%.
                          </small>
                        </label>
                      </div>
                      {usePpn && (
                        <div className="mb-3">
                          <label className="form-label">Persentase PPN (%)</label>
                          <input
                            type="number"
                            className="form-control"
                            min={0}
                            max={100}
                            value={ppnPercent}
                            onChange={(e) => setPpnPercent(parseFloat(e.target.value || 0))}
                          />
                          <small className="text-muted">Masukkan persentase PPN yang ingin diterapkan (mis. 10)</small>
                        </div>
                      )}

                      {/* Kecualikan Menu */}
                      <div className="mb-3">
                        <label className="form-label">Kecualikan Menu (opsional)</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Cari menu..."
                          value={menuSearchQuery}
                          onChange={(e) => setMenuSearchQuery(e.target.value)}
                        />
                        <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: 4, padding: 8 }}>
                          {templateMenus.filter(m => {
                            if (!menuSearchQuery) return true;
                            const q = menuSearchQuery.toLowerCase();
                            return (m.name || '').toLowerCase().includes(q) || (m.details && m.details.some(d => (d.varian || '').toLowerCase().includes(q)));
                          }).map(m => (
                            <div key={m.id} className="form-check" style={{ padding: '2px 6px' }}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`exclude-menu-${m.id}`}
                                checked={excludedMenuIds.includes(m.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setExcludedMenuIds(prev => Array.from(new Set([...prev, m.id])));
                                  } else {
                                    setExcludedMenuIds(prev => prev.filter(x => x !== m.id));
                                  }
                                }}
                              />
                              <label className="form-check-label ms-2" htmlFor={`exclude-menu-${m.id}`} style={{ cursor: 'pointer' }}>
                                {m.name}{m.details && m.details.length ? ` (${m.details.map(d=>d.varian).join(', ')})` : ''}
                              </label>
                            </div>
                          ))}
                          {templateMenus.length === 0 && <div className="text-muted">Tidak ada menu template.</div>}
                        </div>
                        <div className="mt-2">
                          {excludedMenuIds.length === 0 ? (
                            <small className="text-muted">Belum ada menu yang dipilih.</small>
                          ) : (
                            <div className="d-flex flex-wrap gap-2">
                              {excludedMenuIds.map(id => {
                                const m = templateMenus.find(x => x.id === id);
                                return (
                                  <span key={id} className="badge bg-secondary d-inline-flex align-items-center">
                                    <span style={{marginRight:8}}>{m ? m.name : `ID:${id}`}</span>
                                    <button type="button" className="btn-close btn-close-white btn-sm" onClick={() => setExcludedMenuIds(prev => prev.filter(x => x !== id))} aria-label="Remove" />
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Weekend Boost */}
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="weekendBoost"
                          checked={weekendBoost}
                          onChange={(e) => setWeekendBoost(e.target.checked)}
                          disabled
                        />
                        <label className="form-check-label" htmlFor="weekendBoost">
                          <strong>Weekend Lebih Ramai</strong>
                          <br/>
                          <small className="text-muted">
                            Distribusi transaksi di hari Sabtu & Minggu akan 1.5x - 2.5x lebih banyak dari hari biasa, menyesuaikan pola bisnis real.
                          </small>
                        </label>
                      </div>

                      {/* Booking Mode */}
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="bookingMode"
                          checked={bookingMode}
                          onChange={(e) => setBookingMode(e.target.checked)}
                          disabled
                        />
                        <label className="form-check-label" htmlFor="bookingMode">
                          <strong>Mode Booking</strong>
                          <br/>
                          <small className="text-muted">
                            Menambahkan beberapa transaksi besar (booking/reservasi) dengan jumlah item lebih banyak per transaksi, biasanya untuk acara atau group dining.
                          </small>
                        </label>
                      </div>

                      {/* Generate Refunds */}
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="generateRefunds"
                          checked={generateRefunds}
                          onChange={(e) => setGenerateRefunds(e.target.checked)}
                          disabled
                        />
                        <label className="form-check-label" htmlFor="generateRefunds">
                          <strong>Generate Refund</strong>
                          <br/>
                          <small className="text-muted">
                            Membuat data refund palsu (1-3 refund per hari) dari transaksi yang sudah di-generate, dengan alasan refund acak.
                          </small>
                        </label>
                      </div>

                      {/* Generate Expenditures */}
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="generateExpenditures"
                          checked={generateExpenditures}
                          onChange={(e) => setGenerateExpenditures(e.target.checked)}
                          disabled
                        />
                        <label className="form-check-label" htmlFor="generateExpenditures">
                          <strong>Generate Pengeluaran</strong>
                          <br/>
                          <small className="text-muted">
                            Membuat data pengeluaran palsu (2-5 pengeluaran per hari) dengan nominal Rp 5.000 - Rp 200.000 dan deskripsi acak seperti "Beli gas LPG", "Beli minyak goreng", dll.
                          </small>
                        </label>
                      </div>

                      {/* Math Perfect Mode */}
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="mathPerfectMode"
                          checked={mathPerfectMode}
                          onChange={(e) => setMathPerfectMode(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="mathPerfectMode">
                          <strong>Math Perfect Mode</strong> <span className="badge bg-warning text-dark">Experimental</span>
                          <br/>
                          <small className="text-muted">
                            Mode eksperimental yang mencapai target EXACT dengan formula: <strong>Target = Transaksi - Refund</strong> (tanpa expenditure). 
                            Algoritma akan mencari kombinasi menu yang tepat untuk mencapai nilai target yang presisi. Expenditure tetap ada tapi tidak dihitung dalam pencapaian target.
                          </small>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Section */}
              {loadingPreview && (
                <div className="alert alert-secondary mt-3">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>
                      <h6 className="mb-0">Menghitung Preview Kalkulasi...</h6>
                      <small className="text-muted">Mengambil data revenue existing</small>
                    </div>
                  </div>
                </div>
              )}
              {!loadingPreview && previewData && (
                <div className={`alert ${previewData.is_target_exceeded ? 'alert-warning' : 'alert-info'} mt-3`}>
                  <h5><i className="bi bi-calculator me-2"></i>Preview Kalkulasi</h5>
                  <ul className="mb-0">
                    <li>Revenue Existing: <strong>Rp {formatRupiah(previewData.existing_revenue)}</strong></li>
                    <li>Target Revenue: <strong>Rp {formatRupiah(previewData.target_revenue)}</strong></li>
                    <li>
                      Perlu Generate: 
                      <strong className={previewData.is_target_exceeded ? 'text-danger' : 'text-success'}>
                        {previewData.is_target_exceeded 
                          ? ' Target sudah tercapai!' 
                          : ` Rp ${formatRupiah(previewData.revenue_to_generate)}`}
                      </strong>
                    </li>
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 mt-3">
                <button 
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={generating || (previewData && previewData.is_target_exceeded)}
                >
                  {generating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Generating... {loadingProgress}%
                    </>
                  ) : (
                    <>
                      <i className="bi bi-gear me-1"></i>
                      Generate Revenue
                    </>
                  )}
                </button>
              </div>

              {/* Progress bar when generating */}
              {generating && (
                <div className="progress mt-3" style={{ height: "20px" }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: `${loadingProgress}%` }}
                    aria-valuenow={loadingProgress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {loadingProgress}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Generated Revenue History */}
        <section className="section">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Riwayat Generate</h4>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={handleCleanup}
                  title="Bersihkan data generated dari batch yang sudah di-rollback"
                >
                  <i className="bi bi-trash me-1"></i> Cleanup
                </button>
                <button className="btn btn-sm btn-outline-primary" onClick={fetchLogs}>
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i>
                  <p className="mt-2">Belum ada data generate</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Outlet</th>
                        <th>Periode</th>
                        <th>Target</th>
                        <th>Generated</th>
                        <th>Total</th>
                        <th>Trx</th>
                        <th>Refund</th>
                        <th>Pengeluaran</th>
                        <th>Status</th>
                        <th>Dibuat</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td>{log.outlet_name}</td>
                          <td>
                            {months.find(m => m.value === log.target_month)?.label} {log.target_year}
                          </td>
                          <td>Rp {formatRupiah(log.target_revenue)}</td>
                          <td>Rp {formatRupiah(log.generated_revenue)}</td>
                          <td>Rp {formatRupiah(log.actual_total_revenue)}</td>
                          <td>{log.total_transactions_created || 0}</td>
                          <td>
                            {log.total_refunds_created > 0 ? (
                              <span className="badge bg-warning text-dark">
                                {log.total_refunds_created}
                              </span>
                            ) : '-'}
                          </td>
                          <td>
                            {log.total_expenditures_created > 0 ? (
                              <span className="badge bg-info">
                                {log.total_expenditures_created}
                              </span>
                            ) : '-'}
                          </td>
                          <td>
                            <span className={`badge ${log.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {log.status === 'active' ? 'Active' : 'Rolled Back'}
                            </span>
                          </td>
                          <td>
                            {new Date(log.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-info"
                                onClick={() => openDetailModal(log.id)}
                                title="Lihat Detail"
                                disabled={rollingBackId === log.id || deletingId === log.id}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              {log.status === 'active' && (
                                <button 
                                  className="btn btn-warning"
                                  onClick={() => handleRollback(log.id, log.outlet_name, log.target_month, log.target_year)}
                                  title="Rollback (Soft Delete)"
                                  disabled={rollingBackId === log.id || deletingId === log.id}
                                >
                                  {rollingBackId === log.id ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                  ) : (
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                  )}
                                </button>
                              )}
                              <button 
                                className="btn btn-danger"
                                onClick={() => handleHardDelete(log.id, log.outlet_name, log.target_month, log.target_year)}
                                title="Hard Delete (Hapus Permanen)"
                                disabled={rollingBackId === log.id || deletingId === log.id}
                              >
                                {deletingId === log.id ? (
                                  <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Detail Modal */}
      <RevenueGeneratorDetailModal 
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        batchId={selectedBatchId}
      />

      {/* Documentation Modal */}
      <RevenueGeneratorDocModal 
        show={showDocModal}
        onHide={() => setShowDocModal(false)}
      />
    </div>
  );
};

export default RevenueGenerator;
