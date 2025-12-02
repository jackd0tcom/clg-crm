import axios from "axios";
import { useState } from "react";
import Login from "../Elements/Auth/Login";
import Register from "../Elements/Auth/Register";
import { useDispatch } from "react-redux";

const Landing = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const dispatch = useDispatch();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        register ? "/api/register" : "/api/login",
        register
          ? {
              username,
              password,
            }
          : {
              username,
              password,
            }
      )
      .then((res) => {
        dispatch({ type: "LOGIN", payload: res.data });
      })
      .catch((err) => {
        console.log(err);
        setIsError(true);
        setErrorMsg(err.response.data);
      });
  };

  return register ? (
    <Register
      submit={handleFormSubmit}
      register={setRegister}
      setUsername={setUsername}
      setPassword={setPassword}
      username={username}
      password={password}
      errorMsg={errorMsg}
      isError={isError}
      setErrorMsg={setErrorMsg}
    />
  ) : (
    <Login
      submit={handleFormSubmit}
      register={setRegister}
      setUsername={setUsername}
      setPassword={setPassword}
      username={username}
      password={password}
      errorMsg={errorMsg}
      isError={isError}
      setErrorMsg={setErrorMsg}
    />
  );
};

export default Landing;
