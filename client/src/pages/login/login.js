import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./login.css";
import Title from "../../general/title/title";
import { makeLoginPostRequest } from "../../lib";
import CircularSpinner from "../../general/circular-spinner/circular-spinner";
import * as errorMessages from "../../general/utils/error_messages";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function handleClientError() {
    errorMessages.displayClientErrorMessage();
  }

  function handleInvalidEmail() {
    errorMessages.displayInvalidEmailMessage();
  }

  function handleInvalidPassword() {
    errorMessages.displayPasswordNotMatchMessage();
  }

  function handleUserNotExists() {
    errorMessages.displayUserNotExistsMessage();
  }

  function handleServerError() {
    errorMessages.displayServerErrorMessage();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    e.target.loginButton.disabled = true;
    let email = e.target.email.value;
    let password = e.target.password.value;
    setLoggingIn(true);
    let data = await makeLoginPostRequest({
      email: email,
      password: password,
    });
    console.log(data);
    if (data.error) {
      handleClientError();
    } else if (data.data.isLoggedIn === null) {
      if (data.data.invalidEmail) {
        handleInvalidEmail();
      } else if (data.data.invalidPassword) {
        handleInvalidPassword();
      } else if (data.data.userNotExists) {
        handleUserNotExists();
      } else if (data.data.serverError) {
        handleServerError();
      } else {
        console.log(data.data);
      }
    } else {
      console.log(data.data.isLoggedIn);
      Cookies.set("isLoggedIn", data.data.isLoggedIn, { sameSite: "Strict" });
      Cookies.set("token", data.data.token, {
        expires: 30,
      });
      sessionStorage.setItem("isLoggedIn", data.data.isLoggedIn);
      let homeLink = document.createElement("a");
      homeLink.href = "/landingPage";
      homeLink.click();
    }
    setLoggingIn(false);
    e.target.loginButton.disabled = false;
  }

  useEffect(() => {
    let email = document.getElementById("email");
    email.focus();
  }, []);

  return (
    <div id="Login">
      <div className="login__container">
        <form
          className="login__form"
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <Title />
          <div className="login__input">
            <label htmlFor="email" className="login__input__label">
              Email
            </label>
            <input
              id="email"
              className="login__input__field"
              value={email}
              type="email"
              onChange={handleEmailChange}
              pattern={"^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"}
              title="Enter a valid email"
              required
            />
          </div>
          <div className="login__input">
            <label htmlFor="password" className="login__input__label">
              Password
            </label>
            <input
              id="password"
              className="login__input__field"
              value={password}
              type="password"
              onChange={handlePasswordChange}
              pattern={"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$"}
              title="Password must contain atleast 8 characters, atleast 1 digit, 1 uppercase,
                1 lower case and no special characters"
              required
            />
          </div>
          <div className="login-button-container">
            <button className="login-button" name="loginButton" type="submit">
              {loggingIn ? (
                <CircularSpinner
                  size="20px"
                  thickness="3px"
                  color="blue"
                  bgColor="#00ff00"
                />
              ) : (
                "Login"
              )}
            </button>
          </div>
          <div className="signup-link-container">
            Don't have an account?
            <a className="signup-link" href="/signup">
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
