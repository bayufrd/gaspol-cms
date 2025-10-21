import React, { useState, useEffect } from "react";
import axios from "axios";

const TaxDocumentPictureEditModal = ({ show, onClose, doc, userTokenData, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const outletId = userTokenData?.outlet_id;

  useEffect(() => {
    if (doc) {
      setTitle(doc.title || "");
      setDate(doc.date ? doc.date.slice(0, 10) : "");
      setDescription(doc.description || "");
      setPreviewUrl(doc.image_url ? `${process.env.REACT_APP_API_BASE_URL}/${doc.image_url.replace(/^\/+/, "")}` : "");
      setImageFile(null);
    }
  }, [doc]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", doc.id);
      formData.append("title", title);
      formData.append("date", date);
      formData.append("description", description);
      formData.append("outlet_id", outletId);
      if (imageFile) formData.append("image", imageFile);
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      await axios.patch(`${apiBaseUrl}/tax-picture-documentation`, formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal edit dokumen");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!doc || !doc.id) return;
    setLoading(true);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      await axios.delete(`${apiBaseUrl}/tax-picture-documentation/${doc.id}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal hapus dokumen");
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Edit Dokumen Penyaluran</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3 text-center">
              {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, marginBottom: 8 }} />}
            </div>
            <div className="mb-3">
              <label className="form-label">Judul</label>
              <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Tanggal</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Upload Foto (opsional)</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Deskripsi</label>
              <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-danger me-auto" onClick={handleDelete} disabled={loading}>Hapus</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxDocumentPictureEditModal;
