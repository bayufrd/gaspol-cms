import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import TaxFullscreen from "./TaxFullscreen";
import TaxDonationDestinationModal from "./TaxDonationDestinationModal";

const Tax = ({ userTokenData }) => {
    const [taxData, setTaxData] = useState(null);
    // default charts hidden
    const [showTaxChart, setShowTaxChart] = useState(false);
    const [showDonasiChart, setShowDonasiChart] = useState(false);
    // pagination for latest list
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const outletId = userTokenData?.outlet_id;
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const [showDonationModal, setShowDonationModal] = useState(false);

    const fetchTax = async () => {
        if (!outletId) return;
        try {
            const res = await axios.get(`${apiBaseUrl}/tax/${outletId}`);
            setTaxData(res.data.data);
        } catch (err) {
            console.error("Gagal ambil data pajak:", err);
        }
    };

    useEffect(() => {
        fetchTax();
        const interval = setInterval(fetchTax, 30000);
        return () => clearInterval(interval);
    }, [outletId, apiBaseUrl]);

    const totalNominal = taxData?.total_nominal || 0;
    const totalDonasi = taxData?.total_donasi || 0;
    const totalDonasiRaw = taxData?.total_donasi_raw || 0;
    const totalDonationDistributed = taxData?.total_donation_distributed || 0;
    const dailyChart = taxData?.daily_chart || [];
    const latestTaxes = taxData?.latestTaxes || [];
    const totalPages = Math.max(1, Math.ceil(latestTaxes.length / pageSize));
    // ensure current page is valid when data changes
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [latestTaxes.length, currentPage, totalPages]);

    const paginatedTaxes = latestTaxes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const lineChartDataTax = {
        labels: dailyChart.map((d) => d.date),
        datasets: [
            {
                label: "Total Pajak per Hari (IDR)",
                data: dailyChart.map((d) => d.total || 0),
                borderColor: "rgba(255,99,132,1)",
                backgroundColor: "rgba(255,99,132,0.15)",
                fill: true,
                tension: 0.3,
            },
        ],
    };

    const lineChartDataDonasi = {
        labels: dailyChart.map((d) => d.date),
        datasets: [
            {
                label: "Total Donasi per Hari (IDR)",
                data: dailyChart.map((d) => d.total_donasi || 0),
                borderColor: "rgba(54,162,235,1)",
                backgroundColor: "rgba(54,162,235,0.15)",
                fill: true,
                tension: 0.3,
            },
        ],
    };

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last mb-1">
                        <h3>Management Tax</h3>
                        <p className="text-muted">Dashboard Statistik Pajak & Donasi</p>
                    </div>
                    <div className="col-12 col-md-6 text-end">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                                const target = outletId ? `/tax-fullscreen/${outletId}` : "/tax-fullscreen";
                                window.location.href = target;
                            }}
                        >
                            <i className="bi bi-arrows-fullscreen"></i> Fullscreen
                        </button>
                    </div>
                </div>
            </div>

            <section className="section">
                <div className="row">
                    <div className="col-md-3 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Pajak</h5>
                                <h3 className="text-primary">Rp {totalNominal.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Donasi Terkumpul</h5>
                                <h3 className="text-primary">Rp {totalDonasiRaw.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Donasi Tertampung</h5>
                                <h3 className="text-danger">Rp {totalDonasi.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Dana Tersalurkan</h5>
                                <h3 className="text-primary">Rp {totalDonationDistributed.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Grafik Total Pajak per Hari</div>
                                <div>
                                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setShowTaxChart((s) => !s)}>
                                        {showTaxChart ? 'Sembunyikan' : 'Tampilkan'}
                                    </button>
                                </div>
                            </div>
                            {showTaxChart && (
                                <div className="card-body" style={{ height: "250px" }}>
                                    <Line data={lineChartDataTax} options={{ maintainAspectRatio: false }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Grafik Total Donasi per Hari</div>
                                <div>
                                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setShowDonasiChart((s) => !s)}>
                                        {showDonasiChart ? 'Sembunyikan' : 'Tampilkan'}
                                    </button>
                                </div>
                            </div>
                            {showDonasiChart && (
                                <div className="card-body" style={{ height: "250px" }}>
                                    <Line data={lineChartDataDonasi} options={{ maintainAspectRatio: false }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Daftar Pajak & Donasi Terakhir</div>
                            <div className="card-body">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Customer</th>
                                            <th>Transaction Ref</th>
                                            <th>Nominal Tax (IDR)</th>
                                            <th>Donasi (IDR)</th>
                                            <th>Tipe Pembayaran</th>
                                            <th>Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTaxes.map((t, i) => (
                                            <tr key={t.id || ((currentPage - 1) * pageSize) + i}>
                                                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                                                <td>{t.customer_name || t.nama || "-"}</td>
                                                <td>{t.transaction_ref_tax || t.transaction_ref || t.ref || "-"}</td>
                                                <td>{(t.pajak_nominal || t.nominal || t.amount || 0).toLocaleString && (t.pajak_nominal || t.nominal || t.amount || 0).toLocaleString("id-ID")}</td>
                                                <td>{(t.pajak_donasi || t.donasi || t.jumlah || 0).toLocaleString && (t.pajak_donasi || t.donasi || t.jumlah || 0).toLocaleString("id-ID")}</td>
                                                <td>{t.pajak_payment_type || t.payment_type || t.tipe || "-"}</td>
                                                <td>{t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID") : (t.date ? new Date(t.date).toLocaleDateString("id-ID") : "-")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* pagination controls */}
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <div className="text-muted">Menampilkan {paginatedTaxes.length} dari {latestTaxes.length} data</div>
                                    <div>
                                        <button className="btn btn-sm btn-outline-secondary me-1" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                                            Prev
                                        </button>
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <button key={idx} className={`btn btn-sm ${currentPage === idx + 1 ? 'btn-primary' : 'btn-outline-secondary'} me-1`} onClick={() => setCurrentPage(idx + 1)}>
                                                {idx + 1}
                                            </button>
                                        ))}
                                        <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Management Kas Masuk</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Management Penyaluran Donasi</div>
                                <div>
                                    <button className="btn btn-sm btn-primary" onClick={() => setShowDonationModal(true)}>Tambah Penyaluran</button>
                                </div>
                            </div>
                            <div className="card-body">
                                {(!taxData || !taxData.donationList || taxData.donationList.length === 0) ? (
                                    <div className="text-muted">Belum ada data penyaluran donasi.</div>
                                ) : (
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Tanggal</th>
                                                <th>Kegiatan</th>
                                                <th>Jumlah (IDR)</th>
                                                <th>Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {taxData.donationList.map((d, i) => (
                                                <tr key={d.id || i}>
                                                    <td>{i + 1}</td>
                                                    <td>{d.date ? new Date(d.date).toLocaleDateString("id-ID") : "-"}</td>
                                                    <td>{d.activity || d.kegiatan || "-"}</td>
                                                    <td>{(d.amount || d.jumlah || 0).toLocaleString && (d.amount || d.jumlah || 0).toLocaleString("id-ID")}</td>
                                                    <td>{d.notes || d.catatan || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    <TaxDonationDestinationModal
                        show={showDonationModal}
                        onClose={() => setShowDonationModal(false)}
                        userTokenData={userTokenData}
                        onSuccess={() => fetchTax()}
                    />

                    {/* Preview of fullscreen below */}
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Preview Fullscreen</div>
                            <div className="card-body">
                                <TaxFullscreen userTokenData={userTokenData} preview={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Tax;