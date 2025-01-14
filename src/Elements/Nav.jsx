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
      <button
        onClick={() => {
          navigate("/");
        }}
      >
        Writer
      </button>
      <div className="nav-buttons">
        {!userId ? (
          <button
            onClick={() => {
              navigate("/login");
            }}
          >
            Log In
          </button>
        ) : (
          <>
            <button onClick={logout}>Log Out</button>
            <button onClick={() => navigate("/stories")}>My Stories</button>
            <button onClick={() => navigate("/new-story")}>New Story</button>
            <button onClick={() => navigate("/profile")}>Profile</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
