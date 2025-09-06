
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// const apiBaseUrl = 'http://localhost:8090';
const apiBaseUrl = process.env.REACT_APP_API_WHATSAPP_URL;

const WhatsappPage = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [qrCode, setQrCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, status: 'Menunggu status...', qrAvailable: false });
  const [logs, setLogs] = useState([]);

  const [nomor, setNomor] = useState('');
  const [pesan, setPesan] = useState('');
  const [isAttachment, setIsAttachment] = useState(false);
  const [lampiran, setLampiran] = useState(null);

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

  // Functions for QR Code Management
  const fetchQrCode = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/get-qr`);
      if (response.data.success) {
        setQrCode(response.data.qr);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
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
          await axios.get(`${apiBaseUrl}/reset`);
          fetchQrCode();
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
    try {
      const response = await axios.get(`${apiBaseUrl}/wa-connection-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/logs`);
      setLogs(response.data);
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
      await checkConnectionStatus();

      if (connectionStatus?.qrAvailable) {
        Swal.fire({
          title: "Gagal",
          text: "Scan QR terlebih dahulu atau tautkan WhatsApp dahulu",
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
      fetchQrCode();
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
      
        <div onClick={() => {setActiveTab('config'); fetchQrCode();}} style={activeTab === 'config' ? styles.activeTab : {}}> 🛠️ Konfigurasi</div>
        <div onClick={() => setActiveTab('message')} style={activeTab === 'message' ? styles.activeTab : {}}> 📩 Kirim Pesan</div>
        <div onClick={() => setActiveTab('config')} style={activeTab === 'template-pos' ? styles.activeTab : {}}> 🔐 Template POS</div>
        <div onClick={() => setActiveTab('config')} style={activeTab === 'broadcat' ? styles.activeTab : {}}> 🔐 Broadcast Pesan</div>
      </div>

      {activeTab === 'config' && (
        <div style={styles.card}>
          <h2>Scan QR Code untuk WhatsApp</h2>
          {qrCode ? <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%', height: 'auto', marginTop: '20px' }} /> : <p>Loading QR Code...</p>}

          <div style={{ marginTop: '16px', fontWeight: 'bold', fontSize: '18px', color: '#333' }}>
            <h4>{connectionStatus.qrAvailable ? " ❌ Disconnected" : " ✅ Connected"}</h4>
            <p>Status: {connectionStatus.qrAvailable ? "✖ Disconnected" : "✔ Connected"}</p>
            <p>QR Code: {connectionStatus.qrAvailable ? "✔ Tersedia, Silahkan Scan QR Code" : "✖ Tidak Tersedia, Reset untuk Scan Ulang"}</p>
          </div>

          <div>
            <button style={styles.button} onClick={fetchQrCode}> 🔄 Refresh QR Code</button>
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
          <input
            type="text"
            placeholder="Nomor Telepon"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #ccc', borderRadius: '4px' }}
          />
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
    </div>
  );
};

export default WhatsappPage;
