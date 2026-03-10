
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import localWaStatus from "../temp/wa-connection-status.json";

// Prefer relative paths so CRA dev proxy (or same-origin deployment) avoids CORS.
// To force using the remote host set REACT_APP_FORCE_REMOTE=true in .env.
const apiBaseUrl = (process.env.REACT_APP_FORCE_REMOTE === 'true' && process.env.REACT_APP_API_WHATSAPP_URL)
  ? process.env.REACT_APP_API_WHATSAPP_URL
  : '';
const WA_APP_TOKEN = process.env.REACT_APP_WHATSAPP_APP_TOKEN || null;
const apiUrlBaseBackend = process.env.REACT_APP_API_BASE_URL;

const WhatsappPage = ({ userTokenData }) => {
  // Helper: format timestamp (milliseconds or ISO string) to readable string
  const formatTimestamp = (ts) => {
    if (!ts && ts !== 0) return '-';
    try {
      let d;
      if (typeof ts === 'number') d = new Date(ts);
      else if (/^\d+$/.test(String(ts))) d = new Date(Number(ts));
      else d = new Date(ts);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    } catch (e) {
      return '-';
    }
  };

  const extractDisconnectMessage = (info) => {
    if (!info) return null;
    try {
      return info?.error?.output?.payload?.message || info?.error?.message || info?.message || null;
    } catch (e) {
      return null;
    }
  };
  const [activeTab, setActiveTab] = useState('config');
  const [qrCode, setQrCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, status: 'Menunggu status...', qrAvailable: false });
  const [logs, setLogs] = useState([]);

  const [nomor, setNomor] = useState('');
  const [pesan, setPesan] = useState('');
  const [isAttachment, setIsAttachment] = useState(false);
  const [lampiran, setLampiran] = useState(null);

  // --- State untuk Members ---
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const getMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrlBaseBackend}/membership`, {
        params: {
          outlet_id: userTokenData.outlet_id,
        },
      });

      console.log("Members Response:", response.data);
      setMembers(response.data.data || []);
      setFilteredMembers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError(error.message || "Failed to fetch members");
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrlBaseBackend, userTokenData]);

  useEffect(() => {
    if (showModal) {
      getMembers();
    }
  }, [showModal, getMembers]);

  useEffect(() => {
    if (!memberSearch) {
      setFilteredMembers(members);
      return;
    }
    const q = memberSearch.toLowerCase();
    setFilteredMembers(members.filter(m => {
      return (m.member_name || '').toLowerCase().includes(q)
        || (m.member_email || '').toLowerCase().includes(q)
        || (m.member_phone_number || '').toLowerCase().includes(q);
    }));
  }, [memberSearch, members]);

  // Styles
  const styles = {
    card: {
      maxWidth: '600px',
      margin: '30px auto',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      backgroundColor: '#ffffff',
      textAlign: 'center',
    },
    container: {
      maxWidth: '600px',
      margin: '30px auto',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      backgroundColor: '#ffffff',
    },
    tab: {
      display: 'flex',
      justifyContent: 'space-around',
      cursor: 'pointer',
      padding: '10px 0',
      borderBottom: '2px solid #f0f0f0'
    },
    activeTab: {
      fontWeight: 'bold',
      borderBottom: '2px solid #007bff'
    },
    button: {
      width: '48%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      marginTop: '10px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    logContainer: {
      maxHeight: '200px',
      overflowY: 'auto',
      border: '1px solid #ccc',
      padding: '10px',
      marginTop: '20px',
      textAlign: 'left',
      background: '#f9f9f9',
      borderRadius: '4px',
    },
  };

  // Functions for WA status and QR Code Management
  const fetchWaStatus = async () => {
    // Use plain fetch without credentials to avoid sending cookies/credentials
    // which conflict with Access-Control-Allow-Origin: * on the server.
    try {
      const url = `${apiBaseUrl}/wa-connection-status`;
      let data = null;
      try {
        const headers = { 'Accept': 'application/json' };
        if (WA_APP_TOKEN) headers['x-app-token'] = WA_APP_TOKEN;
        const r = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', headers });
        if (r.ok) data = await r.json();
        else throw new Error('Fetch failed with status ' + r.status);
      } catch (fetchErr) {
        // fallback to axios if fetch fails (network/CORS) — axios may include headers differently
        const axiosOptions = { withCredentials: false };
        if (WA_APP_TOKEN) axiosOptions.headers = { 'x-app-token': WA_APP_TOKEN };
        const response = await axios.get(url, axiosOptions);
        data = response.data || {};
      }

      // Determine QR image source: prefer qrData (already data URI), else qrBase64
      let qr = '';
      if (data.qrData) {
        qr = data.qrData;
      } else if (data.qrBase64) {
        qr = `data:image/png;base64,${data.qrBase64}`;
      } else if (data.qrPath) {
        // fallback: server may return a path like '/qr.png'
        const base = apiBaseUrl.replace(/\/$/, '');
        qr = data.qrPath.startsWith('/') ? base + data.qrPath : data.qrPath;
      }

      setQrCode(qr);

      // Map connection status; keep original payload but ensure `connected` exists
      setConnectionStatus({
        connected: !!data.connected,
        status: data.status || '',
        qrAvailable: !!(data.qrData || data.qrBase64 || data.qrPath),
        ...data,
      });

      return data;
    } catch (error) {
      console.error('Error fetching WA connection status (network/CORS?), using local fallback:', error);
      // Fallback to local JSON (useful during development when backend blocks CORS)
      try {
        const data = localWaStatus || {};

        let qr = '';
        if (data.qrData) {
          qr = data.qrData;
        } else if (data.qrBase64) {
          qr = `data:image/png;base64,${data.qrBase64}`;
        } else if (data.qrPath) {
          const base = apiBaseUrl.replace(/\/$/, '');
          qr = data.qrPath.startsWith('/') ? base + data.qrPath : data.qrPath;
        }

        setQrCode(qr);
        setConnectionStatus({
          connected: !!data.connected,
          status: data.status || '',
          qrAvailable: !!(data.qrData || data.qrBase64 || data.qrPath),
          ...data,
        });

        return data;
      } catch (e) {
        console.error('Local fallback failed:', e);
        return null;
      }
    }
  };

  const resetLogin = async () => {
    Swal.fire({
      title: 'Konfirmasi Reset',
      text: 'Anda yakin ingin mereset login?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Reset!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const headers = WA_APP_TOKEN ? { headers: { 'x-app-token': WA_APP_TOKEN } } : {};
          await axios.get(`${apiBaseUrl}/reset`, headers);
          await fetchWaStatus();
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Login telah direset.",
          });
        } catch (error) {
          console.error('Error resetting login:', error);
          Swal.fire({
            title: "Gagal",
            text: error.response.data.message || "Terjadi kesalahan saat mereset.",
            icon: "error",
          });
        }
      }
    });
  };

  const checkConnectionStatus = async () => {
    // reuse fetchWaStatus to keep mapping consistent and also return the data
    return await fetchWaStatus();
  };

  const fetchLogs = async () => {
    try {
      const url = `${apiBaseUrl}/logs`;
      let data = null;
      try {
        const headers = { Accept: 'application/json' };
        if (WA_APP_TOKEN) headers['x-app-token'] = WA_APP_TOKEN;
        const r = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', headers });
        if (r.ok) data = await r.json();
        else throw new Error('Fetch failed with status ' + r.status);
      } catch (errFetch) {
        const axiosOptions = { withCredentials: false };
        if (WA_APP_TOKEN) axiosOptions.headers = { 'x-app-token': WA_APP_TOKEN };
        const response = await axios.get(url, axiosOptions);
        data = response.data;
      }
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleFileChange = (e) => {
    setLampiran(e.target.files[0]);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 800; // batas ukuran
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
          resolve(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async () => {
    if (!nomor || !pesan) {
      Swal.fire({
        title: "Gagal",
        text: "Nomor dan pesan wajib diisi.",
        icon: "error",
      });
      return;
    }

    try {
      const latest = await checkConnectionStatus();

      // if not connected, block sending
      if (!latest?.connected) {
        Swal.fire({
          title: "Gagal",
          text: "WhatsApp belum terhubung. Scan QR atau tautkan WhatsApp terlebih dahulu.",
          icon: "error",
        });
        setActiveTab('config');
        return;
      }

      let response;

      let nomorFormated = nomor.replace(/\D/g, "");
      if (!nomorFormated.startsWith("62")) {
        nomorFormated = nomorFormated.startsWith("0")
          ? "62" + nomorFormated.substring(1)
          : "62" + nomorFormated;
      }

      if (isAttachment && lampiran) {
        const base64String = await compressImage(lampiran); // pakai fungsi compress di atas

        response = await axios.post(`${apiBaseUrl}/kirim-lampiran`, {
          nomor: nomorFormated,
          pesan,
          lampiran: base64String,
        }, { timeout: 60000 });

      } else {
        response = await axios.post(`${apiBaseUrl}/kirim-pesan`, {
          nomor: nomorFormated,
          pesan,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: response.data.message,
      });

    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: error.response?.data?.error || "Terjadi kesalahan saat mengirim pesan.",
        icon: "error",
      });
    }
  };


  useEffect(() => {
    if (activeTab === 'config') {
      fetchWaStatus();
      checkConnectionStatus();
      fetchLogs();
      const intervalId = setInterval(() => {
        checkConnectionStatus();
        fetchLogs();
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab]);

  return (

    <div style={styles.container}>
      <div className="page-title">
        <div className="row">
          <div className="col-12 col-md-6 order-md-1 order-last mb-3">
            <h3>Whatsapp</h3>
          </div>
        </div>
      </div>
      <div style={styles.tab}>

        <div onClick={() => { setActiveTab('config'); fetchWaStatus(); }} style={activeTab === 'config' ? styles.activeTab : {}}> 🛠️ Konfigurasi</div>
        <div onClick={() => setActiveTab('message')} style={activeTab === 'message' ? styles.activeTab : {}}> 📩 Kirim Pesan</div>
        <div onClick={() => setActiveTab('config')} style={activeTab === 'template-pos' ? styles.activeTab : {}}> 🔐 Template POS</div>
        <div onClick={() => setActiveTab('config')} style={activeTab === 'broadcat' ? styles.activeTab : {}}> 🔐 Broadcast Pesan</div>
      </div>

      {activeTab === 'config' && (
        <div style={styles.card}>
          <h2>Scan QR Code untuk WhatsApp</h2>
          {qrCode ? <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%', height: 'auto', marginTop: '20px' }} /> : <p>Loading QR Code...</p>}

          <div style={{ marginTop: '16px', fontWeight: 'bold', fontSize: '18px', color: '#333' }}>
            <h4>{connectionStatus.connected ? " ✅ Connected" : " ❌ Disconnected"}</h4>
            <p>Status: {connectionStatus.connected ? "✔ Connected" : "✖ Disconnected"}</p>
            <p>QR Code: {qrCode ? "✔ Tersedia, Silahkan Scan/Scan Ulang QR Code" : "✖ Tidak Tersedia"}</p>
            <p>Terakhir Update: {formatTimestamp(connectionStatus.lastUpdate)}</p>
            {connectionStatus.lastDisconnectInfo && (
              <p style={{ fontSize: '13px', color: '#666' }}>
                Info: {extractDisconnectMessage(connectionStatus.lastDisconnectInfo) || formatTimestamp(connectionStatus.lastDisconnectInfo?.date)}
              </p>
            )}
          </div>

          <div>
            <button style={styles.button} onClick={() => fetchWaStatus()}> 🔄 Refresh QR Code</button>
            <button style={{ ...styles.button, backgroundColor: '#dc3545' }} onClick={resetLogin}> ⛔ Reset Login</button>
          </div>

          <div style={styles.logContainer}>
            <h5>Logs</h5>
            {logs.map((log, index) => <div key={index}>{log}</div>)}
          </div>
        </div>
      )}

      {activeTab === 'message' && (
        <div style={styles.card}>
          <h2>Kirim Pesan WhatsApp</h2>
          <div style={{ display: "flex", alignItems: "center", margin: "8px 0" }}>
            <input
              type="text"
              placeholder="Nomor Telepon"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px 0 0 4px",
                outline: "none",
              }}
            />
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: "0 16px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "0 4px 4px 0",
                cursor: "pointer",
                height: "46px",
              }}
              title="Pilih dari Member"
            >
              📇
            </button>
          </div>

          <textarea
            placeholder="Pesan Anda"
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <div style={{ margin: '12px 0' }}>
            <input
              type="checkbox"
              checked={isAttachment}
              onChange={() => setIsAttachment(!isAttachment)}
            />
            <label style={{ marginLeft: '8px' }}>Kirim dengan Lampiran</label>
          </div>
          {isAttachment && (
            <input
              type="file"
              onChange={handleFileChange}
              style={{ margin: '8px 0' }}
              accept="image/*" />
          )}
          <button style={styles.button} onClick={handleSendMessage}>Kirim Pesan</button>
        </div>
      )}
      {/* Modal pilih member */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "12px 12px 20px 12px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxSizing: "border-box",
              position: 'relative'
            }}
          >
            {/* Close button top-right */}
            <button
              aria-label="Tutup"
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'transparent',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer'
              }}
            >
              ✖
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <h3 style={{ margin: 0, flex: '0 0 auto' }}>Pilih Member</h3>
              <input
                type="text"
                placeholder="Cari nama, email, atau telepon"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!isLoading && filteredMembers.length === 0 && <p>Tidak ada member</p>}

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", wordBreak: "break-word" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>Nama</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>Email</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>Phone</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "center", padding: "8px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "8px" }}>{m.member_name || "-"}</td>
                    <td style={{ padding: "8px" }}>{m.member_email || "-"}</td>
                    <td style={{ padding: "8px" }}>{m.member_phone_number || "-"}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        style={{
                          background: "#007bff",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setNomor(m.member_phone_number || "");
                          setShowModal(false);
                        }}
                      >
                        ✅
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsappPage;
