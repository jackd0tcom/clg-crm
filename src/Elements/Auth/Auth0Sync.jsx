import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import axios from "axios";

const Auth0Sync = ({ onSyncComplete }) => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user) {
      syncUser();
    }
  }, [isAuthenticated, user]);

  const syncUser = async () => {
    try {
      // Debug: Log the full user object to see what Auth0 provides
      // console.log('🔍 Auth0 user object:', user);
      
      // Get Auth0 access token for Management API calls
      const auth0AccessToken = await getAccessTokenSilently();
      
      // console.log('🔄 Syncing user with Auth0...');
      // console.log('🔑 Auth0 access token available:', !!auth0AccessToken);
      
      const response = await axios.post("/api/sync-auth0-user", {
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        auth0AccessToken, // Pass Auth0 token for Management API calls
      });
      
      // Update Redux store with user data from sync response
      if (response.data.user) {
        dispatch({
          type: "LOGIN",
          payload: {
            userId: response.data.user.userId,
            userName: response.data.user.username,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            role: response.data.user.role,
            profilePic: response.data.user.profilePic,
            isAllowed: response.data.user.isAllowed,
          }
        });
      }
      
      onSyncComplete();
    } catch (error) {
      // console.error("❌ Failed to sync user:", error);
      // For any error, still complete sync so app can handle it
      onSyncComplete();
    }
  };

  return null; // This component doesn't render anything
};

export default Auth0Sync;
