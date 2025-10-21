import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const TaxCalculationCustom = ({ show, onClose, outletId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    total_donasi_terkumpul: null,
    total_dana_tersalurkan: null,
    total_donasi_tertampung: null,
  });
  const [auto, setAuto] = useState({
    total_donasi_terkumpul: true,
    total_dana_tersalurkan: true,
    total_donasi_tertampung: true,
  });

  useEffect(() => {
    if (show && outletId) {
      setLoading(true);
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/tax-calculation-custom/${outletId}`)
        .then(res => {
          const data = res.data.data || {};
          setForm({
            total_donasi_terkumpul: data.total_donasi_terkumpul ?? null,
            total_dana_tersalurkan: data.total_dana_tersalurkan ?? null,
            total_donasi_tertampung: data.total_donasi_tertampung ?? null,
          });
          setAuto({
            total_donasi_terkumpul: data.total_donasi_terkumpul == null,
            total_dana_tersalurkan: data.total_dana_tersalurkan == null,
            total_donasi_tertampung: data.total_donasi_tertampung == null,
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [show, outletId]);

  const handleSwitch = (field) => {
    setAuto(a => ({ ...a, [field]: !a[field] }));
    if (!auto[field]) setForm(f => ({ ...f, [field]: null }));
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        outlet_id: outletId,
        total_donasi_terkumpul: auto.total_donasi_terkumpul ? null : Number(form.total_donasi_terkumpul),
        total_dana_tersalurkan: auto.total_dana_tersalurkan ? null : Number(form.total_dana_tersalurkan),
        total_donasi_tertampung: auto.total_donasi_tertampung ? null : Number(form.total_donasi_tertampung),
      };
      await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/tax-calculation-custom/${outletId}`, payload);
      Swal.fire('Berhasil', 'Kalkulasi berhasil diupdate!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      Swal.fire('Error', 'Gagal update kalkulasi', 'error');
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop d-flex justify-content-center align-items-center" style={{ position: 'fixed', inset: 0, zIndex: 1050 }}>
      <div className="card" style={{ width: 400, maxWidth: '95%' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Customize Calculation</strong>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose} disabled={loading}>Tutup</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {['total_donasi_terkumpul', 'total_dana_tersalurkan', 'total_donasi_tertampung'].map((field, idx) => (
              <div className="mb-3" key={field}>
                <label className="form-label">
                  {field === 'total_donasi_terkumpul' && 'Total Donasi Terkumpul'}
                  {field === 'total_dana_tersalurkan' && 'Total Dana Tersalurkan'}
                  {field === 'total_donasi_tertampung' && 'Total Donasi Tertampung'}
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    className="form-control"
                    value={form[field] ?? ''}
                    onChange={e => handleChange(field, e.target.value)}
                    disabled={auto[field]}
                    placeholder={auto[field] ? 'Auto' : 'Masukkan nilai'}
                  />
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={auto[field]}
                      onChange={() => handleSwitch(field)}
                      id={`switch-${field}`}
                    />
                    <label className="form-check-label" htmlFor={`switch-${field}`}>Auto</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer text-end">
            <button type="button" className="btn btn-outline-secondary me-2" onClick={onClose} disabled={loading}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxCalculationCustom;
