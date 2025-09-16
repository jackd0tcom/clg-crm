import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Elements/Loader";
import "../styles/Settings.css";

const Settings = () => {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [appCalendars, setAppCalendars] = useState([]);
  const [hasDuplicates, setHasDuplicates] = useState(false);

  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const res = await axios.get("/api/calendar/check-connection");
      setIsGoogleConnected(res.data.isConnected);
      
      if (res.data.isConnected) {
        fetchUserCalendars();
        checkAppCalendars();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking Google connection:", error);
      setIsGoogleConnected(false);
      setIsLoading(false);
    }
  };

  const fetchUserCalendars = async () => {
    try {
      const res = await axios.get("/api/calendar/user-calendars");
      setCalendars(res.data.calendars);
      
      // Find the currently selected calendar or default to primary
      const primaryCalendar = res.data.calendars.find(cal => cal.primary);
      if (primaryCalendar) {
        setSelectedCalendar(primaryCalendar.id);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching calendars:", error);
      setIsLoading(false);
    }
  };

  const checkAppCalendars = async () => {
    try {
      const res = await axios.get("/api/calendar/check-app-calendars");
      setAppCalendars(res.data.appCalendars);
      setHasDuplicates(res.data.hasDuplicates);
      
      if (res.data.hasDuplicates) {
        console.warn("Duplicate app calendars detected:", res.data.recommendedAction);
      }
    } catch (error) {
      console.error("Error checking app calendars:", error);
    }
  };

  const handleCalendarChange = (calendarId) => {
    setSelectedCalendar(calendarId);
  };

  const saveCalendarPreference = async () => {
    setIsSaving(true);
    setMessage("");
    
    try {
      await axios.post("/api/calendar/preferred-calendar", {
        calendarId: selectedCalendar
      });
      
      const selectedCalendarName = calendars.find(cal => cal.id === selectedCalendar)?.name || "Unknown";
      setMessage(`✅ Calendar preference saved! Tasks will now sync to "${selectedCalendarName}"`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving calendar preference:", error);
      setMessage("❌ Error saving calendar preference. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await axios.get("/api/calendar/auth-url");
      const { authUrl } = res.data;

      // Open Google OAuth in popup
      const popup = window.open(
        authUrl,
        "Google Calendar Auth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Check connection after popup closes
          setTimeout(() => {
            checkGoogleConnection();
          }, 500);
        }
      }, 500);
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="settings-wrapper">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your Google Calendar integration preferences</p>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h3>📅 Google Calendar Integration</h3>
          <p>Choose which calendar your tasks will be synced to</p>
        </div>

        {!isGoogleConnected ? (
          <div className="calendar-connect-card">
            <div className="calendar-connect-icon">🔗</div>
            <h4>Connect Google Calendar</h4>
            <p>
              Connect your Google Calendar to sync your tasks and events seamlessly.
              You can choose which calendar to use for your tasks.
            </p>
            <button onClick={handleConnectGoogle} className="connect-button">
              Connect Google Calendar
            </button>
          </div>
        ) : (
          <div className="calendar-settings-card">
            <div className="calendar-status">
              <span className="status-indicator connected">●</span>
              <span>Google Calendar Connected</span>
            </div>

            {hasDuplicates && (
              <div className="duplicate-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h4>Duplicate App Calendars Detected</h4>
                  <p>Found {appCalendars.length} calendars named "CLG CMS Tasks". This can cause confusion and duplicate events.</p>
                  <p><strong>Recommendation:</strong> Keep only one app calendar and remove the others from Google Calendar.</p>
                  <div className="duplicate-calendars">
                    {appCalendars.map((cal, index) => (
                      <div key={cal.id} className="duplicate-calendar-item">
                        <span>📅 {cal.name}</span>
                        <small>ID: {cal.id}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="calendar-selection">
              <label htmlFor="calendar-select">
                <strong>Select Calendar for Task Sync:</strong>
              </label>
              <select
                id="calendar-select"
                value={selectedCalendar}
                onChange={(e) => handleCalendarChange(e.target.value)}
                className="calendar-select"
              >
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name} {calendar.primary && "(Primary)"}
                  </option>
                ))}
              </select>
              
              {selectedCalendar && (
                <div className="selected-calendar-info">
                  <p>
                    <strong>Selected:</strong>{" "}
                    {calendars.find(cal => cal.id === selectedCalendar)?.name}
                  </p>
                  {calendars.find(cal => cal.id === selectedCalendar)?.description && (
                    <p className="calendar-description">
                      {calendars.find(cal => cal.id === selectedCalendar)?.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="save-section">
              <button
                onClick={saveCalendarPreference}
                disabled={isSaving || !selectedCalendar}
                className="save-button"
              >
                {isSaving ? "Saving..." : "Save Calendar Preference"}
              </button>
              
              {message && (
                <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="settings-info">
        <h4>ℹ️ How it works:</h4>
        <ul>
          <li>When you create a task, it will automatically appear in your selected calendar</li>
          <li>When you edit a task's title, due date, or notes, the calendar event updates automatically</li>
          <li>When you delete a task, the calendar event is removed automatically</li>
          <li>You can change your preferred calendar at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;