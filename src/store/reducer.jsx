const initialState = {
  user: {
    userId: null,
    username: null,
    firstName: null,
    lastName: null,
    role: null,
    profilePic: null,
    isAllowed: false,
  },
  isAuthenticated: false,
};

const LOGIN = "LOGIN";
const LOGOUT = "LOGOUT";
const UPDATE_USER = "UPDATE_USER";

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
        },
        isAuthenticated: true,
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
        },
        isAuthenticated: false,
      };
    case UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export default reducer;
