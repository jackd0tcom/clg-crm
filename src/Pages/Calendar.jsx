import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Elements/Loader";
import CalendarDisplay from "../Elements/CalendarDisplay";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkGoogleConnection();
      setIsLoading(false);
    }, 500); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isGoogleConnected) {
      fetchGoogleEvents();
    }
  }, [isGoogleConnected]);

  const checkGoogleConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const res = await axios.get("/api/calendar/check-connection");
      setIsGoogleConnected(res.data.isConnected);
    } catch (error) {
      console.error("Error checking Google connection:", error);
      setIsGoogleConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const fetchGoogleEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/calendar/events");
      const googleEvents = res.data.events.map((event) => {
        const parseGoogleDate = (dateObj) => {
          if (dateObj.dateTime) {
            return new Date(dateObj.dateTime);
          } else if (dateObj.date) {
            return new Date(dateObj.date + 'T00:00:00');
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
    } catch (error) {
      console.error("Error fetching Google events:", error);
    } finally {
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
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === "GOOGLE_CALENDAR_AUTH_SUCCESS") {
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

      // Fallback: check if popup closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          setTimeout(() => {
            checkGoogleConnection();
          }, 500);
        }
      }, 500);
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
    }
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="calendar-wrapper">
      {isCheckingConnection ? (
        <div className="calendar-connect-banner">
          <h3>Checking Google Calendar connection...</h3>
          <p>Please wait while we verify your connection.</p>
        </div>
      ) : !isGoogleConnected ? (
        <div className="calendar-connect-banner">
          <h3>Connect Google Calendar</h3>
          <p>
            Connect your Google Calendar to see all your tasks and events in one
            place!
          </p>
          <button onClick={handleConnectGoogle}>Connect Google Calendar</button>
        </div>
      ) : (
        <CalendarDisplay
          events={events}
          setEvents={setEvents}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Calendar;
