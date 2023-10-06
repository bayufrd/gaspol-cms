import React from "react";

export const DeleteConfirmationModal = ({
  showDeleteConfirmation,
  onConfirmDelete,
  onCancelDelete,
  purposeDialog,
}) => {
  return (
    <>
      {showDeleteConfirmation && (
        <div
          className="modal fade text-left show"
          id="deleteConfirmationModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="deleteConfirmationModalLabel"
          aria-modal="true"
          aria-hidden="false"
          style={{ 
            display: "block",
            zIndex: 1051,
        }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title" id="deleteConfirmationModalLabel">
                  Delete {purposeDialog}
                </h4>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={onCancelDelete}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="modal-body">
                Apakah anda yakin menghapus {purposeDialog} ini?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light-secondary"
                  data-dismiss="modal"
                  onClick={onCancelDelete}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onConfirmDelete}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirmation && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      )}
    </>
  );
};