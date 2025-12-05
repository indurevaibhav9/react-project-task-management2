import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData"))
    : null,

  userRole: localStorage.getItem("userRole")
    ? JSON.parse(localStorage.getItem("userRole"))
    : null,

  token: localStorage.getItem("token")
    ? JSON.parse(localStorage.getItem("token"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData(state, action)
    {
      state.userData = action.payload;
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
    setUserRole(state, action)
    {
      state.userRole = action.payload;
      localStorage.setItem("userRole", JSON.stringify(action.payload));
    },
    setToken(state, action)
    {
      state.token = action.payload;
      localStorage.setItem("token", JSON.stringify(action.payload));
    },
    logout(state)
    {
      state.userData = null;
      state.userRole = null;
      state.token = null;
      localStorage.removeItem("userData");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
    },
  },
});

export const { setUserData, setUserRole, setToken, logout } = authSlice.actions;

export default authSlice.reducer;
