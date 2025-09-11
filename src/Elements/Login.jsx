import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LoginButton from "./LoginButton";

const Login = ({
  submit,
  register,
  setUsername,
  setPassword,
  username,
  password,
  errorMsg,
  isError,
  setErrorMsg,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    setErrorMsg(false);
  }, []);

  return (
    <>
      <section>
        <div className="login-wrapper">
          <h1>Login</h1>
          <LoginButton />
          {/* <form onSubmit={(e) => submit(e)}>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button>Login</button>
          </form> */}
          {isError ? <p>{errorMsg}</p> : null}
          <p>Don't have an account yet?</p>
          <button onClick={register}>Create New Account</button>
        </div>
      </section>
    </>
  );
};

export default Login;
