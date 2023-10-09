import React, { useState, useEffect } from "react";
import { UserModal } from "../components/UserModal";
import axios from "axios";
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

  const handleSaveMenu = async (newUser) => {
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
        <section class="section">
          <div class="card">
            <div class="card-header">
              <div class="float-lg-end">
                <div
                  className="button btn btn-primary rounded-pill"
                  onClick={() => openModal(null)}
                >
                  <i class="bi bi-plus"></i> Tambah Data
                </div>
              </div>
            </div>
            <div class="card-body">
              <table class="table table-striped" id="table1">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Outlet</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.outlet_name}</td>
                      <td>
                        <div className="action-buttons">
                          <div
                            className="buttons btn info btn-primary"
                            onClick={() => openModal(user.id)}
                          >
                            <i className="bi bi-pencil"></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <UserModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveMenu}
        selectedUserId={selectedUserId}
        getUsers={getUsers}
        outlets={outlets}
      />
    </div>
  );
};

export default User;
