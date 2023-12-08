import { alephzeroTestnet, UseInkathonProvider } from "@scio-labs/use-inkathon";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Game from "./components/Chess/Game";
import PopupProvider from "./components/Popup/PopupProvider";
import "./styles/main.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { path: "/game/:id", element: <Game /> },
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <UseInkathonProvider appName="React Example dApp" defaultChain={alephzeroTestnet} connectOnInit={false}>
      <PopupProvider>
        <RouterProvider router={router} />
      </PopupProvider>
    </UseInkathonProvider>
  </React.StrictMode>,
);
