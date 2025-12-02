import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const ProtectedRoute = ({ children, requireAdmin = false, userStore }) => {
  const { isAuthenticated } = useAuth0();

  // Redirect to login if not authenticated
  // Note: isLoading is handled at App level, so we don't check it here
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check admin requirement
  if (requireAdmin && (!userStore?.isAdmin)) {
    return <Navigate to="/" replace />;
  }

  // Check if user is allowed (for denied access)
  if (userStore && !userStore.isAllowed) {
    return <Navigate to="/denied" replace />;
  }

  return children;
};

export default ProtectedRoute;

