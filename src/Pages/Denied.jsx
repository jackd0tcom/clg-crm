import { useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Denied.css";

const Denied = () => {
  const nav = useNavigate();
  const { logout } = useAuth0();
  return (
    <div className="denied-page-wrapper">
      <div className="denied-icon">🚫</div>
      <h1>Access Denied</h1>
      <p>
        Your Google account is not authorized to access this application.
      </p>
      <p>
        This system is restricted to authorized users only. Please contact your administrator to request access.
      </p>
      
      <div className="contact-info">
        <h3>Need Access?</h3>
        <p>Contact your system administrator:</p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:admin@yourlawfirm.com">
            admin@yourlawfirm.com
          </a>
        </p>
      </div>

      <button
        onClick={() => {
          logout({ logoutParams: { returnTo: window.location.origin } });
        }}
      >
        Return to Login
      </button>
    </div>
  );
};
export default Denied;
