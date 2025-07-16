import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { ReportDetailModal } from "./ReportDetailModal"; // Import modal baru

const MembersEditPointModal = ({ show, onClose, selectedMemberId, userTokenData, refreshHistory }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [editorName, setEditorName] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  // Function to format date to 'YYYY-MM-DD HH:mm:ss'
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  // Fetch membership history when modal opens
  useEffect(() => {
    const fetchMembershipHistory = async () => {
      if (show && selectedMemberId) {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiBaseUrl}/membership-history/${selectedMemberId}`);
          const fetchedHistory = response.data.data || [];

          setHistory(fetchedHistory);

          if (fetchedHistory.length > 0) {
            const latestEntry = fetchedHistory[0];
            setPointsToAdd(latestEntry.points);
          } else {
            setPointsToAdd(0);
          }
        } catch (error) {
          console.error("Error fetching membership history:", error);
          Swal.fire({
            icon: "error",
            title: "Fetch Error",
            text: "Failed to fetch membership history"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setHistory([]);
        setPointsToAdd(0); // Reset points when modal closes
      }
    };

    fetchMembershipHistory();
  }, [show, selectedMemberId, apiBaseUrl]);

  // Handle the addition of points
  const handleAddPoints = async () => {
    const updatedAt = new Date().toISOString();
    
    const dataToSubmit = {
      points: pointsToAdd,
      updated_at: updatedAt,
      status: "edit",
      update_from: `Website (${editorName})`,
    };

    try {
      await axios.patch(`${apiBaseUrl}/membership-point/${selectedMemberId}`, dataToSubmit);
      Swal.fire({
        icon: "success",
        title: "Points Updated",
        text: `Successfully added ${pointsToAdd} points!`,
      });

      // Refresh history after adding points
      if (refreshHistory) await refreshHistory();
    } catch (error) {
      console.error("Error adding points:", error);
      Swal.fire({
        icon: "error",
        title: "Error Adding Points",
        text: error.response?.data?.message || "Failed to add points.",
      });
    }
  };

  // Function to determine style based on status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'add':
        return 'status-add';   // Green for add
      case 'subtract':
        return 'status-subtract'; // Red for subtract
      case 'edit':
        return 'status-edit'; // Blue for edit
      default:
        return '';
    }
  };

  // Handle the click of transaction_ref to show report modal
  const handleTransactionRefClick = async (transactionRef) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/transaction/reference`, {
        transaction_ref: transactionRef,
      });

      if (response.data.code === 200 && response.data.data) {
        setSelectedTransactionId(response.data.data.id); 
        setShowReportModal(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Not Found",
          text: "Transaction not found for this reference.",
        });
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch transaction details.",
      });
    }
  };

  // Validate editorName onChange
  const validateEditorName = (name) => {
    // Update editorName
    setEditorName(name);

    // Check conditions for valid name
    if (name.length < 4) {
      setAlertMessage("Name must be more than 3 characters.");
    } else if (!/^[a-zA-Z\s]*$/.test(name)) {
      setAlertMessage("Name can only contain letters and spaces.");
    } else {
      setAlertMessage(""); // Clear alert message if valid
    }
  };

  if (!show) return null;

  return (
    <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Points</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="editorName" className="form-label">Edit By (Name)</label>
              <input
                type="text"
                className={`form-control ${alertMessage ? 'is-invalid' : ''}`} // Add Bootstrap invalid class if there's an error
                value={editorName}
                onChange={(e) => validateEditorName(e.target.value)}
                required
              />
              {alertMessage && (
                <div className="invalid-feedback">
                  {alertMessage}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="pointsToAdd" className="form-label">Points</label>
              <input
                type="number"
                className="form-control"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(Number(e.target.value))}
                required
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAddPoints}
              disabled={!editorName || editorName.length < 4 || alertMessage} // Disable button if name is invalid
            >
              Save
            </button>

            <hr />

            <h6>Membership Transaction History:</h6>
            <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Points</th>
                    <th>Status</th>
                    <th>Update</th>
                    <th>Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((hist) => (
                    <tr key={hist.id} className={getStatusStyle(hist.status)}>
                      <td>{formatDate(hist.created_at)}</td>
                      <td>{hist.status === 'add' ? `+${hist.points}` : hist.status === 'subtract' ? `-${hist.points}` : hist.points}</td>
                      <td>{hist.status}</td>
                      <td>{hist.update_from || 'System'}</td>
                      <td>
                        <button
                          className="btn btn-link"
                          onClick={() => handleTransactionRefClick(hist.transaction_ref)}
                        >
                          {hist.transaction_ref || 'No Reference'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">No history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal to show report details based on transaction ID */}
      <ReportDetailModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        selectedTransactionId={selectedTransactionId}
      />
    </div>
  );
};

export default MembersEditPointModal;