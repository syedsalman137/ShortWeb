import React, { useState, useEffect } from "react";
import "./profile.css";
import NavBar from "../../general/navbar/navbar";
import CircularSpinner from "../../general/circular-spinner/circular-spinner";
import { updatePassword, getSelf, deleteSelf } from "../../lib";
import Cookies from "js-cookie";
import * as errorMessages from "../../general/utils/error_messages";

function ProfilePage() {
  const [userDetails, setUserDetails] = useState({
    email: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAccountText, setDeleteAccountText] = useState("");

  useEffect(() => {
    const handleWindowLoad = async () => {
      let data = await getSelf({});
      console.log(data);
      if (data.error) {
        handleClientError();
      } else if (!data.data.userData) {
        if (data.data.serverError) {
          handleServerError();
        } else if (data.data.notLoggedIn) {
          handleNotLoggedIn();
        } else if (data.data.invalidUser) {
          handleInvalidUser();
        } else {
          console.debug(data.data);
        }
      } else {
        console.debug({ email: data.data.userData.email });
        setUserDetails({ email: data.data.userData.email });
      }
    };
    handleWindowLoad();
  }, []);

  function handleClientError() {
    errorMessages.displayClientErrorMessage();
  }

  function handleServerError() {
    errorMessages.displayServerErrorMessage();
  }

  function handleNotLoggedIn() {
    alert("You are not logged in. Clear cookies and login again.");
  }

  function handleInvalidUser() {
    errorMessages.displayInvalidUserMessage();
  }

  function handlePasswordNotMatch() {
    errorMessages.displayPasswordNotMatchMessage();
  }

  function handleInvalidNewPassword() {
    errorMessages.displayInvalidNewPasswordMessage();
  }

  async function handleChangePassword(e) {
    // Prevent the default form submission behavior
    e.preventDefault();
    e.target.proceedButton.disabled = true;
    setEditingPassword(true);

    console.log(oldPassword, newPassword);
    let data = await updatePassword({
      oldPassword: oldPassword,
      newPassword: newPassword,
    });
    console.log(data);
    if (data.error) {
      handleClientError();
    } else if (!data.data.success) {
      if (data.data.serverError) {
        handleServerError();
      } else if (data.data.notLoggedIn) {
        handleNotLoggedIn();
      } else if (data.data.invalidUser) {
        handleInvalidUser();
      } else if (data.data.passwordNotMatch) {
        handlePasswordNotMatch();
      } else if (data.data.invalidNewPassword) {
        handleInvalidNewPassword();
      } else {
        console.debug(data.data);
      }
    } else {
      setNewPassword("");
      setOldPassword("");
      setShowEditPassword(false);
      alert("Your password is successfully changed.");
    }
    setEditingPassword(false);
    e.target.proceedButton.disabled = false;
  }

  const handleCancelEditPassword = () => {
    setShowEditPassword(false);
    setOldPassword("");
    setNewPassword("");
  };

  const handleCancelDeleteAccount = () => {
    setShowDeleteProfile(false);
    setDeletePassword("");
    setDeleteAccountText("");
  };

  const handleDeleteProfile = async (e) => {
    // Prevent the default form submission behavior
    e.preventDefault();
    e.target.confirmDeletion.disabled = true;
    setDeletingProfile(true);
    let data = await deleteSelf({
      password: deletePassword,
    });
    if (data.error) {
      handleClientError();
    } else if (!data.data.success) {
      if (data.data.serverError) {
        handleServerError();
      } else if (data.data.notLoggedIn) {
        handleNotLoggedIn();
      } else if (data.data.invalidUser) {
        handleInvalidUser();
      } else if (data.data.passwordNotMatch) {
        handlePasswordNotMatch();
      } else {
        console.debug(data.data);
      }
    } else {
      alert(`User ${userDetails.email}  is successfully deleted`);
      sessionStorage.removeItem("isLoggedIn");
      Cookies.remove("token");
      Cookies.remove("isLoggedIn");
      sessionStorage.clear();
      localStorage.clear();
      let homeLink = document.createElement("a");
      homeLink.href = "/landingPage";
      homeLink.click();
    }
    setDeletingProfile(false);
    e.target.confirmDeletion.disabled = false;
  };

  return (
    <div id="Profile">
      <div className="profile__container">
        <NavBar />
        {userDetails.email !== "" ? (
          <div className="profile">
            <div className="user-details">
              {/* Display the email field */}
              <div className="user-details__email-container">
                <p className="user-details__email-label">Email:</p>
                <input
                  className="user-details__email-display"
                  type="email"
                  defaultValue={userDetails.email}
                  disabled
                />
              </div>
              {/* Add a button to show the edit password form */}
              <div className="user-details__password-container">
                <div className="user-details__show-password-button-container">
                  {!showEditPassword ? (
                    <button
                      className="user-details__show-password-button"
                      onClick={() => setShowEditPassword(true)}
                    >
                      Edit Password
                    </button>
                  ) : null}
                </div>
                <div className="user-details__password-form">
                  {showEditPassword ? (
                    <form onSubmit={handleChangePassword}>
                      <div className="edit-password-container">
                        <label htmlFor="old-password">Old Password:</label>
                        <input
                          type="password"
                          id="old-password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          pattern={
                            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$"
                          }
                          title="Password must contain atleast 8 characters, atleast 1 digit, 1 uppercase,
                          1 lower case and no special characters"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="edit-password-container">
                        <label htmlFor="new-password">New Password:</label>
                        <input
                          type="password"
                          id="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          pattern={
                            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$"
                          }
                          title="Password must contain atleast 8 characters, atleast 1 digit, 1 uppercase,
                          1 lower case and no special characters"
                          required
                        />
                      </div>
                      <div className="edit-password-helper-buttons">
                        <button
                          className="proceed-button"
                          name="proceedButton"
                          type="submit"
                        >
                          {editingPassword ? (
                            <CircularSpinner
                              size="20px"
                              thickness="3px"
                              color="blue"
                              bgColor="#00ff00"
                            />
                          ) : (
                            "Change Password"
                          )}
                        </button>
                        <button
                          className="cancel-button"
                          type="button"
                          onClick={() => handleCancelEditPassword()}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              className="delete-account"
              style={{
                backgroundColor: showDeleteProfile ? "#3b3838" : "transparent",
              }}
            >
              <div className="delete-account__button-container">
                {!showDeleteProfile ? (
                  <button onClick={() => setShowDeleteProfile(true)}>
                    Delete Profile
                  </button>
                ) : null}
              </div>
              <div className="delete-account__form-container">
                {showDeleteProfile ? (
                  <form onSubmit={handleDeleteProfile}>
                    <div className="delete-password__input-container">
                      <label htmlFor="delete-password">Enter Password:</label>
                      <input
                        type="password"
                        id="delete-password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        pattern={
                          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$"
                        }
                        title="Password must contain atleast 8 characters, atleast 1 digit, 1 uppercase,
                          1 lower case and no special characters"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="delete-password__input-container">
                      <label htmlFor="delete-account-text">
                        Enter "delete my account":
                      </label>
                      <input
                        id="delete-account-text"
                        value={deleteAccountText}
                        onChange={(e) => setDeleteAccountText(e.target.value)}
                        autoComplete="off"
                        pattern={"delete my account"}
                        title='"delete my account"'
                        required
                      />
                    </div>
                    <div className="delete-account__helper-buttons">
                      <div className="delete-account__helper-button-container">
                        <button name="confirmDeletion" type="submit">
                          {deletingProfile ? (
                            <CircularSpinner
                              size="20px"
                              thickness="3px"
                              color="blue"
                              bgColor="pink"
                            />
                          ) : (
                            "Confirm Deletion"
                          )}
                        </button>
                      </div>
                      <div className="delete-account__helper-button-container">
                        <button
                          className="cancel-button"
                          type="button"
                          onClick={() => handleCancelDeleteAccount()}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <CircularSpinner
            color="rgb(28, 67, 240)"
            bgColor="white"
            contSize="160px"
          />
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
