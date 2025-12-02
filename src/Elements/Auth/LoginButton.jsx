import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button className="login-button" onClick={() => loginWithRedirect()}>
      <img src="google-logo.png" alt="google logo" />
      Continue with Google
    </button>
  );
};

export default LoginButton;
