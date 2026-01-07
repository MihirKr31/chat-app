// src/store/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../lib/socket";

const initialState = {
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats", // "chats" or "contacts"
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setAllContacts(state, action) {
      state.allContacts = action.payload;
    },
    setChats(state, action) {
      state.chats = action.payload;
    },
    toggleSound(state) {
      state.isSoundEnabled = !state.isSoundEnabled;
      localStorage.setItem("isSoundEnabled", String(state.isSoundEnabled));
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    setIsUsersLoading(state, action) {
      state.isUsersLoading = action.payload;
    },
    setIsMessagesLoading(state, action) {
      state.isMessagesLoading = action.payload;
    },
    setIsSoundEnabled(state, action) {
      state.isSoundEnabled = action.payload;
      localStorage.setItem("isSoundEnabled", String(action.payload));
    },
    addOptimisticMessage(state, action) {
      state.messages = [...state.messages, action.payload];
    },
    addMessage(state, action) {
      const { tempId } = action.payload;

      // If this is a real message replacing optimistic one
      if (tempId) {
        const index = state.messages.findIndex(
          (msg) => msg._id === tempId || msg.tempId === tempId
        );

        if (index !== -1) {
          state.messages[index] = action.payload;
          return;
        }
      }

      // Prevent duplicates from socket events
      const exists = state.messages.some(
        (msg) => msg._id === action.payload._id
      );

      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    clearChatData(state) {
      state.messages = [];
      state.selectedUser = null;
    },
  },
});

export const {
  setAllContacts,
  setChats,
  setMessages,
  setActiveTab,
  setSelectedUser,
  setIsUsersLoading,
  setIsMessagesLoading,
  setIsSoundEnabled,
  addOptimisticMessage,
  addMessage,
  clearChatData,
  toggleSound,
} = chatSlice.actions;

export default chatSlice.reducer;

// Thunks

export const fetchAllContacts = () => async (dispatch) => {
  dispatch(setIsUsersLoading(true));
  try {
    const res = await axiosInstance.get("/messages/contacts");
    dispatch(setAllContacts(res.data));
  } catch (error) {
    toast.error(error.response?.data?.message || "Cannot load contacts");
  } finally {
    dispatch(setIsUsersLoading(false));
  }
};

export const fetchChats = () => async (dispatch) => {
  dispatch(setIsUsersLoading(true));
  try {
    const res = await axiosInstance.get("/messages/chats");
    dispatch(setChats(res.data));
  } catch (error) {
    toast.error(error.response?.data?.message || "Cannot load chats");
  } finally {
    dispatch(setIsUsersLoading(false));
  }
};

export const fetchMessagesByUserId = (userId) => async (dispatch) => {
  dispatch(setIsMessagesLoading(true));
  try {
    const res = await axiosInstance.get(`/messages/${userId}`);
    dispatch(setMessages(res.data));
  } catch (error) {
    toast.error(error.response?.data?.message || "Cannot load messages");
  } finally {
    dispatch(setIsMessagesLoading(false));
  }
};

export const sendMessage = (messageData) => async (dispatch, getState) => {
  const { selectedUser } = getState().chat;
  const { authUser } = getState().auth;

  if (!selectedUser || !authUser) return;

  const tempId = `temp-${Date.now()}`;

  const optimisticMessage = {
    _id: tempId,
    senderId: authUser._id,
    receiverId: selectedUser._id,
    text: messageData.text,
    image: messageData.image,
    createdAt: new Date().toISOString(),
    isOptimistic: true,
    tempId,
  };

  dispatch(addOptimisticMessage(optimisticMessage));

  try {
    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
      ...messageData,
      tempId,
    });

    dispatch(addMessage({ ...res.data, tempId }));

    const socket = getSocket();
    if (socket) socket.emit("sendMessage", res.data);
  } catch (error) {
    dispatch(removeMessageById(tempId));
    toast.error(error.response?.data?.message || "Failed to send message");
  }
};
