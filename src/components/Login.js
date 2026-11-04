import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "../utils/alerts";
import { extractUserTokenData } from "../helpers/token";
import { normalizeMenuAccess } from "../helpers/normalizeMenuAccess";
import { accessRoutes } from "../helpers/accessRoutes";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/login-modern.css";

const PARTNER_OUTLETS = [
  {
    name: "Sambel Colek",
    category: "Kuliner Nusantara & Spesialis Sambal",
    region: "Yogyakarta",
    logo: "/assets/images/partnership/sambelcolek.jpg",
    isLogoContain: false,
    instagramUrl:
      "https://www.instagram.com/sambelcolekyk?igsh=MWd1cTFpZDFjN3BkMg==",
    instagramHandle: "@sambelcolekyk",
    mapsUrl: "https://maps.app.goo.gl/2fb2a3kS5324W6iC6",
    summary:
      "Restoran keluarga dengan pilihan sambal khas Nusantara, layanan makan di tempat, dan pesanan bungkus.",
  },
  {
    name: "Jempolan Coffee & Eatery",
    category: "Kedai Kopi & Restoran",
    region: "Yogyakarta",
    logo: "/assets/images/partnership/jempolan.jpg",
    isLogoContain: false,
    instagramUrl:
      "https://www.instagram.com/jempolan.yk?igsh=MWN4bGsycHdkdHRtZQ==",
    instagramHandle: "@jempolan.yk",
    mapsUrl: "https://maps.app.goo.gl/fcG91c9oV13tB92s7",
    summary:
      "Tempat bersantai dan bekerja dengan sajian kopi spesialti, minuman segar, serta menu makanan lengkap.",
  },
  {
    name: "Sambel'e Nyah Ti",
    category: "Masakan Tradisional Jawa",
    region: "Yogyakarta",
    logo: "/assets/images/partnership/sambelnyahti.jpg",
    isLogoContain: false,
    instagramUrl:
      "https://www.instagram.com/sambele.nyahti?igsh=MTY3cDdrdW1tY29r",
    instagramHandle: "@sambele.nyahti",
    mapsUrl: "https://maps.app.goo.gl/oE8V9V5r4jF2b7K27",
    summary:
      "Hidangan rumahan khas Jawa dengan cita rasa autentik dan suasana bersantap yang hangat.",
  },
  {
    name: "Double O",
    category: "Minuman Modern & Lifestyle",
    region: "Yogyakarta",
    logo: "/assets/images/brand/doubleo.png",
    isLogoContain: true,
    instagramUrl:
      "https://www.instagram.com/doubleo.id?igsh=MWd1cTFpZDFjN3BkMg==",
    instagramHandle: "@doubleo.id",
    mapsUrl: "https://maps.app.goo.gl/doubleo",
    summary:
      "Gerai minuman kekinian dengan pelayanan cepat dan beragam varian rasa favorit pelanggan.",
  },
  {
    name: "GreenBeans",
    category: "Roastery & Kedai Kopi",
    region: "Yogyakarta",
    logo: "/assets/images/brand/greenbeans.png",
    isLogoContain: true,
    instagramUrl:
      "https://www.instagram.com/greenbeans.yk?igsh=MWd1cTFpZDFjN3BkMg==",
    instagramHandle: "@greenbeans.yk",
    mapsUrl: "https://maps.app.goo.gl/greenbeans",
    summary:
      "Roastery lokal dan espresso bar yang menyajikan biji kopi pilihan dengan seduhan presisi.",
  },
];

