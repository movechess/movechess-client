import axios from "axios";

const restApi = axios.create({
  baseURL: "https://engine.movechess.com",
  // baseURL: "http://localhost:3001",
});

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else delete axios.defaults.headers.common["Authorization"];
};
export const apiHeader = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};
export default restApi;
