import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const GoogleCalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // This contains the userId

  useEffect(() => {
    const handleCallback = async () => {
      // console.log('🔄 CalendarCallback: Processing callback...');
      // console.log('📝 Code:', code);
      // console.log('❌ Error:', error);
      // console.log('🔑 State (userId):', state);
      // console.log('🌐 Window opener exists:', !!window.opener);
      
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
          console.log('📤 Sending code to backend...');
          // Send the code to your backend
          const response = await axios.post('/api/calendar/callback', { 
            code,
            userId: state // Use the userId from the state parameter
          });
          console.log('✅ Backend response:', response.data);
          
          // Send success message to parent and close popup
          console.log('📤 Sending success message to parent window...');
          window.opener?.postMessage({ 
            type: 'GOOGLE_CALENDAR_AUTH_SUCCESS' 
          }, window.location.origin);
          console.log('🚪 Attempting to close popup...');
          window.close();
        } catch (error) {
          console.error('❌ Error processing callback:', error);
          console.error('Error details:', error.response?.data);
          window.opener?.postMessage({ 
            type: 'GOOGLE_CALENDAR_AUTH_ERROR', 
            error: error.message 
          }, window.location.origin);
          window.close();
        }
      } else {
        console.log('⚠️ No code found in URL');
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