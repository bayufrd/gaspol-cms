import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MembersModal } from "../components/MembersModal";
import MembersSettingsModal from "../components/MembersSettingsModal";

const Member = ({ userTokenData }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [whatsAppLinks, setWhatsAppLinks] = useState({}); // State to store WhatsApp links

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
      setFilteredMembers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError(error.message || "Failed to fetch members");
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, userTokenData]);

  // Filter members based on the search term
  useEffect(() => {
    const results = members.filter(member =>
      member.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

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
      await getMembers();
      closeModal();
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  // WhatsApp link formatter
  const formatWhatsAppLink = async (memberId, phoneNumber) => {
    try {
      const totalPointsResponse = await axios.get(`${apiBaseUrl}/membership-history/${memberId}`);
      if (totalPointsResponse.data.code !== 200) {
        console.error("Failed to fetch membership history");
        return null;
      }

      const latestHistory = totalPointsResponse.data.data[0]; // Assuming the first entry is the latest
      const additionalPoints = latestHistory ? latestHistory.points : 0;

      // Creating message
      const memberData = members.find(member => member.member_id === memberId);
      const message = `
        Jempolan Coffee & Eaterity
        Name: ${memberData?.member_name}
        Email: ${memberData?.member_email}
        Phone Number: ${memberData?.member_phone_number}
        Point: +${additionalPoints}
        Total Points: ${memberData?.member_points}
        Terimakasih Atas Kunjungannya
      `;

      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      const formattedNumber = cleanedNumber.startsWith('0')
        ? '+62' + cleanedNumber.slice(1)
        : cleanedNumber.startsWith('62')
          ? '+' + cleanedNumber
          : cleanedNumber;

      return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    } catch (error) {
      console.error("Error formatting WhatsApp link:", error);
      return null;
    }
  };

  // Handle WhatsApp link generation and state update
  const handleWhatsAppClick = async (memberId, phoneNumber) => {
    const link = await formatWhatsAppLink(memberId, phoneNumber);
    if (link) {
      setWhatsAppLinks(prevLinks => ({ ...prevLinks, [memberId]: link }));
      window.open(link, "_blank");
    }
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
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2">
                <div className="flex-grow-1 mb-2 mb-md-0">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, phone or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="d-flex flex-column flex-md-row gap-2">
                  <button
                    className="btn btn-primary rounded-pill w-100 w-md-auto"
                    onClick={openSettingsModal}
                  >
                    <i className="bi bi-plus"></i> Edit Bonus Percent
                  </button>
                  <button
                    className="btn btn-primary rounded-pill w-100 w-md-auto"
                    onClick={() => openModal(null)}
                  >
                    <i className="bi bi-plus"></i> Tambah Data
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <table className="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Whatsapp & Phone Number</th>
                    <th>Point</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => (
                    <tr key={member.member_id}>
                      <td>{index + 1}</td>
                      <td>{member.member_name}</td>
                      <td>{member.member_email}</td>
                      <td>
                        {member.member_phone_number && (
                          <button
                            onClick={() => handleWhatsAppClick(member.member_id, member.member_phone_number)}
                            className="btn btn-success btn-sm"
                          >
                            <i className="bi bi-whatsapp"></i> Chat
                          </button>
                        )}
                        {member.member_phone_number}
                      </td>
                      <td>{member.member_points}</td>
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