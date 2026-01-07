import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { addMessage, fetchChats } from "./chatSlice"; // to dispatch incoming messages
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket.js";


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


// Thunk that sets up socket event listeners and properly uses getState
export const setupSocketListeners = () => (dispatch, getState) => {
  const socket = getSocket();
  if (!socket) return;

  // 🔥 VERY IMPORTANT: remove old listeners first
  socket.off("getOnlineUsers");
  socket.off("newMessage");

  socket.on("getOnlineUsers", (users) => {
    dispatch(setOnlineUsers(users));
  });

  socket.on("newMessage", (message) => {
    const { selectedUser } = getState().chat;
    const { authUser } = getState().auth;

    // ❌ don't ignore sender messages, because you already handle optimistic update
    if (
      selectedUser &&
      (message.senderId === selectedUser._id ||
       message.receiverId === selectedUser._id)
    ) {
      dispatch(addMessage(message));
    }
  });
};



export const checkAuth = () => async (dispatch) => {
  dispatch(setIsCheckingAuth(true));
  try {
    const res = await axiosInstance.get("/auth/check");
    dispatch(setAuthUser(res.data.user || res.data));

    if (res.data.user?._id) {
      // Connect socket FIRST
      connectSocket();
      // THEN setup listeners
      dispatch(setupSocketListeners());
    }
  } catch (error) {
    console.log("Error in authCheck:", error);
    dispatch(clearAuthUser());
    disconnectSocket();
  } finally {
    dispatch(setIsCheckingAuth(false));
  }
};


//data contains email and password
//setIsSignUp true, meaning the sign up process has begun, useful for showing the loading spinner
export const signup = (data) => async (dispatch) => {
  dispatch(setIsSigningUp(true));
  try {
    //res contains the response sent by the backend when we send a signup request, normally contains the user's info
    const res = await axiosInstance.post("/auth/signup", data);
    //setthe auth user as the res.data.user
    dispatch(setAuthUser(res.data.user || res.data));
    
    toast.success("Account created successfully!");

    if (res.data.user?._id) {
      connectSocket();
      dispatch(setupSocketListeners());
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

    if (res.data.user?._id) {
      connectSocket();
      dispatch(setupSocketListeners());
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    dispatch(setIsLoggingIn(false));
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
