import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";

const TaxFullscreen = ({ userTokenData, preview = false }) => {
    const params = useParams();
    const [taxData, setTaxData] = useState(null);
    const tokenOutletId = userTokenData?.outlet_id;
    const paramOutletId = params?.id || params?.outletId || null;
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    //Styling
    const styles = {
        footer: {
            backgroundColor: '#f8f9fa',
            padding: '20px 0',
            borderTop: '1px solid #e9ecef',
            fontFamily: "'Inter', 'Roboto', sans-serif",
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
        },
        leftSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
        },
        companyLink: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#333',
            fontWeight: '600',
            transition: 'color 0.3s ease',
        },
        logo: {
            marginRight: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        logoImage: {
            maxWidth: '50%',
            maxHeight: '50%',
            objectFit: 'contain',
        },
        companyText: {
            fontSize: '14px',
            margin: 0,
            marginLeft: '10px',
        },
        downloadLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            color: '#2575fc',
            fontWeight: '500',
        },
        icon: {
            fontSize: '18px',
        },
    };



    // For fullscreen: prefer param if provided (public link), otherwise use token outlet id
    const outletId = paramOutletId || tokenOutletId;

    const fetchTaxData = async () => {
        if (!outletId) return;
        try {
            const response = await axios.get(`${apiBaseUrl}/tax/${outletId}`);
            setTaxData(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data pajak (fullscreen):", error);
        }
    };

    useEffect(() => {
        fetchTaxData();
    }, [outletId, apiBaseUrl]);

    useEffect(() => {
        if (preview) return; // no polling in preview mode
        const interval = setInterval(() => fetchTaxData(), 30000);
        return () => clearInterval(interval);
    }, [outletId, apiBaseUrl, preview]);

    if (!taxData) return <div>Loading...</div>;

    const totalNominal = taxData.total_nominal || 0;
    const totalDonasi = taxData.total_donasi || 0;
    const dailyChart = taxData.daily_chart || [];
    const latestTaxes = taxData.latestTaxes || [];
    // Kas masuk data (some API versions may name this differently)
    const kasMasuk = taxData.kas_masuk || taxData.kas || [];
    const PenyaluranDonasi = taxData.PenyaluranDonasi || taxData.DonasiSalur || [];

    const lineChartData = {
        labels: dailyChart.map((item) => item.date),
        datasets: [
            {
                label: "Total Pajak per Hari (IDR)",
                data: dailyChart.map((item) => item.total),
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.15)",
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 8,
            },
        ],
    };

    const lineChartDataDonasi = {
        labels: dailyChart.map((item) => item.date),
        datasets: [
            {
                label: "Total Donasi per Hari (IDR)",
                data: dailyChart.map((item) => item.total_donasi),
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.15)",
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 8,
            },
        ],
    };

    // Determine logo based on outlet id: 1 -> jempolan, 3 or 10 -> sambelnyahti, others -> sambelcolek
    const getLogoSrc = (id) => {
        const base = "/assets/images/partnership";
        const n = Number(id);
        if (n === 1) return `${base}/jempolan.jpg`;
        if (n === 3 || n === 10) return `${base}/sambelnyahti.jpg`;
        return `${base}/sambelcolek.jpg`;
    };
    const logoSrc = getLogoSrc(outletId);

    // layout adjustments for preview: smaller padding and no header/footer
    const containerStyle = preview
        ? { background: "#fff", padding: "10px", overflowY: "auto" }
        : { background: "#fff", minHeight: "100vh", padding: "30px", overflowY: "auto", display: "flex", flexDirection: "column" };

    return (
        <div style={containerStyle}>
            <div style={{ flex: 1 }}>
                {!preview && (
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <div />
                        <div style={{ textAlign: "center" }}>
                            <img
                                src={logoSrc}
                                alt="logo"
                                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", marginBottom: 12 }}
                            />
                            <h2 style={{ margin: 0 }}>Laporan Donasi</h2>
                            <p className="text-muted" style={{ marginTop: 6 }}>Transparansi donasi untuk kegiatan sosial</p>
                        </div>
                        <div>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => (window.location.href = "/tax")}
                            >
                                <i className="bi bi-arrow-left"></i> Kembali
                            </button>
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-md-4 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Donasi Terkumpul</h5>
                                <h3 className="text-primary">Rp {totalDonasi.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Dana Tersalurkan</h5>
                                <h3 className="text-primary">Rp 0</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Donasi Tertampung</h5>
                                <h3 className="text-danger">Rp {totalDonasi.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Grafik Total Donasi per Hari</div>
                            <div className="card-body" style={{ height: "250px" }}>
                                <Line data={lineChartDataDonasi} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Daftar Donasi Terakhir</div>
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
                                        {latestTaxes
                                            .filter(t => t.pajak_payment_type && t.pajak_payment_type.toLowerCase().includes("tunai") && t.pajak_donasi > 0)
                                            .map((t, i) => (
                                                <tr key={t.id}>
                                                    <td>{i + 1}</td>
                                                    <td>{t.customer_name}</td>
                                                    <td>{t.transaction_ref_tax}</td>
                                                    <td>{t.pajak_nominal.toLocaleString("id-ID")}</td>
                                                    <td>{t.pajak_donasi.toLocaleString("id-ID")}</td>
                                                    <td>{t.pajak_payment_type}</td>
                                                    <td>{new Date(t.created_at).toLocaleDateString("id-ID")}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* Kas Masuk */}
                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Daftar Kas Masuk</div>
                            <div className="card-body">
                                {kasMasuk.length === 0 ? (
                                    <div className="text-muted">Belum ada data kas masuk.</div>
                                ) : (
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Keterangan</th>
                                                <th>Nominal (IDR)</th>
                                                <th>Sumber</th>
                                                <th>Tanggal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kasMasuk.map((k, i) => (
                                                <tr key={k.id || i}>
                                                    <td>{i + 1}</td>
                                                    <td>{k.keterangan || k.description || k.note || "-"}</td>
                                                    <td>{(k.nominal || k.amount || 0).toLocaleString && (k.nominal || k.amount || 0).toLocaleString("id-ID")}</td>
                                                    <td>{k.source || k.sumber || "-"}</td>
                                                    <td>{k.created_at ? new Date(k.created_at).toLocaleString("id-ID") : (k.date ? new Date(k.date).toLocaleString("id-ID") : "-")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Penyaluran Donasi */}
                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Daftar Penyaluran Donasi</div>
                            <div className="card-body">
                                {kasMasuk.length === 0 ? (
                                    <div className="text-muted">Belum ada data Penyaluran Donasi.</div>
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
                                            {PenyaluranDonasi.map((k, i) => (
                                                <tr key={k.id || i}>
                                                    <td>{i + 1}</td>
                                                    <td>{k.created_at ? new Date(k.created_at).toLocaleString("id-ID") : (k.date ? new Date(k.date).toLocaleString("id-ID") : "-")}</td>
                                                    <td>{k.kegiatan || k.description || k.note || "-"}</td>
                                                    <td>{(k.jumlah || k.amount || 0).toLocaleString && (k.jumlah || k.amount || 0).toLocaleString("id-ID")}</td>
                                                    <td>{k.catatan || k.note || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Grafik Total Pajak per Hari</div>
                            <div className="card-body" style={{ height: "250px" }}>
                                <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 mb-1 text-center">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Pajak</h5>
                                <h3 className="text-primary">Rp {totalNominal.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header fw-bold">Daftar Pajak Terakhir</div>
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
                                        {latestTaxes.map((t, i) => (
                                            <tr key={t.id}>
                                                <td>{i + 1}</td>
                                                <td>{t.customer_name}</td>
                                                <td>{t.transaction_ref_tax}</td>
                                                <td>{t.pajak_nominal.toLocaleString("id-ID")}</td>
                                                <td>{t.pajak_donasi.toLocaleString("id-ID")}</td>
                                                <td>{t.pajak_payment_type}</td>
                                                <td>{new Date(t.created_at).toLocaleDateString("id-ID")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer style={styles.footer}>
                <div style={styles.container}>
                    <div style={styles.leftSection}>
                        <a
                            href="https://dastrevas.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.companyLink}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#2575fc')}
                            onMouseOut={(e) => (e.currentTarget.style.color = '#333')}
                        >
                            <div style={styles.logo}>
                                <img
                                    src="/assets/images/DT.svg"
                                    alt="Dastrevas Tech Logo"
                                    style={styles.logoImage}
                                />
                            </div>
                            <p style={styles.companyText}>2023 © Akhari Tech x Dastrevas</p>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TaxFullscreen;
