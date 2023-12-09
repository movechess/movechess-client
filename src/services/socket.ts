import { io } from "socket.io-client";
const token = localStorage.getItem("token");
export const socket = io("https://engine.movechess.com", {
  extraHeaders: {
    Authorization: token !== null ? token : "",
  },
});
