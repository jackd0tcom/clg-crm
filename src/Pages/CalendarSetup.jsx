import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import Loader from "../Elements/Loader";
import "../styles/CalendarSetup.css";

const CalendarSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState("");
  const { user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const res = await axios.get("/api/calendar/check-connection");
      if (res.data.isConnected) {
        setSetupComplete(true);
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
    }
  };

  const handleCalendarSetup = async () => {
    setIsSettingUp(true);
    setError("");

    try {
      // Get Auth0 access token
      const accessToken = await getAccessTokenSilently();
      
      // Request Google Calendar permission and create calendar
      const res = await axios.post("/api/calendar/setup", {
        accessToken: accessToken
      });

      if (res.data.success) {
        setSetupComplete(true);
        // Redirect to main app after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      console.error("Calendar setup error:", error);
      if (error.response?.data?.message?.includes("consent")) {
        setError("Please grant calendar permissions to continue. Try the setup again.");
      } else {
        setError("Failed to set up calendar. Please try again.");
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  if (setupComplete) {
    return (
      <div className="calendar-setup-wrapper">
        <div className="setup-complete">
          <div className="success-icon">✅</div>
          <h2>Calendar Setup Complete!</h2>
          <p>Your Google Calendar has been connected successfully.</p>
          <p>Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-setup-wrapper">
      <div className="setup-card">
        <div className="setup-header">
          <h2>🎉 Welcome to CLG CMS!</h2>
          <p>Let's set up your Google Calendar integration to get started.</p>
        </div>

        <div className="setup-content">
          <div className="setup-icon">📅</div>
          <h3>Connect Google Calendar</h3>
          <p>
            We'll create a dedicated "CLG CMS Tasks" calendar in your Google Calendar 
            to keep your work tasks organized and separate from your personal events.
          </p>

          <div className="setup-benefits">
            <h4>What you'll get:</h4>
            <ul>
              <li>✅ Automatic task sync to Google Calendar</li>
              <li>✅ Dedicated work calendar</li>
              <li>✅ Real-time updates when tasks change</li>
              <li>✅ Calendar view of all your tasks</li>
            </ul>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button 
            onClick={handleCalendarSetup}
            disabled={isSettingUp}
            className="setup-button"
          >
            {isSettingUp ? "Setting up..." : "Connect Google Calendar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSetup;
