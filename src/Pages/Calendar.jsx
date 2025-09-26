import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Elements/Loader";
import CalendarDisplay from "../Elements/CalendarDisplay";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [appCalendarInfo, setAppCalendarInfo] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  useEffect(() => {
    // Reset loading state when component mounts
    setIsLoading(true);
    setEvents([]);

    const timer = setTimeout(() => {
      checkGoogleConnection();
    }, 300); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isGoogleConnected) {
      // Small delay to allow backend token refresh if needed
      const timer = setTimeout(() => {
        fetchGoogleEvents();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isGoogleConnected]);

  const checkGoogleConnection = async () => {
    // console.log('🔍 Checking Google Calendar connection...');
    setIsCheckingConnection(true);
    try {
      const res = await axios.get("/api/calendar/check-connection");
      // console.log('📡 Connection check response:', res.data);
      if (res.data.isConnected) {
        // console.log('✅ Google Calendar is connected');
        setIsGoogleConnected(true);
        // Get app calendar info
        fetchAppCalendarInfo();
        checkForDuplicates();
        // Don't set loading to false yet - wait for events to load
      } else {
        // console.log('❌ Google Calendar is not connected');
        setIsGoogleConnected(false);
        setIsLoading(false); // Only set loading false if not connected
      }
    } catch (error) {
      // console.error("Error checking Google connection:", error);
      setIsGoogleConnected(false);
      setIsLoading(false); // Set loading false on error
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const fetchAppCalendarInfo = async () => {
    try {
      const res = await axios.get("/api/calendar/app-calendar");
      setAppCalendarInfo(res.data);
    } catch (error) {
      // console.error("Error fetching app calendar info:", error);
    }
  };

  const checkForDuplicates = async () => {
    try {
      const res = await axios.get("/api/calendar/check-app-calendars");
      if (res.data.hasDuplicates) {
        setDuplicateWarning(res.data);
      }
    } catch (error) {
      // console.error("Error checking for duplicate calendars:", error);
    }
  };

  const fetchGoogleEvents = async (retryCount = 0) => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/calendar/events");
      const googleEvents = res.data.events.map((event) => {
        const parseGoogleDate = (dateObj) => {
          if (dateObj.dateTime) {
            return new Date(dateObj.dateTime);
          } else if (dateObj.date) {
            return new Date(dateObj.date + "T00:00:00");
          }
          return new Date();
        };

        return {
          id: event.id,
          title: event.summary,
          start: parseGoogleDate(event.start),
          end: parseGoogleDate(event.end),
          resource: event,
        };
      });
      setEvents(googleEvents);
      setIsLoading(false); // Set loading false when events are successfully loaded
    } catch (error) {
      // console.error("Error fetching Google events:", error);

      // Retry logic for authentication errors
      if (error.response?.status === 401 && retryCount < 2) {
        console.log(
          `🔄 Retrying fetch events (attempt ${retryCount + 1}/2)...`
        );
        setTimeout(() => {
          fetchGoogleEvents(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Progressive delay: 1s, 2s
        return; // Don't set loading to false yet
      }

      // If it's an auth error after retries, suggest reconnection
      if (error.response?.status === 401) {
        console.error(
          "Authentication failed after retries. User may need to reconnect calendar."
        );
      }

      // Only set loading false if we're not retrying
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await axios.get("/api/calendar/auth-url");
      const { authUrl } = res.data;

      // Open Google OAuth in popup
      const popup = window.open(
        authUrl,
        "google-calendar-auth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      // Listen for messages from popup
      const messageListener = (event) => {
        console.log('📨 Received message from popup:', event.data);
        console.log('🌐 Event origin:', event.origin);
        console.log('🌐 Window origin:', window.location.origin);
        
        if (event.origin !== window.location.origin) {
          console.log('❌ Origin mismatch, ignoring message');
          return;
        }

        if (event.data.type === "GOOGLE_CALENDAR_AUTH_SUCCESS") {
          console.log('✅ Google Calendar auth success received');
          window.removeEventListener("message", messageListener);
          // Wait a moment then check connection
          setTimeout(() => {
            checkGoogleConnection();
          }, 500);
        } else if (event.data.type === "GOOGLE_CALENDAR_AUTH_ERROR") {
          console.error("Google Calendar connection failed:", event.data.error);
          window.removeEventListener("message", messageListener);
        }
      };

      window.addEventListener("message", messageListener);

      // Note: We rely entirely on the message system for popup communication
      // The popup will send a success/error message when the OAuth flow completes
      // This avoids COOP issues with popup.closed checks
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
    }
  };

  return isLoading || isCheckingConnection ? (
    <div className="calendar-loader">
      <div className="calendar-loader-body flash">
        <div className="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Syncing Calendar...</p>
      </div>
    </div>
  ) : (
    <div className="calendar-wrapper">
      {!isGoogleConnected ? (
        <>
          <div className="calendar-connect-card">
            <div className="calendar-connect-icon">🔗</div>
            <h4>Connect Google Calendar</h4>
            <p>
              Connect your Google Calendar to sync your tasks and events
              seamlessly. You can choose which calendar to use for your tasks.
            </p>
            <button onClick={handleConnectGoogle} className="connect-button">
              Connect Google Calendar
            </button>
          </div>
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
        </>
      ) : (
        <div className="calendar-view">
          {duplicateWarning && (
            <div className="duplicate-warning-banner">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <h4>Duplicate App Calendars Detected</h4>
                <p>
                  Found {duplicateWarning.appCalendars.length} calendars named
                  "CLG CMS Tasks". Visit Settings to manage this.
                </p>
              </div>
            </div>
          )}
          <CalendarDisplay
            events={events}
            setEvents={setEvents}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;
