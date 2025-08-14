const initialState = {
  user: {
    userId: null,
    username: null,
    firstName: null,
    lastName: null,
    role: null,
    profilePic: null,
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
        user: action.payload,
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
