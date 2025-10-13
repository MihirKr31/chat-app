import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { addMessage } from "./chatSlice"; // to dispatch incoming messages
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket.js"; // new socket manager module

const initialState = {
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  onlineUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(state, action) {
      state.authUser = action.payload;
    },
    setIsCheckingAuth(state, action) {
      state.isCheckingAuth = action.payload;
    },
    setIsSigningUp(state, action) {
      state.isSigningUp = action.payload;
    },
    setIsLoggingIn(state, action) {
      state.isLoggingIn = action.payload;
    },
    clearAuthUser(state) {
      state.authUser = null;
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
  },
});

export const {
  setAuthUser,
  setIsCheckingAuth,
  setIsSigningUp,
  setIsLoggingIn,
  clearAuthUser,
  setOnlineUsers,
} = authSlice.actions;

export default authSlice.reducer;

export const checkAuth = () => async (dispatch) => {
  dispatch(setIsCheckingAuth(true));
  try {
    const res = await axiosInstance.get("/auth/check");
    dispatch(setAuthUser(res.data.user || res.data));

    const socket = getSocket();
    if (!socket && res.data.user?._id) {
      const newSocket = connectSocket();

      // Setup socket listeners
      newSocket.on("newMessage", (msg) => {
        dispatch(addMessage(msg));
      });
      newSocket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });
    }
  } catch (error) {
    console.log("Error in authCheck:", error);
    dispatch(clearAuthUser());
    disconnectSocket();
  } finally {
    dispatch(setIsCheckingAuth(false));
  }
};

export const signup = (data) => async (dispatch) => {
  dispatch(setIsSigningUp(true));
  try {
    const res = await axiosInstance.post("/auth/signup", data);
    dispatch(setAuthUser(res.data.user || res.data));
    toast.success("Account created successfully!");

    const socket = getSocket();
    if (!socket && res.data.user?._id) {
      const newSocket = connectSocket();
      newSocket.on("newMessage", (msg) => {
        dispatch(addMessage(msg));
      });
      newSocket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Signup failed");
  } finally {
    dispatch(setIsSigningUp(false));
  }
};

export const login = (data) => async (dispatch) => {
  dispatch(setIsLoggingIn(true));
  try {
    const res = await axiosInstance.post("/auth/login", data);
    dispatch(setAuthUser(res.data.user || res.data));
    toast.success("Logged in successfully");

    const socket = getSocket();
    if (!socket && res.data.user?._id) {
      const newSocket = connectSocket();
      newSocket.on("newMessage", (msg) => {
        dispatch(addMessage(msg));
      });
      newSocket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    dispatch(setIsLoggingIn(false));
  }
};

export const sendMessage = (messageData) => async (dispatch, getState) => {
  const { selectedUser } = getState().chat;

  try {
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      { ...messageData }
    );

    const socket = getSocket();
    if (socket) {
      socket.emit("sendMessage", res.data);
    }

    dispatch(addMessage({ ...res.data, tempId: messageData.tempId }));
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send message");
  }
};

export const logout = () => async (dispatch) => {
  try {
    await axiosInstance.post("/auth/logout");
    dispatch(clearAuthUser());
    disconnectSocket();
    toast.success("Logged out successfully");
  } catch (error) {
    toast.error("Error logging out");
  }
};

export const updateProfile = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.put("/auth/update-profile", data);
    dispatch(setAuthUser(res.data));
    toast.success("Profile updated successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Update failed");
  }
};
