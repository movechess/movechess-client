import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_CHESS_ENGINE_URL!,
});

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else delete axios.defaults.headers.common["Authorization"];
};
export const apiHeader = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};
export default api;
