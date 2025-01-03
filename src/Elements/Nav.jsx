import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";

const Nav = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.userId);
  const navigate = useNavigate();

  const logout = () => {
    axios
      .delete("/api/logout")
      .then((res) => {
        dispatch({ type: "LOGOUT" });
        navigate("/");
      })
      .catch((err) => console.log(err));
  };

  return (
    <nav className="nav-bar">
      <h1>Writer</h1>
      <div className="nav-buttons">
        <button onClick={logout}>Log Out</button>
        <button>Profile</button>
      </div>
    </nav>
  );
};

export default Nav;
