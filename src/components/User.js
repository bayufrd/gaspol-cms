import React, { useState, useEffect } from "react";
import { UserModal } from "../components/UserModal";
import axios from "axios";
import "../styles/user-module.css";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const User = () => {
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow", "padding-right");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showModal]);

  const getUsers = async () => {
    const response = await axios.get(`${apiBaseUrl}/user-management`);
    setUsers(response.data.data.users);
    setOutlets(response.data.data.outlets);
  };

  const openModal = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveUser = async (newUser) => {
    setUsers([...users, newUser]);
    closeModal();

    try {
      await getUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-6 order-md-1 order-last mb-3">
              <h3>Management Users</h3>
            </div>
          </div>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-header">
              <div className="float-lg-end">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openModal(null)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bi bi-plus"></i> Tambah Data
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* Desktop Table View */}
              <div className="table-responsive desktop-view">
                <table className="table table-striped" id="table1">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>No</th>
                      <th style={{ width: "30%" }}>Name</th>
                      <th style={{ width: "30%" }}>Username</th>
                      <th style={{ width: "35%" }}>Outlet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => user.outlet_id !== 4 && user.outlet_name !== 'Development Testing')
                      .map((user, index) => (
                      <tr 
                        key={user.id}
                        className="user-row"
                        onClick={() => openModal(user.id)}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <span className="user-name-cell">{user.name}</span>
                        </td>
                        <td>
                          <span className="user-username-cell">{user.username}</span>
                        </td>
                        <td>
                          <span className="user-outlet-badge">{user.outlet_name}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-view">
                <div className="users-card-container">
                  {users
                    .filter(user => user.outlet_id !== 4 && user.outlet_name !== 'Development Testing')
                    .map((user, index) => (
                    <div
                      key={user.id}
                      className="user-card-item"
                      onClick={() => openModal(user.id)}
                    >
                      <div className="user-card-header">
                        <div className="user-card-number">{index + 1}</div>
                        <div className="user-card-name">{user.name}</div>
                      </div>
                      <div className="user-card-body">
                        <div className="user-card-field">
                          <span className="user-card-label">Username</span>
                          <span className="user-card-value">{user.username}</span>
                        </div>
                        <div className="user-card-field">
                          <span className="user-card-label">Outlet</span>
                          <span className="user-outlet-badge-mobile">{user.outlet_name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <UserModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveUser}
        selectedUserId={selectedUserId}
        getUsers={getUsers}
        outlets={outlets}
      />
    </div>
  );
};

export default User;
