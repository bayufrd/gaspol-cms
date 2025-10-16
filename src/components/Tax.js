import React from "react";
import TaxFullscreen from "./TaxFullscreen";

const Tax = ({ userTokenData }) => {
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
                                const target = userTokenData?.outlet_id ? `/tax-fullscreen/${userTokenData.outlet_id}` : "/tax-fullscreen";
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
                    <div className="card-header fw-bold">Pengaturan Laporan Donasi</div>
                    <div className="card-body">
                        <p>Form konfigurasi tampilan fullscreen akan ditempatkan di sini.</p>
                    </div>
                </div>
                {/* Preview of fullscreen below */}
                <div className="card shadow-sm border-0">
                    <div className="card-header fw-bold">Preview Fullscreen</div>
                    <div className="card-body">
                        <TaxFullscreen userTokenData={userTokenData} preview={true} />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Tax;