import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")) : null,
  userRole: localStorage.getItem("userRole") ? JSON.parse(localStorage.getItem("userRole")) : null,
  token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setUserData(state, value) {
      state.registerData = value.payload;
    },
    setUserRole(state, value) {
      state.userRole = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
  },
});

export const { setUserData,setUserRole, setToken } = authSlice.actions;

export default authSlice.reducer;