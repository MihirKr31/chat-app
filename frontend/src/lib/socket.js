import { io } from "socket.io-client";

const BASE_URL = "http://localhost:3000";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(BASE_URL, { withCredentials: true });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
