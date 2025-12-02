import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Elements/UI/Loader";
import "../styles/Settings.css";
import { useAuth0 } from "@auth0/auth0-react";

const Settings = () => {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [originalCalendar, setOriginalCalendar] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState("");
  const [appCalendars, setAppCalendars] = useState([]);
  const [hasDuplicates, setHasDuplicates] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { user } = useAuth0();

  useEffect(() => {
    checkGoogleConnection();
  }, []);

  useEffect(() => {
    const handleCalendarReconnect = (event) => {
      if (event.data.type === "GOOGLE_CALENDAR_AUTH_SUCCESS") {
        console.log("✅ Calendar reconnected via popup");
        // Refresh the connection status
        checkGoogleConnection();
      }
    };

    window.addEventListener("message", handleCalendarReconnect);
    return () => window.removeEventListener("message", handleCalendarReconnect);
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
      // Fetch calendars and preferred calendar in parallel
      const [calendarsRes, preferredRes] = await Promise.all([
        axios.get("/api/calendar/user-calendars"),
        axios.get("/api/calendar/preferred-calendar"),
      ]);

      setCalendars(calendarsRes.data.calendars);

      // Use preferred calendar if set, otherwise default to primary
      if (preferredRes.data.preferredCalendarId) {
        setOriginalCalendar(preferredRes.data.preferredCalendarId);
        setSelectedCalendar(preferredRes.data.preferredCalendarId);
      } else {
        const primaryCalendar = calendarsRes.data.calendars.find(
          (cal) => cal.primary
        );
        if (primaryCalendar) {
          setOriginalCalendar(primaryCalendar.id);
          setSelectedCalendar(primaryCalendar.id);
        }
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
      // Since we're using primary/preferred calendars now, we don't need to check for duplicates
      setAppCalendars([]);
      setHasDuplicates(false);
    } catch (error) {
      console.error("Error checking app calendars:", error);
      setAppCalendars([]);
      setHasDuplicates(false);
    }
  };

  const handleCalendarChange = (calendarId) => {
    setIsChanging(true);
    setSelectedCalendar(calendarId);
  };

  const saveCalendarPreference = async () => {
    setIsSaving(true);
    setIsChanging(false);

    // Show migration message if changing calendars
    const currentCalendarId = user?.preferredCalendarId;
    const isMigrating =
      currentCalendarId && currentCalendarId !== selectedCalendar;

    setMessage("✅ 🔄 Migrating your tasks to your selected calendar...");

    try {
      const response = await axios.post("/api/calendar/preferred-calendar", {
        calendarId: selectedCalendar,
      });

      setTimeout(() => {
        const selectedCalendarName =
          calendars.find((cal) => cal.id === selectedCalendar)?.name ||
          "Unknown";

        let messageText = `✅ Calendar preference saved! Tasks will now sync to "${selectedCalendarName}"`;

        // Add migration details if tasks were migrated
        if (response.data.migration) {
          if (response.data.migration.error) {
            messageText += `\n⚠️ Note: Some tasks may not have migrated properly.`;
          } else if (response.data.migration.migratedCount > 0) {
            messageText += `\n🔄 Migrated ${response.data.migration.migratedCount} existing tasks to the new calendar.`;
            if (response.data.migration.errorCount > 0) {
              messageText += `\n⚠️ ${response.data.migration.errorCount} tasks could not be migrated.`;
            }
          }
        }

        setMessage(messageText);
      }, 500);
      setOriginalCalendar(selectedCalendar);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error saving calendar preference:", error);
      setMessage("❌ Error saving calendar preference. Please try again.");
      setTimeout(() => setMessage(""), 5000);
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

      // Note: We rely entirely on the message system for popup communication
      // The popup will send a success/error message when the OAuth flow completes
      // This avoids COOP issues with popup.closed checks
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect Google Calendar? Your tasks will no longer sync to your calendar."
      )
    ) {
      return;
    }

    try {
      setIsDisconnecting(true);
      await axios.post("/api/calendar/disconnect");

      // Update state to reflect disconnected status
      setIsGoogleConnected(false);
      setCalendars([]);
      setSelectedCalendar(originalCalendar);
      setMessage("✅ Google Calendar disconnected successfully");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      setMessage("❌ Failed to disconnect calendar. Please try again.");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSyncTasks = async () => {
    try {
      setIsSyncing(true);
      setMessage("🔄 Syncing tasks to Google Calendar...");

      const response = await axios.post("/api/calendar/sync-tasks");

      if (response.data.success) {
        const { syncedCount, skippedCount, errorCount } = response.data;
        let messageText = `✅ Sync complete!\n`;
        messageText += `   • ${syncedCount} tasks synced\n`;
        messageText += `   • ${skippedCount} tasks already synced\n`;
        if (errorCount > 0) {
          messageText += `   • ${errorCount} tasks failed`;
        }
        setMessage(messageText);
      } else {
        setMessage("❌ Failed to sync tasks. Please try again.");
      }

      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error syncing tasks:", error);
      setMessage("❌ Failed to sync tasks. Please try again.");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="settings-wrapper">
      <div className="settings-header">
        <h1 className="section-heading">Settings</h1>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h3>Google Calendar</h3>
          <p>Choose which calendar your tasks will be synced to</p>
        </div>

        {!isGoogleConnected ? (
          <div className="calendar-connect-card">
            <div className="calendar-connect-icon">🔗</div>
            <h4>Connect Google Calendar</h4>
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

            <div className="calendar-selection">
              <label htmlFor="calendar-select">
                <strong>Select Google Calendar for tasks</strong>
              </label>
              <p>
                Connect your Google Calendar to sync your tasks and events
                seamlessly. You can choose which calendar to use for your tasks.
              </p>
              <div className="calendar-select-wrapper">
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
                <button
                  onClick={saveCalendarPreference}
                  disabled={isSaving || selectedCalendar === originalCalendar}
                  className="save-button"
                >
                  {isSaving ? "Saving..." : "Save Calendar Preference"}
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`message ${
                  message.includes("✅" || "🔄") ? "success" : "error"
                }`}
              >
                {message}
              </div>
            )}
            <div className="calendar-settings-container">
              <label htmlFor="sync-tasks">
                <strong>Google Calendar Settings</strong>
              </label>
              <div className="calendar-settings-item">
                <p>
                  Manually sync calendar settings to override any existing
                  tasks, and resync new tasks.
                </p>
                <button
                  className="sync-button"
                  onClick={handleSyncTasks}
                  disabled={isSyncing}
                >
                  {isSyncing ? "Syncing..." : "Sync Tasks"}
                </button>
              </div>
              <div className="calendar-settings-item">
                <p>
                  Disconnect Google Calendar if you no longer want to sync tasks
                  on Google Calendar, or if you have an issue and need to reset
                  the connection.
                </p>
                <button
                  className="disconnect-calendar"
                  onClick={handleDisconnectCalendar}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect Calendar"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="settings-info">
          <h4>How it works:</h4>
          <ul>
            <li>
              When you create a task, it will automatically appear in your
              selected calendar
            </li>
            <li>
              When you edit a task's title, due date, or notes, the calendar
              event updates automatically
            </li>
            <li>
              When you delete a task, the calendar event is removed
              automatically
            </li>
            <li>You can change your preferred calendar at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
