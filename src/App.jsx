import { useState } from "react";
import "./App.css";
import { Route, Routes, Navigate } from "react-router";
import Home from "./Pages/Home.jsx";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import Landing from "./Pages/Landing.jsx";

function App() {
  const userId = useSelector((state) => state.userId);
  const dispatch = useDispatch;

  useEffect(() => {
    axios
      .get("api/checkUser")
      .then((res) => dispatch({ type: "LOGIN", payload: res.data.userId }))
      .catch((err) => console.log(err));
  }, []);
  return (
    <>
      <Routes>
        <Route index element={<Home />} />
        <Route
          path="/login"
          element={userId ? <Navigate to="/" /> : <Landing />}
        />
      </Routes>
    </>
  );
}

export default App;
