import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const GoogleCalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleCallback = async () => {
      if (error) {
        console.error('OAuth error:', error);
        // Send error message to parent and close popup
        window.opener?.postMessage({ 
          type: 'GOOGLE_CALENDAR_AUTH_ERROR', 
          error 
        }, window.location.origin);
        window.close();
        return;
      }

      if (code) {
        try {
          // Send the code to your backend
          await axios.post('/api/calendar/callback', { code });
          
          // Send success message to parent and close popup
          window.opener?.postMessage({ 
            type: 'GOOGLE_CALENDAR_AUTH_SUCCESS' 
          }, window.location.origin);
          window.close();
        } catch (error) {
          console.error('Error processing callback:', error);
          window.opener?.postMessage({ 
            type: 'GOOGLE_CALENDAR_AUTH_ERROR', 
            error: error.message 
          }, window.location.origin);
          window.close();
        }
      }
    };

    handleCallback();
  }, [code, error]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h3>Connecting to Google Calendar...</h3>
      <p>Please wait while we complete the connection.</p>
    </div>
  );
};

export default GoogleCalendarCallback;