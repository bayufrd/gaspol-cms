import React from "react";

const TaxFullscreenPictureModal = ({ show, onClose, imageSrc, title, description }) => {
  if (!show) return null;
  return (
    <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.7)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="modal-header" style={{ borderBottom: 'none' }}>
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body text-center" style={{ padding: 0 }}>
            <img src={imageSrc} alt={title} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 0 }} />
            <div className="mt-3 text-muted" style={{ fontSize: '1rem' }}>{description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxFullscreenPictureModal;
