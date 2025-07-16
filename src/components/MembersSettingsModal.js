import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const MembersSettingsModal = ({ show, onClose, onSave }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const [pointPercentage, setPointPercentage] = useState(1);
  const [updatedBy, setUpdatedBy] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [alertMessage, setAlertMessage] = useState(""); // For validation alerts

  useEffect(() => {
    // Reset values when modal opens
    if (show) {
      setPointPercentage(1); // Default to 1, will update if there is history
      setUpdatedBy("");
      setIsFormValid(true);
      setAlertMessage(""); // Clear alert message
      fetchHistory();
    }
  }, [show]);

  // Function to fetch the history of bonus points
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/membership-bonus-getall`);
      if (response.data.code === 200) {
        const fetchedHistory = response.data.data;
        setHistory(fetchedHistory);

        // If history exists, set the latest point percentage
        if (fetchedHistory.length > 0) {
          const latestEntry = fetchedHistory[0]; // Assuming the first entry is the latest
          setPointPercentage(latestEntry.point_percentage);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Fetch Error",
          text: "Failed to fetch membership bonus history."
        });
      }
    } catch (error) {
      console.error("Error fetching membership bonus history:", error);
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: error.response?.data?.message || "Failed to fetch membership bonus history."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validate input form
  const validateForm = () => {
    const isNameValid = updatedBy.trim().length > 3 && /^[a-zA-Z\s]+$/.test(updatedBy);
    const isPercentageValid = pointPercentage > 0;
    
    if (!isNameValid) {
      setAlertMessage("Nama Pembuat harus lebih dari 3 karakter dan tidak boleh mengandung angka atau simbol.");
    } else if (!isPercentageValid) {
      setAlertMessage("Point Percentage harus lebih dari 0.");
    } else {
      setAlertMessage(""); // Clear the alert message if form is valid
    }

    return isPercentageValid && isNameValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setIsFormValid(false);
      return;
    }

    const submitData = {
      point_percentage: pointPercentage,
      updated_by: updatedBy,
    };

    try {
      await axios.post(`${apiBaseUrl}/membership-bonus`, submitData);
      Swal.fire({
        icon: "success",
        title: "Created!",
        text: "Membership settings created successfully"
      });

      if (onSave) await onSave();
      onClose();
    } catch (error) {
      console.error("Error saving membership settings:", error);
      Swal.fire({
        icon: "error",
        title: "Save Error",
        text: error.response?.data?.message || "Failed to save membership settings"
      });
    }
  };

  if (!show) return null;

  return (
    <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Add Membership Settings</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Point Percentage</label>
                <input
                  type="number"
                  className={`form-control ${!isFormValid && pointPercentage <= 0 ? 'is-invalid' : ''}`} // Add invalid class if point percentage is invalid
                  value={pointPercentage}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setPointPercentage(value);
                    // Update alert message if the value is less than or equal to 0
                    if (value <= 0) {
                      setAlertMessage("Point Percentage harus lebih dari 0.");
                    } else {
                      setAlertMessage(""); // Clear message if valid
                    }
                  }}
                  required
                />
                {alertMessage && pointPercentage <= 0 && (
                  <div className="invalid-feedback">
                    {alertMessage}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Nama Pembuat</label>
                <input
                  type="text"
                  className={`form-control ${alertMessage ? 'is-invalid' : ''}`} // Add invalid class if alert message present
                  value={updatedBy}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Always update updatedBy, but validate
                    setUpdatedBy(value);
                    
                    if (value.length < 4 || !/^[a-zA-Z\s]*$/.test(value)) {
                      setAlertMessage("Nama Pembuat harus lebih dari 3 karakter dan hanya boleh huruf.");
                    } else {
                      setAlertMessage(""); // Clear error message if valid
                    }
                  }}
                  required
                />
                {alertMessage && (
                  <div className="invalid-feedback">
                    {alertMessage}
                  </div>
                )}
              </div>
              {/* History Section */}
              <div className="history-section" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '10px' }}>
                <h6>History of Membership Bonus Points</h6>
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Updated At</th>
                        <th>Percent Point</th>
                        <th>Updated By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length > 0 ? (
                        history.map((entry) => (
                          <tr key={entry.id}>
                            <td>{entry.updated_at}</td>
                            <td>{entry.point_percentage}</td>
                            <td>{entry.updated_by}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">No history available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MembersSettingsModal;