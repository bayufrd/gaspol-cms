import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Profile = ({ userTokenData }) => {
  const initProfileState = useMemo(
    () => ({
      name: "",
      pin: "",
      username: "",
      password: "",
    }),
    []
  );

  const [profile, setProfile] = useState(initProfileState);
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/user-management/${userTokenData.userId}`
        );
        setProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchData();
  }, [userTokenData]);

  const handleInputChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleSave = async (e) => {
    if (
      profile.name === "" ||
      profile.username === "" ||
      profile.password.length < 8
    ) {
      setIsFormValid(false);
      return;
    }

    if (profile.pin && profile.pin.toString().length !== "") {
      if (profile.pin.toString().length !== 5) {
        setIsFormValid(false);
        return;
      }
    }

    try {
      await axios.patch(
        `${apiBaseUrl}/profile/${userTokenData.userId}`,
        profile
      );
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Profile berhasil diupdate: ${profile.name}`,
      });
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: error.response.data.message || "Terdapat data yang tidak valid",
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <label>Nama: </label>
          <div class="form-group">
            <input
              type="text"
              placeholder="Nama"
              class={`form-control ${
                !isFormValid && profile.name === "" ? "is-invalid" : ""
              }`}
              value={profile.name}
              onChange={(e) => {
                handleInputChange("name", e.target.value);
                setIsFormValid(true);
              }}
            />
            {!isFormValid && profile.name === "" ? (
              <div className="invalid-feedback">Nama harus diisi</div>
            ) : null}
          </div>
          {userTokenData.role === "Admin" && (
            <>
              <label>Pin Outlet: </label>
              <div class="form-group">
                <input
                  type="number"
                  placeholder="Pin outlet"
                  class={`form-control ${
                    !isFormValid && profile.pin.toString().length !== 5 ? "is-invalid" : ""
                  }`}
                  value={profile.pin}
                  onChange={(e) => {
                    handleInputChange("pin", e.target.value);
                    setIsFormValid(true);
                  }}
                />
                {!isFormValid && profile.pin.toString().length !== 5 ? (
                  <div className="invalid-feedback">
                    Pin harus diisi dan harus 5 digit
                  </div>
                ) : null}
              </div>
            </>
          )}

          <label>Username: </label>
          <div class="form-group">
            <input
              type="text"
              placeholder="Username"
              class={`form-control ${
                !isFormValid && profile.username === "" ? "is-invalid" : ""
              }`}
              value={profile.username}
              onChange={(e) => {
                handleInputChange("username", e.target.value);
                setIsFormValid(true);
              }}
            />
            {!isFormValid && profile.username === "" ? (
              <div className="invalid-feedback">Username harus diisi</div>
            ) : null}
          </div>

          <label>Password: </label>
          <div class="form-group">
            <input
              type="text"
              placeholder="Password"
              class={`form-control ${
                !isFormValid && profile.password.length < 8 ? "is-invalid" : ""
              }`}
              value={profile.password}
              onChange={(e) => {
                handleInputChange("password", e.target.value);
                setIsFormValid(true);
              }}
            />
            {!isFormValid && profile.password.length < 8 ? (
              <div className="invalid-feedback">
                Password harus diisi dan minimal 8 karakter
              </div>
            ) : null}
          </div>

          <div className="login-button">
            <div class="form-group">
              <button
                type="submit"
                class="btn btn-primary"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
