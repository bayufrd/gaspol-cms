import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import TaxFullscreenPictureModal from "./TaxFullscreenPictureModal";
import TaxDocumentPictureEditModal from "./TaxDocumentPictureEditModal";

const TaxFullscreen = ({ userTokenData, preview = false }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDoc, setEditDoc] = useState(null);
    const params = useParams();
    const [taxData, setTaxData] = useState(null);
    const [showPictureModal, setShowPictureModal] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [footerUrl, setFooterUrl] = useState('https://dastrevas.com');
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



    // Footer link runtime check (hooks must be at top)
    // ...existing code...
    useEffect(() => {
        let isMounted = true;
        const testUrls = async () => {
            const urls = ['https://dastrevas.com', 'https://dastrevas.space'];
            for (const url of urls) {
                // Try to load favicon.ico as a ping
                try {
                    await new Promise((resolve, reject) => {
                        const img = new window.Image();
                        img.src = url + '/favicon.ico?_=' + Date.now();
                        img.onload = () => resolve();
                        img.onerror = () => reject();
                    });
                    if (isMounted) {
                        setFooterUrl(url);
                        break;
                    }
                } catch (e) {
                    // Try next
                }
            }
        };
        testUrls();
        return () => { isMounted = false; };
    }, []);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [outletId, apiBaseUrl]);

    useEffect(() => {
        let interval;
        if (!preview) {
            interval = setInterval(() => fetchTaxData(), 30000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [outletId, apiBaseUrl, preview]);

    // ...existing code...
    // Only declare useState/useEffect for footerUrl ONCE above early return

    if (!taxData) return <div>Loading...</div>;

    const totalDonasi = taxData.total_donasi || 0;
    const totalDonasiRaw = taxData.total_donasi_raw || 0;
    const totalDonationDistributed = taxData.total_donation_distributed || 0;
    const dailyChart = taxData.daily_chart || [];
    const latestTaxesDonasi = taxData.latestTaxesDonasi || taxData.latestTaxes || [];
    // Kas masuk data (some API versions may name this differently)
    const kasMasuk = taxData.kas_masuk || taxData.kas || [];
    const PenyaluranDonasi = taxData.PenyaluranDonasi || taxData.DonasiSalur || [];
    const donationList = taxData.donationList || PenyaluranDonasi || [];

    // (tax chart removed for fullscreen) keep only donation chart below

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

    // ...existing code...

    return (
        <div style={containerStyle}>
            <div style={{ flex: 1 }}>
                {!preview && (
                    <>
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
                            <div className="d-none d-md-block">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => (window.location.href = "/tax")}
                                >
                                    <i className="bi bi-arrow-left"></i> Kembali
                                </button>
                            </div>
                        </div>
                        {/* Mobile: Kembali button will be rendered outside main content, above footer */}
                    </>
                )}

                <div className="row">
                    <div className="col-md-4 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Donasi Terkumpul</h5>
                                <h3 className="text-primary">Rp {totalDonasiRaw.toLocaleString("id-ID")}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-1">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center">
                                <h5>Total Dana Tersalurkan</h5>
                                <h3 className="text-primary">Rp {totalDonationDistributed.toLocaleString("id-ID")}</h3>
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
                                {donationList.length === 0 ? (
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
                                            {donationList.map((k, i) => (
                                                <tr key={k.id || i}>
                                                    <td>{i + 1}</td>
                                                    <td>{k.date ? new Date(k.date).toLocaleString("id-ID") : (k.created_at ? new Date(k.created_at).toLocaleString("id-ID") : "-")}</td>
                                                    <td>{k.activity || k.kegiatan || k.description || k.note || "-"}</td>
                                                    <td>{(k.amount || k.jumlah || 0).toLocaleString && (k.amount || k.jumlah || 0).toLocaleString("id-ID")}</td>
                                                    <td>{k.notes || k.catatan || k.note || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
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
                                            <th>Nominal Donasi (IDR)</th>
                                            <th>Tipe Pembayaran</th>
                                            <th>Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestTaxesDonasi.map((t, i) => {
                                            const donationAmount = t.pajak_donasi || t.donasi || t.jumlah || t.nominal || t.amount || 0;
                                            const txRef = t.transaction_ref_tax || t.transaction_ref || t.ref || "-";
                                            const paymentType = t.pajak_payment_type || t.payment_type || t.tipe || "-";
                                            return (
                                                <tr key={t.id || i}>
                                                    <td>{i + 1}</td>
                                                    <td>{t.customer_name || t.nama || "-"}</td>
                                                    <td>{txRef}</td>
                                                    <td>{(donationAmount || 0).toLocaleString && (donationAmount || 0).toLocaleString("id-ID")}</td>
                                                    <td>{paymentType}</td>
                                                    <td>{t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID") : (t.date ? new Date(t.date).toLocaleDateString("id-ID") : "-")}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* removed tax-only charts and tables for fullscreen view */}
                </div>
            </div>
            {/* Documentation Photo Cards */}
            {taxData.documentationList && taxData.documentationList.length > 0 && (
                <div className="container mb-4">
                    <h5 className="fw-bold mb-3">Dokumentasi Penyaluran</h5>
                    <div className="row g-3">
                        {(() => {
                            const docs = taxData.documentationList;
                            const cols = docs.length === 1 ? 12 : docs.length === 2 ? 6 : 4;
                            return docs.map((doc, i) => {
                                const cleanPath = doc.image_url ? doc.image_url.replace(/^\/+/, "") : "";
                                const imgSrc = doc.image_url ? `${apiBaseUrl}/${cleanPath}` : "/assets/images/no-image.png";
                                // max 3 columns per row
                                return (
                                    <div className={`col-12 col-md-${cols}`} key={doc.id || i}>
                                        <div className="card shadow-sm border-0 h-100 d-flex flex-column align-items-center p-2 position-relative" style={{ borderRadius: 12 }}>
                                            <div style={{ width: '100%', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setModalImage(imgSrc);
                                                    setModalTitle(doc.title || "");
                                                    setModalDescription(doc.description || "");
                                                    setShowPictureModal(true);
                                                }}>
                                                <img
                                                    src={imgSrc}
                                                    alt={doc.title}
                                                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                                                />
                                            </div>
                                            <div style={{ width: '100%' }}>
                                                <div className="fw-semibold" style={{ fontSize: '1rem', marginBottom: 2 }}>{doc.title}</div>
                                                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 2 }}>{doc.date ? new Date(doc.date).toLocaleDateString("id-ID") : "-"}</div>
                                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{doc.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}
            <TaxFullscreenPictureModal
                show={showPictureModal}
                onClose={() => setShowPictureModal(false)}
                imageSrc={modalImage}
                title={modalTitle}
                description={modalDescription}
            />
            <TaxDocumentPictureEditModal
                show={showEditModal}
                onClose={() => { setShowEditModal(false); setEditDoc(null); }}
                doc={editDoc}
                userTokenData={userTokenData}
                onSuccess={() => { setShowEditModal(false); setEditDoc(null); fetchTaxData(); }}
            />
            {/* Mobile: Kembali button rendered immediately before footer */}
            {!preview && (
                <div className="d-block d-md-none" style={{ width: '100%', background: 'transparent' }}>
                    <button
                        className="btn btn-outline-secondary w-100 mb-2"
                        style={{ fontSize: '1.1rem' }}
                        onClick={() => (window.location.href = "/tax")}
                    >
                        <i className="bi bi-arrow-left"></i> Kembali
                    </button>
                </div>
            )}
            <footer style={styles.footer}>
                <div style={styles.container}>
                    <div style={styles.leftSection}>
                        <a
                            href={footerUrl}
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
