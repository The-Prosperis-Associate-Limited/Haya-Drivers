"use client";

import Cookies from "js-cookie";
import { io, type Socket } from "socket.io-client";
import { ENV } from "./utils";

let socket: Socket | null = null;

export const getChatSocket = function (): Socket | null {
  const token = Cookies.get("session_id");

  if (!token) return null;

  if (socket?.connected) return socket;

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(ENV.API_URL.replace(/\/api\/?$/, ""), {
    transports: ["websocket"],
    auth: { token },
    reconnectionAttempts: 5,
  });

  return socket;
};
