import React from "react";
import logo from "./logo.svg";
import "./App.css";
import GlobalStyle from "./styles/global";
import Game from "./pages/Game";
import {ToastContainer} from "react-toastify";

function App() {
  return (
    <>
      <GlobalStyle />
      <Game />
      <ToastContainer autoClose={3000} />
    </>
  );
}

export default App;
