import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Swal from "../utils/alerts";

const ALLOWED_MENU_TYPES = [
  "Makanan",
  "Minuman",
  "Additional Makanan",
  "Additional Minuman",
];

const normalizeText = (val) =>
  String(val || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const resolveMenuType = (raw) => {
  const clean = normalizeText(raw);
  if (!clean) return "";
  const exact = ALLOWED_MENU_TYPES.find((t) => t.toLowerCase() === clean);
  if (exact) return exact;
  if (clean.includes("add") && clean.includes("makan")) return "Additional Makanan";
  if (clean.includes("add") && clean.includes("minum")) return "Additional Minuman";
  if (clean.includes("makan") || clean === "food") return "Makanan";
  if (clean.includes("minum") || clean === "drink") return "Minuman";
  return raw;
};

const parseNumericPrice = (val, fallback = "") => {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "number" && Number.isFinite(val)) {
    return Math.max(0, Math.round(val));
  }
  const digits = String(val).replace(/[^0-9-]/g, "");
  if (!digits) return fallback;
  const num = parseInt(digits, 10);
  return Number.isNaN(num) ? fallback : Math.max(0, num);
};

const buildEmptyRow = (servingTypes = [], rowId = 1) => {
  const prices = {};
  servingTypes.forEach((st) => {
    prices[st.id] = "";
  });
  return {
    _rowId: `row_${Date.now()}_${rowId}_${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    menu_type: "Makanan",
    varian: "",
    is_active: 1,
    base_price: "",
    prices,
  };
};

// Deterministic hash for idempotency_key so retries of the exact same batch never duplicate
const computeBatchFingerprint = (outletId, mode, items) => {
  const raw = JSON.stringify({
    o: outletId,
    m: mode,
    i: items.map((r) => [
      String(r.menu_id || "").trim(),
      normalizeText(r.name),
      r.menu_type,
      normalizeText(r.varian),
      r.is_active,
      r.base_price,
      r.prices,
    ]),
  });
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return `batch_${outletId}_${mode}_${(hash >>> 0).toString(16)}_${items.length}`;
};

export const MenuBatchModal = ({
  show,
  onClose,
  onSuccess,
  userTokenData,
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const outletId = userTokenData?.outlet_id || 1;
  const fileInputRef = useRef(null);

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const [outletName, setOutletName] = useState(`Outlet #${outletId}`);
  const [servingTypes, setServingTypes] = useState([]);
  const [existingMenus, setExistingMenus] = useState([]);
  const [rows, setRows] = useState([]);
  const [importMode, setImportMode] = useState("upsert"); // 'upsert' | 'skip'
  const [rowFilter, setRowFilter] = useState("all"); // 'all' | 'valid' | 'error' | 'new' | 'update'
  const [uploadedFileName, setUploadedFileName] = useState("");

  useEffect(() => {
    if (show) {
      fetchBatchMetadata();
    }
  }, [show, outletId]);

  const fetchBatchMetadata = async () => {
    setLoadingMeta(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/v2/menu/batch/metadata`, {
        params: { outlet_id: outletId },
      });
      const data = response.data?.data || {};
      const loadedServingTypes = data.serving_types || [];
      setOutletName(data.outlet_name || `Outlet #${outletId}`);
      setServingTypes(loadedServingTypes);
      setExistingMenus(data.existing_menus || []);

      setRows((prev) =>
        prev.length > 0
          ? prev
          : [
              buildEmptyRow(loadedServingTypes, 1),
              buildEmptyRow(loadedServingTypes, 2),
              buildEmptyRow(loadedServingTypes, 3),
            ]
      );
    } catch (error) {
      console.error("Failed to load batch metadata:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Metadata Outlet",
        text: error.response?.data?.message || "Tidak dapat memuat daftar Serving Type outlet.",
      });
    } finally {
      setLoadingMeta(false);
    }
  };

  // Lookup map of existing menu names & variants in this outlet
  const existingMenuMap = useMemo(() => {
    const map = new Map();
    existingMenus.forEach((m) => {
      const normName = normalizeText(m.name);
      const variantSet = new Set(
        (m.variants || []).map((v) => normalizeText(v.varian))
      );
      map.set(normName, {
        ...m,
        variantSet,
      });
    });
    return map;
  }, [existingMenus]);

  // Real-time validation & status classification for every row
  const evaluatedRows = useMemo(() => {
    return rows.map((row, index) => {
      const cleanName = String(row.name || "").trim();
      const normName = normalizeText(cleanName);
      const cleanVarian = String(row.varian || "").trim();
      const normVarian = normalizeText(cleanVarian);
      const isTypeValid = ALLOWED_MENU_TYPES.includes(row.menu_type);

      const parsedBase = parseNumericPrice(row.base_price, "");
      const hasValidBasePrice = parsedBase !== "" && parsedBase >= 0;

      const rowErrors = [];
      if (!cleanName) rowErrors.push("Nama menu wajib diisi");
      if (!isTypeValid) rowErrors.push("Pilih Tipe Menu yang valid");
      if (!hasValidBasePrice) rowErrors.push("Harga dasar wajib >= 0");

      const existingMatch = normName ? existingMenuMap.get(normName) : null;
      let statusType = "new"; // 'new' | 'variant' | 'update' | 'skip' | 'error'
      let statusLabel = "MENU BARU";

      if (rowErrors.length > 0) {
        statusType = "error";
        statusLabel = rowErrors[0];
      } else if (existingMatch) {
        if (importMode === "skip") {
          statusType = "skip";
          statusLabel = "DILEWATI (SKIP)";
        } else if (normVarian) {
          const hasVar = existingMatch.variantSet.has(normVarian);
          statusType = "update";
          statusLabel = hasVar ? "UPDATE VARIAN" : "VARIAN BARU";
        } else {
          statusType = "update";
          statusLabel = "UPDATE MENU";
        }
      } else if (normVarian) {
        statusType = "variant";
        statusLabel = "VARIAN BARU";
      }

      return {
        ...row,
        rowNumber: index + 1,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        statusType,
        statusLabel,
      };
    });
  }, [rows, existingMenuMap, importMode]);

  const stats = useMemo(() => {
    const total = evaluatedRows.length;
    const valid = evaluatedRows.filter((r) => r.isValid).length;
    const error = total - valid;
    const newCount = evaluatedRows.filter(
      (r) => r.statusType === "new" || r.statusType === "variant"
    ).length;
    const updateCount = evaluatedRows.filter((r) => r.statusType === "update").length;
    const skipCount = evaluatedRows.filter((r) => r.statusType === "skip").length;
    return { total, valid, error, newCount, updateCount, skipCount };
  }, [evaluatedRows]);

  const filteredRows = useMemo(() => {
    return evaluatedRows.filter((r) => {
      if (rowFilter === "valid") return r.isValid;
      if (rowFilter === "error") return !r.isValid;
      if (rowFilter === "new") return r.statusType === "new" || r.statusType === "variant";
      if (rowFilter === "update") return r.statusType === "update";
      return true;
    });
  }, [evaluatedRows, rowFilter]);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/v2/menu/batch/template`, {
        params: { outlet_id: outletId },
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Template_Batch_Menu_Outlet_${outletId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengunduh Template",
        text: "Tidak dapat mengunduh file template Excel dari server.",
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleExportMenus = async () => {
    setExportingExcel(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/v2/menu/batch/export`, {
        params: { outlet_id: outletId },
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Export_Menu_Outlet_${outletId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting menus:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Export Excel",
        text: "Tidak dapat mengunduh data menu outlet.",
      });
    } finally {
      setExportingExcel(false);
    }
  };

  // Parse uploaded Excel (.xlsx / .xls / .csv) into staging rows
  const handleExcelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rawJson || rawJson.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "File Excel Kosong",
          text: "Tidak ditemukan baris data pada sheet pertama file Excel.",
        });
        return;
      }

      const parsedRows = rawJson
        .map((excelRow, idx) => {
          // Flexible header matching
          const entries = Object.entries(excelRow);
          const findCol = (pred) => {
            const found = entries.find(([k]) => pred(normalizeText(k)));
            return found ? found[1] : "";
          };

          const rawMenuId = findCol(
            (k) => k.includes("menu id") || k === "menu_id"
          );
          const rawName = findCol(
            (k) => k.includes("nama menu") || k === "nama" || k === "name" || k === "menu"
          );
          const rawType = findCol(
            (k) => k.includes("tipe menu") || k.includes("kategori") || k === "menu_type" || k === "type"
          );
          const rawVarian = findCol(
            (k) => k.includes("nama varian") || k === "varian" || k === "variant"
          );
          const rawActive = findCol(
            (k) => k.includes("status aktif") || k.includes("status menu") || k === "is_active" || k === "status" || k === "aktif"
          );
          const rawBasePrice = findCol(
            (k) =>
              k.includes("harga dasar") ||
              k === "harga" ||
              k === "base_price" ||
              k === "price"
          );

          const prices = {};
          servingTypes.forEach((st) => {
            const stNorm = normalizeText(st.name);
            const matchedVal = findCol(
              (k) =>
                k === `harga: ${stNorm}` ||
                k === `harga ${stNorm}` ||
                k === stNorm ||
                k.endsWith(`: ${stNorm}`)
            );
            prices[st.id] = parseNumericPrice(matchedVal, "");
          });

          const resolvedBase = parseNumericPrice(
            rawBasePrice,
            Object.values(prices).find((v) => v !== "" && v >= 0) ?? ""
          );

          // Auto-fill empty serving type prices with resolvedBase
          servingTypes.forEach((st) => {
            if (prices[st.id] === "" && resolvedBase !== "") {
              prices[st.id] = resolvedBase;
            }
          });

          const isActiveVal =
            String(rawActive).trim() === "0" ||
            normalizeText(rawActive) === "tidak aktif" ||
            normalizeText(rawActive) === "nonaktif"
              ? 0
              : 1;

          return {
            _rowId: `excel_${Date.now()}_${idx}`,
            menu_id: String(rawMenuId || "").trim(),
            name: String(rawName || "").trim(),
            menu_type: resolveMenuType(rawType) || "Makanan",
            varian: String(rawVarian || "").trim(),
            is_active: isActiveVal,
            base_price: resolvedBase,
            prices,
          };
        })
        .filter((r) => r.name !== "" || r.base_price !== "");

      if (parsedRows.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Tidak Ada Baris Valid",
          text: "Pastikan kolom 'Nama Menu *' dan 'Harga Dasar *' terisi sesuai template.",
        });
        return;
      }

      setRows(parsedRows);
      setRowFilter("all");
    } catch (error) {
      console.error("Failed to parse Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Membaca File Excel",
        text: "Format file tidak dikenali. Gunakan file .xlsx dari tombol Download Template.",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCellChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._rowId !== rowId) return r;
        if (field === "base_price") {
          const cleanPrice = parseNumericPrice(value, "");
          const updatedPrices = { ...r.prices };
          // Also fill any empty serving prices with base_price for convenience
          servingTypes.forEach((st) => {
            if (updatedPrices[st.id] === "" || updatedPrices[st.id] === r.base_price) {
              updatedPrices[st.id] = cleanPrice;
            }
          });
          return { ...r, base_price: cleanPrice, prices: updatedPrices };
        }
        return { ...r, [field]: value };
      })
    );
  };

  const handleServingPriceChange = (rowId, servingTypeId, value) => {
    const cleanPrice = parseNumericPrice(value, "");
    setRows((prev) =>
      prev.map((r) => {
        if (r._rowId !== rowId) return r;
        return {
          ...r,
          prices: {
            ...r.prices,
            [servingTypeId]: cleanPrice,
          },
        };
      })
    );
  };

  const handleAddRows = (count = 1) => {
    setRows((prev) => {
      const next = [...prev];
      for (let i = 0; i < count; i++) {
        next.push(buildEmptyRow(servingTypes, prev.length + i + 1));
      }
      return next;
    });
  };

  const handleRemoveRow = (rowId) => {
    setRows((prev) => {
      const next = prev.filter((r) => r._rowId !== rowId);
      return next.length > 0 ? next : [buildEmptyRow(servingTypes, 1)];
    });
  };

  const handleClearAllRows = () => {
    setUploadedFileName("");
    setRows([
      buildEmptyRow(servingTypes, 1),
      buildEmptyRow(servingTypes, 2),
      buildEmptyRow(servingTypes, 3),
    ]);
  };

  const handleSyncAllServingPricesToBase = () => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.base_price === "") return r;
        const synced = {};
        servingTypes.forEach((st) => {
          synced[st.id] =
            r.prices[st.id] !== "" && r.prices[st.id] !== undefined
              ? r.prices[st.id]
              : r.base_price;
        });
        return { ...r, prices: synced };
      })
    );
  };

  // Safe Submit with Idempotency Key + Automatic Safe Retry on transient network error
  const handleBatchSubmit = async () => {
    // Filter out completely blank rows
    const nonBlankRows = evaluatedRows.filter(
      (r) => String(r.name || "").trim() !== "" || r.base_price !== ""
    );

    if (nonBlankRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Belum Ada Data Menu",
        text: "Silakan isi minimal 1 baris menu atau upload file Excel terlebih dahulu.",
      });
      return;
    }

    const invalidRows = nonBlankRows.filter((r) => !r.isValid);
    if (invalidRows.length > 0) {
      setRowFilter("error");
      Swal.fire({
        icon: "error",
        title: `Terdapat ${invalidRows.length} Baris Perlu Perbaikan`,
        text: `Baris #${invalidRows[0].rowNumber}: ${invalidRows[0].errors.join(", ")}. Silakan perbaiki langsung pada tabel yang ditandai merah.`,
      });
      return;
    }

    const payloadItems = nonBlankRows.map((r) => ({
      row_number: r.rowNumber,
      ...(String(r.menu_id || "").trim() ? { menu_id: Number(r.menu_id) } : {}),
      name: String(r.name).trim(),
      menu_type: r.menu_type,
      varian: String(r.varian || "").trim(),
      is_active: Number(r.is_active) === 0 ? 0 : 1,
      base_price: Number(r.base_price || 0),
      prices: Object.fromEntries(
        servingTypes.map((st) => [
          st.id,
          r.prices[st.id] !== "" && r.prices[st.id] !== undefined
            ? Number(r.prices[st.id])
            : Number(r.base_price || 0),
        ])
      ),
    }));

    const idempotencyKey = computeBatchFingerprint(outletId, importMode, payloadItems);

    setSubmitting(true);
    const maxNetworkRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxNetworkRetries; attempt++) {
      try {
        const response = await axios.post(
          `${apiBaseUrl}/v2/menu/batch/import`,
          {
            outlet_id: outletId,
            mode: importMode,
            idempotency_key: idempotencyKey,
            items: payloadItems,
          },
          {
            timeout: 45000,
          }
        );

        const summary = response.data?.data || {};
        setSubmitting(false);

        await Swal.fire({
          icon: "success",
          title: "Batch Upload Berhasil!",
          html: `
            <div style="text-align:left;font-size:0.92rem;line-height:1.6;">
              <div><strong>Outlet:</strong> ${outletName}</div>
              <div><strong>Menu Baru Dibuat:</strong> ${summary.created_menus || 0} menu</div>
              <div><strong>Menu Lama Diupdate:</strong> ${summary.updated_menus || 0} menu</div>
              <div><strong>Varian Diproses:</strong> ${(summary.created_variants || 0) + (summary.updated_variants || 0)} varian</div>
              <div><strong>Harga Serving Type Tersimpan:</strong> ${summary.upserted_prices || 0} harga</div>
              <div><strong>Waktu Proses Atomic:</strong> ${summary.duration_ms || 0} ms</div>
            </div>
          `,
        });

        handleClearAllRows();
        if (onSuccess) await onSuccess();
        onClose();
        return;
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        const isTransient =
          !status || status === 502 || status === 503 || status === 504 || error.code === "ECONNABORTED";

        if (isTransient && attempt < maxNetworkRetries) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
        break;
      }
    }

    setSubmitting(false);
    const errMsg =
      lastError?.response?.data?.message ||
      lastError?.message ||
      "Terjadi kesalahan saat menyimpan batch menu.";
    Swal.fire({
      icon: "error",
      title: "Gagal Menyimpan Batch Menu",
      text: errMsg,
    });
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(19, 20, 22, 0.45)",
        zIndex: 1055,
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        style={{ maxWidth: "94vw" }}
      >
        <div
          className="modal-content"
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          {/* Header */}
          <div
            className="modal-header border-bottom px-4 py-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div>
              <span
                className="badge mb-1"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                  fontWeight: 600,
                }}
              >
                {outletName} · Studio Menu Massal
              </span>
              <h4
                className="modal-title fw-bold mb-0"
                style={{ color: "var(--text)", fontSize: "1.125rem" }}
              >
                Batch Upload, Export & Tabel Editor Menu Massal
              </h4>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4" style={{ maxHeight: "78vh", overflowY: "auto" }}>
            {/* Step 1 & 2 Toolbar: Template, Export, Upload Excel, Mode */}
            <div className="row g-3 mb-3 align-items-stretch">
              <div className="col-12 col-lg-4">
                <div className="p-3 border rounded-3 h-100 bg-light-subtle">
                  <div className="fw-bold mb-1">
                    <i className="bi bi-file-earmark-spreadsheet text-success me-2"></i>
                    1. Template & Export Excel
                  </div>
                  <small className="text-muted d-block mb-3">
                    Unduh template kosong sesuai Serving Type outlet ini, atau export menu yang sudah ada untuk diedit massal.
                  </small>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success fw-semibold"
                      onClick={handleDownloadTemplate}
                      disabled={downloadingTemplate || submitting}
                    >
                      <i className="bi bi-download me-1"></i>
                      {downloadingTemplate ? "Mengunduh..." : "Download Template .xlsx"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary fw-semibold"
                      onClick={handleExportMenus}
                      disabled={exportingExcel || submitting}
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      {exportingExcel ? "Meng-export..." : "Export Menu Saat Ini"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="p-3 border rounded-3 h-100 bg-light-subtle">
                  <div className="fw-bold mb-1">
                    <i className="bi bi-cloud-arrow-up text-primary me-2"></i>
                    2. Import File Excel (.xlsx / .csv)
                  </div>
                  <small className="text-muted d-block mb-2">
                    Pilih file Excel yang sudah diisi untuk langsung dimuat ke Tabel Preview di bawah.
                  </small>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="form-control form-control-sm"
                    onChange={handleExcelFileChange}
                    disabled={submitting}
                  />
                  {uploadedFileName && (
                    <small className="text-success d-block mt-1 fw-semibold">
                      <i className="bi bi-check-circle me-1"></i>
                      File dimuat: {uploadedFileName}
                    </small>
                  )}
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="p-3 border rounded-3 h-100 bg-light-subtle">
                  <div className="fw-bold mb-1">
                    <i className="bi bi-shield-check text-info me-2"></i>
                    3. Mode Duplikat & Aksi Cepat
                  </div>
                  <div className="mb-2">
                    <select
                      className="form-select form-select-sm"
                      value={importMode}
                      onChange={(e) => setImportMode(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="upsert">
                        Mode Upsert: Update Harga/Varian jika Nama Menu Sudah Ada
                      </option>
                      <option value="skip">
                        Mode Skip: Lewati Menu yang Namanya Sudah Terdaftar
                      </option>
                    </select>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleAddRows(5)}
                      disabled={submitting}
                    >
                      <i className="bi bi-plus-lg me-1"></i>+5 Baris Manual
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark"
                      onClick={handleSyncAllServingPricesToBase}
                      disabled={submitting}
                      title="Isi semua kolom harga Serving Type yang kosong dengan Harga Dasar"
                    >
                      <i className="bi bi-magic me-1"></i>Samakan Harga Kosong
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleClearAllRows}
                      disabled={submitting}
                    >
                      Reset Tabel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Live Summary Bar */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${rowFilter === "all" ? "btn-dark" : "btn-outline-secondary"}`}
                  onClick={() => setRowFilter("all")}
                >
                  Semua Baris ({stats.total})
                </button>
                <button
                  type="button"
                  className={`btn ${rowFilter === "new" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setRowFilter("new")}
                >
                  Menu / Varian Baru ({stats.newCount})
                </button>
                <button
                  type="button"
                  className={`btn ${rowFilter === "update" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setRowFilter("update")}
                >
                  Update Menu Lama ({stats.updateCount})
                </button>
                <button
                  type="button"
                  className={`btn ${rowFilter === "error" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => setRowFilter("error")}
                >
                  Perlu Perbaikan ({stats.error})
                </button>
              </div>

              <div className="small text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Tip: Untuk menambahkan <strong>Varian</strong>, tulis <em>Nama Menu</em> yang sama lalu isi kolom <em>Nama Varian</em>.
              </div>
            </div>

            {/* Interactive Spreadsheet Preview Table */}
            {loadingMeta ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted">Memuat konfigurasi Serving Type outlet...</div>
              </div>
            ) : (
              <div
                className="table-responsive border rounded-3"
                style={{ maxHeight: "46vh", overflowY: "auto" }}
              >
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead
                    className="table-light"
                    style={{ position: "sticky", top: 0, zIndex: 5 }}
                  >
                    <tr>
                      <th style={{ width: "44px" }} className="text-center">#</th>
                      <th style={{ minWidth: "135px" }}>Status</th>
                      <th style={{ minWidth: "220px" }}>Nama Menu *</th>
                      <th style={{ minWidth: "165px" }}>Tipe Menu *</th>
                      <th style={{ minWidth: "160px" }}>Nama Varian</th>
                      <th style={{ minWidth: "140px" }}>Harga Dasar *</th>
                      {servingTypes.map((st) => (
                        <th key={st.id} style={{ minWidth: "135px" }}>
                          Harga: {st.name}
                        </th>
                      ))}
                      <th style={{ minWidth: "95px" }} className="text-center">Aktif</th>
                      <th style={{ width: "50px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const badgeClass =
                        row.statusType === "error"
                          ? "bg-danger-subtle text-danger border border-danger-subtle"
                          : row.statusType === "update"
                          ? "bg-primary-subtle text-primary border border-primary-subtle"
                          : row.statusType === "skip"
                          ? "bg-secondary-subtle text-secondary"
                          : "bg-success-subtle text-success border border-success-subtle";

                      return (
                        <tr
                          key={row._rowId}
                          className={row.statusType === "error" ? "table-danger" : ""}
                        >
                          <td className="text-center fw-semibold text-muted">
                            {row.rowNumber}
                          </td>
                          <td>
                            <span
                              className={`badge ${badgeClass}`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {row.statusLabel}
                            </span>
                          </td>
                          <td>
                            <input
                              type="text"
                              className={`form-control form-control-sm ${
                                !row.name.trim() ? "is-invalid" : ""
                              }`}
                              placeholder="Contoh: Ayam Bakar Madu"
                              value={row.name}
                              onChange={(e) =>
                                handleCellChange(row._rowId, "name", e.target.value)
                              }
                              disabled={submitting}
                            />
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={row.menu_type}
                              onChange={(e) =>
                                handleCellChange(row._rowId, "menu_type", e.target.value)
                              }
                              disabled={submitting}
                            >
                              {ALLOWED_MENU_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Kosong = Menu Utama"
                              value={row.varian}
                              onChange={(e) =>
                                handleCellChange(row._rowId, "varian", e.target.value)
                              }
                              disabled={submitting}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              className={`form-control form-control-sm ${
                                row.base_price === "" ? "is-invalid" : ""
                              }`}
                              placeholder="25000"
                              value={row.base_price}
                              onChange={(e) =>
                                handleCellChange(row._rowId, "base_price", e.target.value)
                              }
                              disabled={submitting}
                            />
                          </td>
                          {servingTypes.map((st) => (
                            <td key={st.id}>
                              <input
                                type="number"
                                min="0"
                                className="form-control form-control-sm"
                                placeholder={
                                  row.base_price !== "" ? String(row.base_price) : "0"
                                }
                                value={
                                  row.prices[st.id] !== undefined ? row.prices[st.id] : ""
                                }
                                onChange={(e) =>
                                  handleServingPriceChange(row._rowId, st.id, e.target.value)
                                }
                                disabled={submitting}
                              />
                            </td>
                          ))}
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={Number(row.is_active) === 1}
                              onChange={(e) =>
                                handleCellChange(
                                  row._rowId,
                                  "is_active",
                                  e.target.checked ? 1 : 0
                                )
                              }
                              disabled={submitting}
                            />
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => handleRemoveRow(row._rowId)}
                              disabled={submitting}
                              title="Hapus baris"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer justify-content-between px-4 py-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleAddRows(1)}
                disabled={submitting}
              >
                <i className="bi bi-plus-circle me-1"></i>Tambah 1 Baris
              </button>
              <span className="text-muted small">
                Siap disimpan: <strong>{stats.valid}</strong> baris valid
                {stats.error > 0 && (
                  <span className="text-danger ms-2 fw-bold">
                    ({stats.error} baris perlu diperbaiki)
                  </span>
                )}
              </span>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary fw-semibold px-4"
                onClick={handleBatchSubmit}
                disabled={submitting || stats.valid === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Menyimpan secara Atomic...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-check me-2"></i>
                    Simpan Massal ({stats.valid} Baris)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
