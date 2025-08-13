import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Profile = ({ userTokenData }) => {
  const styles = {
    card: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff',
    },
    formGroup: {
      marginBottom: '15px',
      position: 'relative', // Tambahkan ini untuk positioning ikon mata
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '600',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'border-color 0.3s ease',
      paddingRight: '40px', // Tambahkan ruang untuk ikon mata
    },
    inputInvalid: {
      borderColor: '#dc3545',
    },
    invalidFeedback: {
      color: '#dc3545',
      fontSize: '12px',
      marginTop: '5px',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      marginTop: '10px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
    passwordToggle: {
      position: 'absolute',
      right: '10px',
      top: '40px', // Sesuaikan dengan posisi input
      cursor: 'pointer',
      color: '#6c757d',
      zIndex: 10,
    }
  };

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
  const [showPassword, setShowPassword] = useState(false);

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
      profile.password.length < 5
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.card}>
      <div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nama</label>
          <input
            type="text"
            placeholder="Nama"
            style={{
              ...styles.input,
              ...((!isFormValid && profile.name === "") ? styles.inputInvalid : {})
            }}
            value={profile.name}
            onChange={(e) => {
              handleInputChange("name", e.target.value);
              setIsFormValid(true);
            }}
          />
          {!isFormValid && profile.name === "" && (
            <div style={styles.invalidFeedback}>Nama harus diisi</div>
          )}
        </div>

        {userTokenData.role === "Admin" && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Pin Outlet</label>
            <input
              type="number"
              placeholder="Pin outlet"
              style={{
                ...styles.input,
                ...((!isFormValid && profile.pin.toString().length !== 5) ? styles.inputInvalid : {})
              }}
              value={profile.pin}
              onChange={(e) => {
                handleInputChange("pin", e.target.value);
                setIsFormValid(true);
              }}
            />
            {!isFormValid && profile.pin.toString().length !== 5 && (
              <div style={styles.invalidFeedback}>Pin harus diisi dan harus 5 digit</div>
            )}
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            placeholder="Username"
            style={{
              ...styles.input,
              ...((!isFormValid && profile.username === "") ? styles.inputInvalid : {})
            }}
            value={profile.username}
            onChange={(e) => {
              handleInputChange("username", e.target.value);
              setIsFormValid(true);
            }}
          />
          {!isFormValid && profile.username === "" && (
            <div style={styles.invalidFeedback}>Username harus diisi</div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={{
                ...styles.input,
                ...((!isFormValid && profile.password.length < 5) ? styles.inputInvalid : {})
              }}
              value={profile.password}
              onChange={(e) => {
                handleInputChange("password", e.target.value);
                setIsFormValid(true);
              }}
            />
            <div 
              style={styles.passwordToggle}
              onClick={togglePasswordVisibility}
            >
              <i 
                className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}
              ></i>
            </div>
          </div>
          {!isFormValid && profile.password.length < 5 && (
            <div style={styles.invalidFeedback}>Password harus diisi dan minimal 8 karakter</div>
          )}
        </div>

        <div style={styles.formGroup}>
          <button
            style={styles.button}
            onClick={handleSave}
            onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
            onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
