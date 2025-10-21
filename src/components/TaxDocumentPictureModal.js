import React, { useState } from "react";
import axios from "axios";

const TaxDocumentPictureModal = ({ show, onClose, userTokenData, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const outletId = userTokenData?.outlet_id;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || !imageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("date", date);
      formData.append("description", description);
      formData.append("outlet_id", outletId);
      // Convert image to blob if needed (already file from input)
      formData.append("image", imageFile);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      await axios.post(`${apiBaseUrl}/tax-picture-documentation?outlet_id=${outletId}`, formData);
      setTitle("");
      setDate("");
      setDescription("");
      setImageFile(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal upload dokumen");
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Tambah Dokumen Penyaluran</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Judul</label>
              <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Tanggal</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Upload Foto</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Deskripsi</label>
              <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxDocumentPictureModal;
