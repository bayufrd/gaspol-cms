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
    const [taxData, setTaxData] = useState(null);
    const outletId = userTokenData?.outlet_id;
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

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
                        <h2>📊 Management Tax (Fullscreen)</h2>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => (window.location.href = "/tax")}
                        >
                            <i className="bi bi-arrow-left"></i> Kembali
                        </button>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-1">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center">
                                    <h5>Total Pajak Nominal</h5>
                                    <h3 className="text-primary">
                                        Rp {totalNominal.toLocaleString("id-ID")}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-1">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center">
                                    <h5>Total Pajak Donasi</h5>
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
                            onClick={() => (window.location.href = "/tax-fullscreen")}
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