const Login = ({ setIsLoggedIn, setUserTokenData }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Gaspoll Management Center — Masuk";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    Swal.close();

    try {
      const response = await axios.post(`${apiBaseUrl}/login`, {
        username,
        password,
      });

      const token = response.data?.token || response.data?.data?.token;
      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan dari server.");
      }

      const tokenData = extractUserTokenData(token);
      tokenData.menu_access = normalizeMenuAccess(tokenData.menu_access);

      setUserTokenData(tokenData);
      setIsLoggedIn(true);
      localStorage.setItem("token", token);

      const minAccess = Math.min(...tokenData.menu_access);
      const redirectPath = accessRoutes[minAccess] || "/profile";

      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: `Selamat datang, ${tokenData.name || username}!`,
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        allowOutsideClick: false,
        willClose: () => {
          setIsLoading(false);
          navigate(redirectPath, { replace: true });
        },
      });
    } catch (error) {
      setIsLoading(false);
      let errorMessage =
        "Login Gagal! Periksa kembali username dan password Anda.";

      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.message || "Username atau password tidak sesuai";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Login Gagal!",
        text: errorMessage,
      });
    }
  };

  const activePartner =
    PARTNER_OUTLETS[selectedPartnerIndex] || PARTNER_OUTLETS[0];

  return (
    <div
      className="gaspol-login-frame"
      data-theme={isDark ? "dark" : "light"}
    >
      <main className="gaspol-sheet">
        {/* Kolom Kiri (Atas di Mobile): Form Login Owner & Pengelola */}
        <section className="gaspol-auth-pane" aria-label="Formulir masuk">
          <header className="gaspol-brand-bar">
            <div className="gaspol-brand-id">
              <img
                src="/assets/images/brand/gaspoll.png"
                alt="Logo Gaspoll"
                className="gaspol-brand-logo"
              />
              <div className="gaspol-brand-text">
                <span className="gaspol-brand-name">Gaspoll Management</span>
                <span className="gaspol-brand-sub">Portal Kelola Outlet</span>
              </div>
            </div>

            <button
              type="button"
              className="gaspol-theme-btn"
              onClick={toggleTheme}
              title={
                isDark ? "Ganti ke tampilan terang" : "Ganti ke tampilan gelap"
              }
            >
              <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
            </button>
          </header>

          <div className="gaspol-auth-main">
            <div className="gaspol-auth-heading">
              <h1 className="gaspol-title">Selamat datang kembali</h1>
              <p className="gaspol-subtitle">
                Masuk ke akun Anda untuk mengatur menu, harga, promo diskon, dan
                memantau laporan penjualan outlet.
              </p>
            </div>

            <form onSubmit={handleLogin} className="gaspol-auth-form">
              <div className="gaspol-field">
                <label htmlFor="username" className="gaspol-label">
                  Username
                </label>
                <div className="gaspol-input-wrap">
                  <input
                    type="text"
                    id="username"
                    className="gaspol-input"
                    placeholder="Masukkan username Anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="gaspol-field">
                <label htmlFor="password" className="gaspol-label">
                  Password
                </label>
                <div className="gaspol-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="gaspol-input has-action"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="gaspol-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "Tutup" : "Lihat"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="gaspol-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Sedang masuk..." : "Masuk ke Dashboard"}
              </button>
            </form>

            {/* Strip Mitra Ringkas khusus Mobile agar tidak ramai */}
            <div className="gaspol-mobile-partners" aria-label="Mitra kuliner">
              <span className="gaspol-mobile-partners-label">
                Mitra kuliner di Yogyakarta
              </span>
              <div className="gaspol-mobile-partners-row">
                {PARTNER_OUTLETS.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gaspol-mobile-partner-chip"
                    title={partner.name}
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="gaspol-mobile-partner-img"
                    />
                    <span>{partner.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <footer className="gaspol-auth-footer">
            <span>Gaspoll Management Center</span>
            <span>
              Didukung oleh{" "}
              <a
                href="https://www.instagram.com/dastrevas?igsh=MWd1cTFpZDFjN3BkMg=="
                target="_blank"
                rel="noopener noreferrer"
                className="gaspol-footer-link"
              >
                Dastrevas
              </a>
            </span>
          </footer>
        </section>

        {/* Kolom Kanan (Bawah di Mobile): Galeri Mitra Outlet Gaspoll */}
        <section
          className="gaspol-showcase-pane"
          aria-label="Mitra kuliner kami"
        >
          <div className="gaspol-showcase-top">
            <div className="gaspol-showcase-heading">
              <h2 className="gaspol-section-title">Mitra kuliner Gaspoll</h2>
              <p className="gaspol-section-sub">
                Dipercaya oleh berbagai brand kuliner dan kopi di Yogyakarta
              </p>
            </div>
            <span className="gaspol-badge-pill">
              <span className="gaspol-badge-dot" />
              <span>5 Mitra Aktif</span>
            </span>
          </div>

          {/* Kartu Sorotan Mitra yang Dipilih */}
          <div className="gaspol-feature-card">
            <div className="gaspol-feature-media">
              <img
                src={activePartner.logo}
                alt={activePartner.name}
                className={`gaspol-feature-img ${
                  activePartner.isLogoContain ? "is-logo" : ""
                }`}
              />
            </div>
            <div className="gaspol-feature-body">
              <span className="gaspol-feature-tag">
                {activePartner.category} · {activePartner.region}
              </span>
              <h3 className="gaspol-feature-name">{activePartner.name}</h3>
              <p className="gaspol-feature-desc">{activePartner.summary}</p>
              <div className="gaspol-feature-actions">
                <a
                  href={activePartner.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gaspol-link-btn"
                >
                  <span>Lokasi Google Maps</span>
                </a>
                <a
                  href={activePartner.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gaspol-link-btn"
                >
                  <span>Instagram {activePartner.instagramHandle}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Daftar Pilihan Mitra (Mudah Diklik di Desktop maupun HP) */}
          <div className="gaspol-partner-list" role="list">
            {PARTNER_OUTLETS.map((partner, index) => {
              const isSelected = index === selectedPartnerIndex;
              return (
                <div
                  key={partner.name}
                  role="listitem"
                  className={`gaspol-partner-item ${
                    isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => setSelectedPartnerIndex(index)}
                >
                  <div className="gaspol-partner-left">
                    <span className="gaspol-partner-bar" aria-hidden="true" />
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="gaspol-partner-avatar"
                    />
                    <div className="gaspol-partner-info">
                      <span className="gaspol-partner-title">
                        {partner.name}
                      </span>
                      <span className="gaspol-partner-cat">
                        {partner.category}
                      </span>
                    </div>
                  </div>
                  <span className="gaspol-partner-city">{partner.region}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
