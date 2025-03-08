// /utils/socket.ts
import io, { Socket } from "socket.io-client";
import { backendUrl } from "@/utils/backendUrl";

export const createSocket = (): Socket => {
  const token = localStorage.getItem("jwt_token") || "";
  return io(backendUrl, {
    transports: ["websocket"],
    query: { token },
  });
};
