
import React, { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/whatsapp-page.css";

// Prefer relative paths so CRA dev proxy (or same-origin deployment) avoids CORS.
// Support runtime configuration via `window.__APP_CONFIG__` so the deployed
// static bundle can be pointed to a different backend without rebuilding.
// Priority for determining `apiBaseUrl`:
// 1. `window.__APP_CONFIG__` when it sets REACT_APP_FORCE_REMOTE and REACT_APP_API_WHATSAPP_URL
// 2. Build-time env (process.env.REACT_APP_FORCE_REMOTE && REACT_APP_API_WHATSAPP_URL)
// 3. Fallback to relative path ('')
const runtimeConfig = (typeof window !== 'undefined' && window.__APP_CONFIG__) ? window.__APP_CONFIG__ : {};
const runtimeForce = runtimeConfig.REACT_APP_FORCE_REMOTE === 'true' || runtimeConfig.REACT_APP_FORCE_REMOTE === true || runtimeConfig.forceRemote === 'true' || runtimeConfig.forceRemote === true;
const runtimeWhatsappUrl = runtimeConfig.REACT_APP_API_WHATSAPP_URL || runtimeConfig.API_WHATSAPP_URL || runtimeConfig.whatsappUrl || null;
const apiBaseUrl = (runtimeForce && runtimeWhatsappUrl)
  ? runtimeWhatsappUrl
  : ((process.env.REACT_APP_FORCE_REMOTE === 'true' && process.env.REACT_APP_API_WHATSAPP_URL)
    ? process.env.REACT_APP_API_WHATSAPP_URL
    : '');
const WA_APP_TOKEN = runtimeConfig.REACT_APP_WHATSAPP_APP_TOKEN || process.env.REACT_APP_WHATSAPP_APP_TOKEN || null;
const apiUrlBaseBackend = runtimeConfig.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;

const WhatsappPage = ({ userTokenData }) => {
  const { isDark } = useTheme();
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
  const [isSending, setIsSending] = useState(false);
  const [sendCountdown, setSendCountdown] = useState(0);

  // --- State untuk Members ---
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [expandedLogEntry, setExpandedLogEntry] = useState(null);

  // Ref for auto-scroll to bottom on logs container
  const logsContainerRef = useRef(null);

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (logsContainerRef.current && logs && logs.length > 0) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

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
      alignItems: 'center',
      cursor: 'pointer',
      padding: '12px 8px',
      borderBottom: '2px solid #f0f0f0',
      flexWrap: 'wrap',
      gap: '8px',
      minHeight: '50px',
      fontSize: 'clamp(12px, 2.5vw, 14px)',
    },
    tabItem: {
      padding: '8px 12px',
      borderRadius: '4px 4px 0 0',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease',
      flex: '1 1 auto',
      minWidth: '100px',
      textAlign: 'center',
      borderBottom: '3px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },
    tabItemActive: {
      fontWeight: '600',
      borderBottomColor: '#007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
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
        const data = {};

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
      html: '<p style="font-size: 16px; margin: 15px 0;">Apakah Anda yakin ingin <strong>reset login</strong> dan <strong>scan ulang QR WhatsApp</strong>?</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Reset!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const headers = WA_APP_TOKEN ? { headers: { 'x-app-token': WA_APP_TOKEN } } : {};
          await axios.get(`${apiBaseUrl}/reset`, headers);
          await fetchWaStatus();
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Login telah direset. Silahkan scan QR Code baru.",
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
          });
        } catch (error) {
          console.error('Error resetting login:', error);
          Swal.fire({
            title: "Gagal",
            text: error.response?.data?.message || "Terjadi kesalahan saat mereset.",
            icon: "error",
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
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
      const url = `${apiUrlBaseBackend}/whatsapp-log`;
      const response = await axios.get(url, { withCredentials: false });
      // API returns { status, message, data: { messages: [...], pagination: {...}, ... } }
      if (response.data?.status && response.data?.data?.messages) {
        setLogs(response.data.data.messages);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    }
  };

  const showFeatureUnavailable = (featureName = 'Fitur') => {
    Swal.fire({
      icon: 'info',
      title: 'Fitur belum tersedia',
      text: featureName + ' belum tersedia saat ini.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
    });
  };

  const getLogLines = () => {
    // Normalize logs into array of lines. Support: array, string, or other
    if (!logs) return [];
    if (Array.isArray(logs)) {
      // if it's an array of objects/strings, map to strings
      return logs.map(l => (typeof l === 'string' ? l : JSON.stringify(l))).join('\n').split('\n');
    }
    if (typeof logs === 'string') return logs.split(/\r?\n/);
    try {
      return JSON.stringify(logs).split(/\r?\n/);
    } catch (e) {
      return [String(logs)];
    }
  };

  const parseLogEntries = (maxLines = 200) => {
    const lines = getLogLines();
    if (!lines || lines.length === 0) return [];
    // take only last maxLines to limit processing
    const slice = lines.slice(Math.max(0, lines.length - maxLines));

    // Preprocess: combine timestamp-only lines and header+value lines into single logical lines
    const timestampRegex = /^\d{1,2}\/\d{1,2}\/\d{4},\s*\d{1,2}:\d{2}:\d{2}\s*(AM|PM)?/i;
    const combinedLines = [];
    for (let i = 0; i < slice.length; i++) {
      const cur = (slice[i] || '').trim();
      if (!cur) continue;

      // If current line looks like a timestamp, gather following non-timestamp lines as message
      if (timestampRegex.test(cur)) {
        let j = i + 1;
        const collected = [];
        // Collect all following non-timestamp lines (could be multi-line messages)
        while (j < slice.length && !(timestampRegex.test((slice[j] || '').trim()))) {
          const t = (slice[j] || '').trim();
          if (t) collected.push(t);
          j++;
        }
        if (collected.length > 0) {
          // Join with space but preserve message structure (limit preview to first 200 chars)
          const fullMessage = collected.join(' ');
          combinedLines.push(cur + ' - ' + fullMessage);
          i = j - 1;
          continue;
        } else {
          combinedLines.push(cur);
          continue;
        }
      }

      // If current line is a header ending with ':' and next line is not a timestamp, merge them
      const next = (slice[i + 1] || '').trim();
      if (cur.endsWith(':') && next && !timestampRegex.test(next)) {
        combinedLines.push(cur + ' ' + next);
        i = i + 1;
        continue;
      }

      combinedLines.push(cur);
    }

    const entries = [];

    const normalize = (s) => s.replace(/^\s+|\s+$/g, '');

    const isPostReq = (text) => /POST REQ/i.test(text);
    const isOutgoing = (text) => /Pesan Terkirim|Pesan Terkirim ke|kirim-pesan|kirim-lampiran/i.test(text);

    const signatureOf = (s) => {
      if (!s) return '';
      let t = String(s);
      // Extract first line for multi-line messages
      t = t.split('\n')[0];
      t = t.split('-')[0];
      t = t.replace(/^(POST REQ|GET|DELETE|PUT|PATCH):\s*/i, '');
      t = t.replace(/\.\.\.|\u2026/g, '');
      t = t.replace(/"|\{|\}|\[|\]|\{|\}/g, '');
      t = t.replace(/[:]\s*$/g, '');
      t = t.replace(/[.,;!()]+$/g, '');
      t = t.trim().toLowerCase();
      return t.substring(0, 60);
    };

    for (let raw of combinedLines) {
      if (!raw || !raw.trim()) continue;
      let ts = '';
      let text = raw;
      const dashIndex = raw.indexOf(' - ');
      if (dashIndex > 0) {
        ts = raw.substring(0, dashIndex).trim();
        text = raw.substring(dashIndex + 3).trim();
      }

      // Extract tag from first line, handle multi-line messages
      let firstLine = text.split('\n')[0];
      let tag = firstLine.split(':')[0] || '';
      tag = tag.length > 30 ? tag.substring(0, 30) + '...' : tag;

      const postFlag = isPostReq(text);
      const direction = postFlag ? 'left' : (isOutgoing(text) ? 'right' : 'left');
      const norm = normalize(text);
      const signature = signatureOf(text);

      const last = entries.length ? entries[entries.length - 1] : null;
      if (last && last.norm === norm && last.direction === direction) {
        last.count += 1;
        last.lastTimestamp = ts || last.lastTimestamp;
      } else {
        entries.push({ text, norm, tag, count: 1, direction, signature, isPostReq: postFlag, firstTimestamp: ts, lastTimestamp: ts });
      }
    }

    // Merge adjacent entries that are identical or one contains the other (to remove redundant short/long repeats)
    const merged = [];
    for (const e of entries) {
      if (merged.length === 0) {
        merged.push({ ...e });
        continue;
      }
      const last = merged[merged.length - 1];
      const sameDir = last.direction === e.direction;
      const a = (last.norm || '').toLowerCase();
      const b = (e.norm || '').toLowerCase();
      const contains = a.includes(b) || b.includes(a);
      if (sameDir && (a === b || contains)) {
        // merge into last
        last.count = (last.count || 1) + (e.count || 1);
        last.lastTimestamp = e.lastTimestamp || last.lastTimestamp;
        // prefer longer text for display
        if ((e.text || '').length > (last.text || '').length) last.text = e.text;
        if ((e.tag || '').length > (last.tag || '').length) last.tag = e.tag;
        if (e.isPostReq) last.isPostReq = true;
      } else {
        merged.push({ ...e });
      }
    }

    // Now perform global grouping: collapse non-adjacent duplicates into single entries with accumulated counts
    const map = new Map();
    merged.forEach((item, idx) => {
      const sig = item.signature || signatureOf(item.text) || (item.norm || '').toLowerCase();
      const key = `${item.direction}||${sig}`;
      if (!map.has(key)) {
        map.set(key, { ...item, lastIndex: idx });
      } else {
        const cur = map.get(key);
        cur.count = (cur.count || 1) + (item.count || 1);
        cur.lastTimestamp = item.lastTimestamp || cur.lastTimestamp;
        cur.isPostReq = cur.isPostReq || item.isPostReq;
        // prefer latest/longer text and tag
        if ((item.text || '').length > (cur.text || '').length) cur.text = item.text;
        if ((item.tag || '').length > (cur.tag || '').length) cur.tag = item.tag;
        cur.lastIndex = idx;
        map.set(key, cur);
      }
    });

    // Return grouped entries in order of their last occurrence (preserve recency)
    const grouped = Array.from(map.values()).sort((a, b) => (a.lastIndex || 0) - (b.lastIndex || 0));

    // Further canonicalize common repetitive patterns so 'Detail Backup' and
    // 'Backup credentials berhasil setelah update' collapse into one logical entry.
    const canonicalKeyOf = (text) => {
      if (!text) return null;
      const t = String(text).toLowerCase();
      if (/backup/.test(t) && /credential|credentials|berhasil/.test(t)) return 'backup_credentials';
      if (/detail backup/.test(t)) return 'backup_credentials';
      if (/koneksi berhasil|koneksi berhasil terhubung|koneksi berhasil/i.test(t)) return 'koneksi_berhasil';
      if (/koneksi terputus|koneksi terputus, mencoba|trying to reconnect|reconnect/i.test(t)) return 'koneksi_terputus';
      if (/connection closed|lastdisconnect|lastdisconnect/i.test(t)) return 'connection_closed';
      if (/pesan terkirim/.test(t)) return 'pesan_terkirim';
      // ignore bare headers like 'post req' as they are redundant
      if (/^post req[:\s]*$/i.test(t)) return 'ignore_post_req';
      return null;
    };

    const finalMap = new Map();
    grouped.forEach((item, idx) => {
      const canon = canonicalKeyOf(item.text) || canonicalKeyOf(item.tag);
      if (canon === 'ignore_post_req') {
        // skip showing bare POST REQ entries
        return;
      }
      // For canonical keys, ignore direction so all variations collapse into one
      const key = canon ? `canon||${canon}` : `${item.direction}||${item.signature || item.norm}`;
      const stored = { ...item, firstSeenIndex: idx };
      if (canon) stored.canonical = canon;

      if (!finalMap.has(key)) {
        finalMap.set(key, stored);
      } else {
        const cur = finalMap.get(key);
        cur.count = (cur.count || 1) + (item.count || 1);
        cur.lastTimestamp = item.lastTimestamp || cur.lastTimestamp;
        cur.isPostReq = cur.isPostReq || item.isPostReq;
        // prefer shorter text/tag (more concise) unless one is clearly more detailed
        // but keep POST requests since they provide specific context
        if (!cur.isPostReq && !item.isPostReq) {
          if ((item.text || '').length < (cur.text || '').length) cur.text = item.text;
          if ((item.tag || '').length < (cur.tag || '').length) cur.tag = item.tag;
        }
        cur.firstSeenIndex = Math.min(cur.firstSeenIndex || idx, idx);
        finalMap.set(key, cur);
      }
    });

    // Return final grouped entries ordered by first seen index (older first)
    const finalArr = Array.from(finalMap.values()).sort((a, b) => (a.firstSeenIndex || 0) - (b.firstSeenIndex || 0));
    
    // Filter out redundant entries: if a shorter/concise entry exists for the same canonical meaning,
    // remove longer verbose entries to avoid showing duplicates
    const dedupedArr = [];
    const seenCanonicals = new Set();
    
    for (const entry of finalArr) {
      const canon = canonicalKeyOf(entry.text) || canonicalKeyOf(entry.tag);
      const entryLen = (entry.text || '').length + (entry.tag || '').length;
      
      // If this has a canonical key (system-level message like connection/backup)
      if (canon) {
        if (seenCanonicals.has(canon)) {
          // Already have this canonical message, skip it
          continue;
        }
        seenCanonicals.add(canon);
        dedupedArr.push(entry);
      } else {
        // No canonical key (user messages like "Pesan Terkirim ke..."), keep all
        dedupedArr.push(entry);
      }
    }
    
    return dedupedArr;
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
        icon: 'warning',
        title: 'Gagal',
        text: 'Nomor dan pesan wajib diisi.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    setIsSending(true);
    setSendCountdown(5);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setSendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsSending(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const latest = await checkConnectionStatus();

      // if not connected, block sending
      if (!latest?.connected) {
        clearInterval(countdownInterval);
        setIsSending(false);
        setSendCountdown(0);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'WhatsApp belum terhubung. Scan QR atau tautkan WhatsApp terlebih dahulu.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
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
        const base64String = await compressImage(lampiran);
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

      clearInterval(countdownInterval);
      setIsSending(false);
      setSendCountdown(0);

      // Success notification with target number
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Pesan berhasil terkirim ke ${nomorFormated}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });

      // Clear form
      setPesan('');
      setLampiran(null);
      setIsAttachment(false);

    } catch (error) {
      clearInterval(countdownInterval);
      setIsSending(false);
      setSendCountdown(0);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.error || 'Terjadi kesalahan saat mengirim pesan.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };


  useEffect(() => {
    if (activeTab === 'config') {
      fetchWaStatus();
      checkConnectionStatus();
      fetchLogs();
      // Auto-refresh hanya untuk status koneksi, bukan logs
      const intervalId = setInterval(() => {
        checkConnectionStatus();
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab]);

  return (
    <div className="whatsapp-page-container">
      <div className="page-title">
        <div className="row">
          <div className="col-12 col-md-6 order-md-1 order-last mb-3">
            <h3>Whatsapp</h3>
          </div>
        </div>
      </div>
      <div className="whatsapp-tab-container">
        <button 
          className={`whatsapp-tab-item ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => { setActiveTab('config'); fetchWaStatus(); }}
        >
          <i className="bi bi-gear"></i>Konfigurasi
        </button>
        <button 
          className={`whatsapp-tab-item ${activeTab === 'message' ? 'active' : ''}`}
          onClick={() => setActiveTab('message')}
        >
          <i className="bi bi-chat-dots"></i>Pesan
        </button>
        <button 
          className={`whatsapp-tab-item ${activeTab === 'template-pos' ? 'active' : ''}`}
          onClick={() => showFeatureUnavailable('Template POS')}
        >
          <i className="bi bi-receipt"></i>Template
        </button>
        <button 
          className={`whatsapp-tab-item ${activeTab === 'broadcat' ? 'active' : ''}`}
          onClick={() => showFeatureUnavailable('Broadcast Pesan')}
        >
          <i className="bi bi-megaphone"></i>Broadcast
        </button>
      </div>

      {activeTab === 'config' && (
        <div className="whatsapp-card">
          <h2>Scan QR Code untuk WhatsApp</h2>
          <div className="whatsapp-qr-container">
            {qrCode ? <img src={qrCode} alt="QR Code" /> : <p>Loading QR Code...</p>}
          </div>

          <div className="whatsapp-status-box">
            <div className="whatsapp-status-row">
              <span className="whatsapp-status-label">Status</span>
              <span className={`whatsapp-status-value ${connectionStatus.connected ? 'whatsapp-status-connected' : 'whatsapp-status-disconnected'}`}>
                {connectionStatus.connected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
            <div className="whatsapp-status-row">
              <span className="whatsapp-status-label">QR Code</span>
              <span className="whatsapp-status-value">{qrCode ? "✅ Tersedia, Silahkan Scan/Scan Ulang QR Code" : "❌ Tidak Tersedia"}</span>
            </div>
            <div className="whatsapp-status-row">
              <span className="whatsapp-status-label">Terakhir Update</span>
              <span className="whatsapp-status-value">{formatTimestamp(connectionStatus.lastUpdate)}</span>
            </div>
            {connectionStatus.lastDisconnectInfo && (
              <div className="whatsapp-status-row">
                <span className="whatsapp-status-label">Info</span>
                <span className="whatsapp-status-value">{extractDisconnectMessage(connectionStatus.lastDisconnectInfo) || formatTimestamp(connectionStatus.lastDisconnectInfo?.date)}</span>
              </div>
            )}
          </div>

          <div className="whatsapp-button-group">
            <button 
              className="whatsapp-button"
              onClick={async () => { 
                await fetchWaStatus(); 
                Swal.fire({
                  icon: 'success',
                  title: 'Berhasil',
                  text: 'QR Code dan log telah diperbarui.',
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 2500,
                });
              }}
            >
              <i className="bi bi-arrow-clockwise"></i>Refresh QR Code
            </button>
            <button 
              className="whatsapp-button whatsapp-button-danger"
              onClick={resetLogin}
            >
              <i className="bi bi-arrow-counterclockwise"></i>Reset Login
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h5><i className="bi bi-chat-left-text" style={{marginRight: '8px'}}></i>Logs Pesan</h5>
            <p style={{ marginTop: 0, marginBottom: '12px', color: '#666', fontSize: '13px', textAlign: 'left' }}>Menampilkan log pesan terkirim dalam tampilan chat WhatsApp.</p>

            <div ref={logsContainerRef} className="whatsapp-logs-container">
              {(() => {
                // logs is now an array of message objects from /whatsapp-log API
                if (!logs || !Array.isArray(logs) || logs.length === 0) {
                  return <div className="whatsapp-logs-empty">Tidak ada log pesan.</div>;
                }

                return logs.map((msg, idx) => {
                  const content = msg.content || '';
                  const isLongMsg = content.length > 200;
                  const isExpanded = expandedLogEntry === idx;
                  const displayContent = isExpanded ? content : (isLongMsg ? content.substring(0, 200) + '...' : content);

                  return (
                    <div key={msg.id || idx} className="whatsapp-log-message">
                      <div className="whatsapp-message-bubble">
                        {msg.phoneNumber && (
                          <div className="whatsapp-message-phone">📱 +{msg.phoneNumber}</div>
                        )}
                        <div style={{ fontSize: 14, lineHeight: '1.4' }}>{displayContent}</div>
                        {isLongMsg && (
                          <button
                            onClick={() => setExpandedLogEntry(isExpanded ? null : idx)}
                            className="whatsapp-message-expand"
                          >
                            {isExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                          </button>
                        )}
                        <div className="whatsapp-message-time">
                          <span>{msg.timestamp || '-'}</span>
                          <span style={{ color: '#53bdeb' }}>✓✓</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="whatsapp-button-group">
              <button 
                className="whatsapp-button"
                onClick={() => { fetchLogs(); Swal.fire({ icon: 'success', title: 'Refresh', text: 'Log diperbarui', timer: 1200, showConfirmButton: false }); }}
              >
                <i className="bi bi-arrow-clockwise"></i>Refresh
              </button>
              <button 
                className="whatsapp-button whatsapp-button-secondary"
                onClick={() => { 
                  const logText = logs.map(m => `[${m.timestamp}] ${m.phoneNumber ? '+' + m.phoneNumber : ''}: ${m.content}`).join('\n');
                  navigator?.clipboard?.writeText(logText).then(()=>{ Swal.fire({ icon:'success', title: 'Disalin', text: 'Log pesan disalin ke clipboard', toast: true, position: 'top-end', showConfirmButton:false, timer:1500 }) }).catch(()=>{ Swal.fire({ icon:'error', title:'Gagal', text:'Tidak dapat menyalin ke clipboard' }) }) 
                }}
              >
                <i className="bi bi-clipboard"></i>Salin
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'message' && (
        <div className="whatsapp-card">
          <h2>Kirim Pesan WhatsApp</h2>
          <div className="whatsapp-form-group">
            <label className="whatsapp-form-label">Nomor Telepon</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Masukkan nomor telepon..."
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
                className="whatsapp-form-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setShowModal(true)}
                className="whatsapp-button whatsapp-button-form"
                title="Pilih dari Member"
              >
                <i className="bi bi-person-fill-check"></i>
              </button>
            </div>
          </div>

          <div className="whatsapp-form-group">
            <label className="whatsapp-form-label">Pesan</label>
            <textarea
              placeholder="Ketikkan pesan Anda..."
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="whatsapp-form-textarea"
            />
          </div>

          <div className="whatsapp-checkbox-group">
            <input
              type="checkbox"
              id="isAttachment"
              className="whatsapp-checkbox"
              checked={isAttachment}
              onChange={() => setIsAttachment(!isAttachment)}
            />
            <label htmlFor="isAttachment">Kirim dengan Lampiran</label>
          </div>
          {isAttachment && (
            <div className="whatsapp-form-group">
              <label className="whatsapp-form-label">Pilih File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="whatsapp-form-input"
                accept="image/*"
              />
            </div>
          )}
          <div className="whatsapp-button-group" style={{ justifyContent: "flex-start" }}>
            <button 
              className="whatsapp-button whatsapp-button-send"
              onClick={handleSendMessage}
              disabled={isSending}
              style={{ opacity: isSending ? 0.6 : 1, cursor: isSending ? 'not-allowed' : 'pointer', flex: '0 1 auto', minWidth: '150px' }}
            >
              {isSending ? `Tunggu ${sendCountdown}s...` : '📤 Kirim Pesan'}
            </button>
          </div>
        </div>
      )}
      {/* Modal pilih member */}
      {showModal && (
        <div className="whatsapp-modal-backdrop">
          <div className="whatsapp-modal-content">
            <div className="whatsapp-modal-header">
              <h3>Pilih Member</h3>
              <button
                aria-label="Tutup"
                onClick={() => setShowModal(false)}
                className="whatsapp-modal-close"
              >
                ✖
              </button>
            </div>

            <div className="whatsapp-modal-body">
              <div className="whatsapp-search-group">
                <h3>Cari Member</h3>
                <input
                  type="text"
                  placeholder="Cari nama, email, atau telepon..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="whatsapp-search-input"
                  style={{ flex: 1, minWidth: '200px' }}
                />
              </div>

              {isLoading && <p>Loading...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {!isLoading && filteredMembers.length === 0 && <p>Tidak ada member</p>}

              <table className="whatsapp-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Telepon</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m, idx) => (
                    <tr key={idx}>
                      <td>{m.member_name || "-"}</td>
                      <td>{m.member_email || "-"}</td>
                      <td>{m.member_phone_number || "-"}</td>
                      <td className="whatsapp-table-action">
                        <button
                          className="whatsapp-action-button"
                          onClick={() => {
                            setNomor(m.member_phone_number || "");
                            setShowModal(false);
                          }}
                        >
                          ✅ Pilih
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsappPage;
