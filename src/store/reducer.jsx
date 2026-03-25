const initialState = {
  user: {
    userId: null,
    username: null,
    firstName: null,
    lastName: null,
    role: null,
    profilePic: null,
    isAllowed: false,
    isAdmin: false,
  },
  isAuthenticated: false,
  isRunning: false,
  startTime: null,
};

const LOGIN = "LOGIN";
const LOGOUT = "LOGOUT";
const UPDATE_USER = "UPDATE_USER";
const TIMER_STARTED = "TIMER_STARTED";
const TIMER_STOPPED = "TIMER_STOPPED";
const TIMER_UPDATED = "TIMER_UPDATED";

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        user: {
          userId: action.payload.userId,
          username: action.payload.userName,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          role: action.payload.role,
          profilePic: action.payload.profilePic,
          isAllowed: action.payload.isAllowed,
          isAdmin: action.payload.role === "admin",
        },
        isAuthenticated: true,
        isRunning: false,
        startTime: null,
      };
    case LOGOUT:
      return {
        user: {
          userId: null,
          username: null,
          firstName: null,
          lastName: null,
          role: null,
          profilePic: null,
          isAllowed: false,
          isAdmin: false,
        },
        isAuthenticated: false,
        isRunning: false,
        startTime: null,
      };
    case UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          isAdmin: action.payload.role
            ? action.payload.role === "admin"
            : state.user.isAdmin,
        },
      };
    case TIMER_STARTED:
      return {
        ...state,
        isRunning: true,
        startTime: action.payload?.startTime ?? null,
      };
    case TIMER_STOPPED:
      return {
        ...state,
        isRunning: false,
        startTime: null,
      };
    case TIMER_UPDATED:
      return {
        ...state,
        startTime: action.payload?.startTime ?? state.startTime,
      };
    default:
      return state;
  }
};

export default reducer;

export const timerStarted = (payload) => ({ type: TIMER_STARTED, payload });
export const timerStopped = () => ({ type: TIMER_STOPPED });
export const timerUpdated = (payload) => ({ type: TIMER_UPDATED, payload });
