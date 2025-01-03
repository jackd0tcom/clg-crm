import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
      <nav>
        <a onClick={() => navigate("/")} className="header-link">
          Writer
        </a>
      </nav>
      <section>
        <div>
          <h1>Login</h1>
          <form onSubmit={(e) => submit(e)}>
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
          </form>
          {isError ? <p>{errorMsg}</p> : null}
          <p>Don't have an account yet?</p>
          <button onClick={register}>Create New Account</button>
        </div>
      </section>
    </>
  );
};

export default Login;
