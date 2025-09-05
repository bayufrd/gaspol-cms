import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const apiBaseUrl = 'http://localhost:8090'; // Set to your actual API base URL as needed.

const WhatsappConfig = () => {
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
    buttonReset: {
      backgroundColor: '#dc3545',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
    img: {
      maxWidth: '100%',
      height: 'auto',
      marginTop: '20px',
    },
    statusLabel: {
      marginTop: '16px',
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#333',
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

  const [qrCode, setQrCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, status: 'Menunggu status...', qrAvailable: false });
  const [logs, setLogs] = useState([]);

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
          fetchQrCode(); // Refresh QR code after reset
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

  useEffect(() => {
    fetchQrCode();
    checkConnectionStatus();
    fetchLogs();
    const intervalId = setInterval(() => {
      checkConnectionStatus();
      fetchLogs();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={styles.card}>
      <h2>Scan QR Code untuk WhatsApp</h2>
      {qrCode ? <img src={qrCode} alt="QR Code" style={styles.img} /> : <p>Loading QR Code...</p>}
      
      <div style={styles.statusLabel}>
        <h4>{connectionStatus.status}</h4>
        <p>status :</p>
        <p>{connectionStatus.connected ? "✔ Terhubung" : "✖ Tidak Terhubung"}</p>
        <p>{connectionStatus.qrAvailable ? "✔ QR Code Tersedia" : "✖ QR Code Tidak Tersedia"}</p>
      </div>

      <div>
        <button style={styles.button} onClick={fetchQrCode}>Refresh QR Code</button>
        <button style={{ ...styles.button, ...styles.buttonReset }} onClick={resetLogin}>Reset Login</button>
      </div>

      <div style={styles.logContainer}>
        <h5>Logs</h5>
        {logs.map((log, index) => <div key={index}>{log}</div>)}
      </div>
    </div>
  );
};

export default WhatsappConfig;