import React from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";

const Home = () => {
  const userId = useSelector((state) => state.userId);
  const navigate = useNavigate();
  return !userId ? (
    <div>
      <h1>Welcome</h1>
      <button>Login</button>
    </div>
  ) : (
    <>
      <h1>Welcome</h1>
      <div>Welcome</div>
    </>
  );
};
