import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Auth0Context, initialContext } from "@auth0/auth0-react";

export const getE2EUser = () =>
  typeof window !== "undefined" ? window.__E2E_USER__ : null;

export const E2EAuthProvider = ({ children }) => {
  const e2eUser = getE2EUser();
  const name = `${e2eUser?.firstName ?? ""} ${e2eUser?.lastName ?? ""}`.trim();

  const value = {
    ...initialContext,
    isAuthenticated: true,
    isLoading: false,
    error: undefined,
    user: {
      sub: e2eUser?.auth0Id ?? "e2e|user",
      email: e2eUser?.email,
      name,
      given_name: e2eUser?.firstName,
      family_name: e2eUser?.lastName,
      picture: e2eUser?.profilePic,
    },
    getAccessTokenSilently: async () => "e2e-token",
    getAccessTokenWithPopup: async () => "e2e-token",
    getIdTokenClaims: async () => undefined,
    loginWithRedirect: async () => {},
    loginWithPopup: async () => {},
    logout: async () => {},
    handleRedirectCallback: async () => ({}),
  };

  return (
    <Auth0Context.Provider value={value}>{children}</Auth0Context.Provider>
  );
};

export const E2EAuthSync = ({ onSyncComplete }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = getE2EUser();
    if (!user) {
      onSyncComplete();
      return;
    }

    dispatch({
      type: "LOGIN",
      payload: {
        userId: user.userId,
        userName: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePic: user.profilePic,
        isAllowed: user.isAllowed,
        rateId: user.rateId,
      },
    });
    onSyncComplete();
  }, [dispatch, onSyncComplete]);

  return null;
};
