import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import Footer from "./common/Footer";

const TaxFullscreen = ({ userTokenData, preview = false }) => {
    const params = useParams();
    const [taxData, setTaxData] = useState(null);
    const tokenOutletId = userTokenData?.outlet_id;
    const paramOutletId = params?.id || params?.outletId || null;
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

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
                            <div className="card-header fw-bold">Grafik Total Pajak per Hari</div>
                            <div className="card-body" style={{ height: "250px" }}>
                                <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
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
            <Footer />
        </div>
    );
};

export default TaxFullscreen;
