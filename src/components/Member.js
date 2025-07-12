import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MembersModal } from "../components/MembersModal";
import MembersSettingsModal from "../components/MembersSettingsModal"; 

const Member = ({ userTokenData }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch members
  const getMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiBaseUrl}/membership`, {
        params: {
          outlet_id: userTokenData.outlet_id,
        },
      });

      console.log("Members Response:", response.data);
      setMembers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError(error.message || "Failed to fetch members");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, userTokenData]);

  // Initial fetch
  useEffect(() => {
    getMembers();
  }, [getMembers]);

  // Modal open/close handlers
  const openModal = (memberId = null) => {
    setSelectedMemberId(memberId);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedMemberId(null);
    setShowModal(false);
  };
  const openSettingsModal = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };
  // Handle member save/update
  const handleSaveMember = async (memberData) => {
    try {
      // Refresh members list after save
      await getMembers();
      closeModal();
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  // WhatsApp link formatter
  const formatWhatsAppLink = (phoneNumber) => {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    let formattedNumber = cleanedNumber.startsWith('0')
      ? '+62' + cleanedNumber.slice(1)
      : cleanedNumber.startsWith('62')
        ? '+' + cleanedNumber
        : cleanedNumber;

    return `https://wa.me/${formattedNumber}`;
  };

  // Loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Membership</h3>
            </div>
          </div>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="float-lg-end">
                <button
                  className="btn btn-primary rounded-pill ms-2"
                  onClick={openSettingsModal}
                >
                  <i className="bi bi-plus"></i> Tambah Settings
                </button>
                <button
                  className="btn btn-primary rounded-pill"
                  onClick={() => openModal()}
                >
                  <i className="bi bi-plus"></i> Tambah Data
                </button>
              </div>
            </div>
            <div className="card-body">
              <table className="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Point</th> {/* New Column Header */}
                    <th>WhatsApp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.member_id}>
                      <td>{index + 1}</td>
                      <td>{member.member_name}</td>
                      <td>{member.member_email}</td>
                      <td>{member.member_phone_number}</td>
                      <td>{member.member_points}</td>
                      <td>
                        {member.member_phone_number && (
                          <a
                            href={formatWhatsAppLink(member.member_phone_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm"
                          >
                            <i className="bi bi-whatsapp"></i> Chat
                          </a>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openModal(member.member_id)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      <MembersSettingsModal
        show={showSettingsModal}
        onClose={closeSettingsModal}
        onSave={getMembers}
      />
      <MembersModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveMember}
        selectedMemberId={selectedMemberId}
        userTokenData={userTokenData}
        getMembers={getMembers}
      />
    </div>
  );
};

export default Member;