import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const pad = (n) => String(n).padStart(2, '0');

const formatDateForPayload = (localDatetimeValue) => {
    if (!localDatetimeValue) return null;
    const d = new Date(localDatetimeValue);
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const TaxDonationDestinationModal = ({ show, onClose, userTokenData, onSuccess, editData }) => {
    const [date, setDate] = useState('');
    const [activity, setActivity] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const isEdit = !!editData;

    useEffect(() => {
        if (show) {
            if (isEdit && editData) {
                // autofill for edit
                const d = new Date(editData.date);
                const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                setDate(local);
                setActivity(editData.activity || '');
                setAmount(editData.amount || '');
                setNotes(editData.notes || '');
            } else {
                // initialize defaults
                const now = new Date();
                const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                setDate(local);
                setActivity('');
                setAmount('');
                setNotes('');
            }
        }
    }, [show, isEdit, editData]);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const outletId = userTokenData?.outlet_id;
        if (!outletId) {
            Swal.fire('Error', 'Tidak dapat mengambil outlet id dari token. Silakan login lagi.', 'error');
            return;
        }
        const formattedDate = formatDateForPayload(date);
        const payload = {
            date: formattedDate,
            activity: activity || '',
            amount: Number(amount) || 0,
            notes: notes || '',
            outlet_id: outletId,
        };
        setLoading(true);
        try {
            if (isEdit && editData) {
                payload.id = editData.id;
                await axios.patch(`${apiBaseUrl}/tax-donation-distribution`, payload);
                Swal.fire('Berhasil', 'Penyaluran donasi berhasil diupdate!', 'success');
            } else {
                await axios.post(`${apiBaseUrl}/tax-donation-distribution?outlet_id=${outletId}`, payload);
                Swal.fire('Berhasil', 'Penyaluran donasi berhasil ditambahkan!', 'success');
            }
            setLoading(false);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setLoading(false);
            const msg = err?.response?.data?.message || err.message || 'Terjadi kesalahan saat mengirim.';
            Swal.fire('Error', msg, 'error');
        }
    };

    const handleDelete = async () => {
        if (!editData || !editData.id) return;
        setLoading(true);
        try {
            await axios.delete(`${apiBaseUrl}/tax-donation-distribution/${editData.id}`);
            setLoading(false);
            if (onSuccess) onSuccess();
            onClose();
            Swal.fire('Berhasil', 'Penyaluran donasi berhasil dihapus!', 'success');
        } catch (err) {
            setLoading(false);
            const msg = err?.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus.';
            Swal.fire('Error', msg, 'error');
        }
    };

    return (
        <div className="modal-backdrop d-flex justify-content-center align-items-center" style={{ position: 'fixed', inset: 0, zIndex: 1050 }}>
            <div className="card" style={{ width: 640, maxWidth: '95%' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>{isEdit ? 'Edit Penyaluran Donasi' : 'Tambah Penyaluran Donasi'}</strong>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClose} disabled={loading}>Tutup</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <div className="mb-2">
                            <label className="form-label">Tanggal & Waktu</label>
                            <input type="datetime-local" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Kegiatan</label>
                            <input type="text" className="form-control" value={activity} onChange={(e) => setActivity(e.target.value)} required />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Jumlah (IDR)</label>
                            <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Catatan</label>
                            <textarea className="form-control" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>
                    <div className="card-footer text-end">
                        {isEdit && (
                            <button type="button" className="btn btn-danger me-auto" onClick={handleDelete} disabled={loading}>Hapus</button>
                        )}
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={onClose} disabled={loading}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaxDonationDestinationModal;
