import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import Footer from "./common/Footer";
import { useParams } from "react-router-dom";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Tax = ({ fullscreenMode = false, userTokenData }) => {
    const params = useParams();
    const [taxData, setTaxData] = useState(null);
    const tokenOutletId = userTokenData?.outlet_id;
    const paramOutletId = params?.id || params?.outletId || null;
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

    // Decide which outlet id to use: prefer token (when logged in), otherwise use URL param
    const outletId = tokenOutletId || paramOutletId;

    // Fetch data function
    const fetchTaxData = async () => {
        if (!outletId) return;
        try {
            const response = await axios.get(`${apiBaseUrl}/tax/${outletId}`);
            setTaxData(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data pajak:", error);
        }
    };

    useEffect(() => {
        fetchTaxData();
    }, [outletId, apiBaseUrl]);

    useEffect(() => {
        if (!fullscreenMode) return;
        const interval = setInterval(() => {
            fetchTaxData();
        }, 30000);
        return () => clearInterval(interval);
    }, [fullscreenMode, outletId, apiBaseUrl]);

    if (!taxData) {
        return <div>Loading...</div>;
    }

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

    if (fullscreenMode) {
        return (
            <div
                style={{
                    background: "#fff",
                    minHeight: "100vh",
                    padding: "30px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ flex: 1 }}>
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
                    <div className="row">
                        <div className="col-md-4 mb-1">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center">
                                    <h5>Total Donasi Terkumpul</h5>
                                    <h3 className="text-primary">
                                        Rp {totalDonasi.toLocaleString("id-ID")}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-1">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center">
                                    <h5>Total Dana Tersalurkan</h5>
                                    <h3 className="text-primary">
                                        Rp 0
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-1">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center">
                                    <h5>Total Donasi Tertampung</h5>
                                    <h3 className="text-danger">
                                        Rp {totalDonasi.toLocaleString("id-ID")}
                                    </h3>
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
                                                        <td>
                                                            {new Date(t.created_at).toLocaleDateString("id-ID")}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header fw-bold">Kas Masuk</div>
                                <div className="card-body">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Tanggal</th>
                                                <th>Donatur</th>
                                                <th>Jumlah (IDR)</th>
                                                <th>Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>10-10-2025</td>
                                                <td>TOTAL TERKUMPUL</td>
                                                <td>-</td>
                                                <td>PERIODE BULAN SEPTEMBER</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header fw-bold">Penyaluran Donasi</div>
                                <div className="card-body">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Tanggal</th>
                                                <th>Kegiatan</th>
                                                <th>Jumlah (IDR)</th>
                                                <th>Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 mb-1 text-center">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center">
                                    <h5>Total Pajak</h5>
                                    <h3 className="text-primary">
                                        Rp {totalNominal.toLocaleString("id-ID")}
                                    </h3>
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
                                                    <td>
                                                        {new Date(t.created_at).toLocaleDateString("id-ID")}
                                                    </td>
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
    }

    // 🔹 DEFAULT MODE
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
                                const target = tokenOutletId ? `/tax-fullscreen/${tokenOutletId}` : "/tax-fullscreen";
                                window.location.href = target;
                            }}
                        >
                            <i className="bi bi-arrows-fullscreen"></i> Fullscreen
                        </button>
                    </div>
                </div>
            </div>

            <section className="section">
                <div className="card shadow-sm border-0 mb-1">
                    <div className="card-header fw-bold">Grafik Total Pajak per Hari</div>
                    <div className="card-body">
                        <Line data={lineChartData} />
                    </div>
                </div>

                {/* Tabel Pajak Terakhir */}
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
            </section>
        </div>
    );
};

export default Tax;