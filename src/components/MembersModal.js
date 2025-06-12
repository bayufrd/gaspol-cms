import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";

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

  // Fetch member details when modal opens with a specific member ID
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
        // Reset to initial state when no member is selected
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

    // Prepare data for submission using backend expected fields
    const submitData = {
      name: member.name,
      email: member.email,
      phone_number: member.phone_number,
      outlet_id: member.outlet_id
    };

    try {
      if (selectedMemberId) {
        // Update existing member
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
        // Create new member
        await axios.post(`${apiBaseUrl}/membership`, submitData);
        
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: `Member ${member.name} created successfully`
        });
      }

      // Refresh members list
      if (getMembers) await getMembers();
      
      // Close modal and reset
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};