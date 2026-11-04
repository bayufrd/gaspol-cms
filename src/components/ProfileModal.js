import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "../utils/alerts";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const ProfileModal = ({ isOpen, onClose, userTokenData }) => {
  const styles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(19, 20, 22, 0.45)',
      display: isOpen ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1055,
      padding: '16px',
      border: 'none',
      outline: 'none',
    },
    modalContent: {
      backgroundColor: 'var(--surface, #ffffff)',
      color: 'var(--text, #131416)',
      padding: '24px',
      borderRadius: '14px',
      width: '100%',
      maxWidth: '480px',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid var(--border, #e8eaec)',
      outline: 'none',
    },
    closeButton: {
      float: 'right',
      background: 'transparent',
      border: '1px solid var(--border, #e8eaec)',
      borderRadius: '8px',
      width: '34px',
      height: '34px',
      fontSize: '1.25rem',
      color: 'var(--muted, #525558)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      maxWidth: '480px',
      margin: '0 auto',
      padding: '4px 0 0',
      borderRadius: '10px',
      backgroundColor: 'transparent',
    },
    formGroup: {
      marginBottom: '16px',
      position: 'relative',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: '600',
      fontSize: '0.8125rem',
      color: 'var(--text, #131416)',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid var(--control, #cdced1)',
      borderRadius: '8px',
      fontSize: '0.875rem',
      backgroundColor: 'var(--surface, #ffffff)',
      color: 'var(--text, #131416)',
      transition: 'border-color 140ms ease',
      paddingRight: '40px',
    },
    inputInvalid: {
      borderColor: 'var(--danger, #c93b2b)',
    },
    invalidFeedback: {
      color: 'var(--danger, #c93b2b)',
      fontSize: '0.78rem',
      marginTop: '4px',
    },
    button: {
      width: '100%',
      padding: '11px 16px',
      backgroundColor: 'var(--btn-bg, #131416)',
      color: 'var(--btn-ink, #ffffff)',
      border: '1px solid var(--btn-bg, #131416)',
      borderRadius: '8px',
      marginTop: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 140ms ease',
    },
    buttonHover: {
      backgroundColor: 'var(--accent, #1b6c80)',
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: 'var(--muted, #525558)',
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
    if (isOpen) {
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
    }
  }, [isOpen, userTokenData]);

  const handleInputChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

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
      onClose();
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

  if (!isOpen) return null;

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>×</button>
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
      </div>
    </div>
  );
};

export default ProfileModal;