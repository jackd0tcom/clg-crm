import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const Auth0Sync = ({ onSyncComplete }) => {
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      syncUser();
    }
  }, [isAuthenticated, user]);

  const syncUser = async () => {
    try {
      await axios.post("/api/sync-auth0-user", {
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      });
      onSyncComplete();
    } catch (error) {
      console.error("Failed to sync user:", error);
    }
  };

  return null; // This component doesn't render anything
};

export default Auth0Sync;
