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
      // Get the Google OAuth URL
      const res = await axios.post("/api/calendar/setup");
      
      if (res.data.success && res.data.authUrl) {
        // Open Google OAuth in a popup
        const popup = window.open(
          res.data.authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the popup to close
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Check if setup is complete
            setTimeout(() => {
              checkSetupStatus();
            }, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Calendar setup error:", error);
      setError("Failed to start calendar setup. Please try again.");
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
            We'll sync your tasks with your primary Google Calendar so you can see 
            all your work tasks alongside your other events.
          </p>

          <div className="setup-benefits">
            <h4>What you'll get:</h4>
            <ul>
              <li>✅ Automatic task sync to Google Calendar</li>
              <li>✅ Tasks appear in your main calendar</li>
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
