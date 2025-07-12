import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import EditPointsModal from "./MembersEditPointModal"; // Import the new modal

export const MembersModal = ({
  show,
  onClose,
  onSave,
  selectedMemberId,
  userTokenData,
  getMembers
}) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const initialMemberState = useMemo(
    () => ({
      member_id: null,
      name: "",
      email: "",
      phone_number: "",
      outlet_id: userTokenData.outlet_id,
    }),
    [userTokenData]
  );

  const [member, setMember] = useState(initialMemberState);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [showEditPointsModal, setShowEditPointsModal] = useState(false); // Manage edit points modal state

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (show && selectedMemberId) {
        setIsLoading(true);
        try {
          const response = await axios.get(`${apiBaseUrl}/membership`, {
            params: {
              outlet_id: userTokenData.outlet_id,
            },
          });
          const members = response.data.data || [];
          const selectedMember = members.find(
            (m) => m.member_id === selectedMemberId
          );

          if (selectedMember) {
            setMember({
              member_id: selectedMember.member_id,
              name: selectedMember.member_name || "",
              email: selectedMember.member_email || "",
              phone_number: selectedMember.member_phone_number || "",
              outlet_id: userTokenData.outlet_id,
            });
          }
        } catch (error) {
          console.error("Error fetching member details:", error);
          Swal.fire({
            icon: "error",
            title: "Fetch Error",
            text: "Failed to fetch member details"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setMember(initialMemberState);
      }
    };

    fetchMemberDetails();
  }, [show, selectedMemberId, apiBaseUrl, userTokenData, initialMemberState]);

  const handleInputChange = (field, value) => {
    setMember(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    return (
      member.name.trim() !== "" &&
      member.email.trim() !== "" &&
      member.phone_number.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsFormValid(false);
      return;
    }

    const submitData = {
      name: member.name,
      email: member.email,
      phone_number: member.phone_number,
      outlet_id: member.outlet_id
    };

    try {
      if (selectedMemberId) {
        await axios.patch(
          `${apiBaseUrl}/membership/${selectedMemberId}`, 
          submitData
        );
        
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `Member ${member.name} updated successfully`
        });
      } else {
        await axios.post(`${apiBaseUrl}/membership`, submitData);
        
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: `Member ${member.name} created successfully`
        });
      }

      if (getMembers) await getMembers();
      
      onClose();
      onSave(member);
    } catch (error) {
      console.error("Error saving member:", error);
      
      Swal.fire({
        icon: "error",
        title: "Save Error",
        text: error.response?.data?.message || "Failed to save member"
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete member ${member.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiBaseUrl}/membership/${selectedMemberId}`);
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `Member ${member.name} deleted successfully`
        });

        if (getMembers) await getMembers();
        
        onClose();
      } catch (error) {
        console.error("Error deleting member:", error);
        Swal.fire({
          icon: "error",
          title: "Delete Error",
          text: error.response?.data?.message || "Failed to delete member"
        });
      }
    }
  };

  const handleEditPoints = () => {
    setShowEditPointsModal(true); // Open edit points modal
  };

  if (!show) return null;

  return (
    <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedMemberId ? 'Edit Member' : 'Add Member'}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className={`form-control ${!isFormValid && !member.name ? 'is-invalid' : ''}`}
                  value={member.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${!isFormValid && !member.email ? 'is-invalid' : ''}`}
                  value={member.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className={`form-control ${!isFormValid && !member.phone_number ? 'is-invalid' : ''}`}
                  value={member.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              {selectedMemberId && ( // Display delete button only if editing an existing member
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Save
              </button>
              {selectedMemberId && ( // Add Edit Point button
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={handleEditPoints}
                >
                  Edit Point
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      {showEditPointsModal && ( // Conditionally render EditPointsModal
        <EditPointsModal 
          show={showEditPointsModal}
          onClose={() => setShowEditPointsModal(false)}
          selectedMemberId={selectedMemberId}
          userTokenData={userTokenData}
          refreshHistory={getMembers} // Function to refresh history after points are added
        />
      )}
    </div>
  );
};

export default MembersModal;