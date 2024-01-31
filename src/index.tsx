import { alephzeroTestnet, SubstrateDeployment, UseInkathonProvider } from "@scio-labs/use-inkathon";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import App from "./App";
import Game from "./components/Chess/Game";
import PopupProvider from "./components/Popup/PopupProvider";
import TournamentBoard from "./components/Tournament/TournamentBoard";
import { store } from "./redux/store";
import "./styles/main.scss";

const router = createBrowserRouter([
  {
    element: (
      <PopupProvider>
        <Outlet />
      </PopupProvider>
    ),
    children: [
      {
        path: "/",
        element: <App />,
      },
      { path: "/game/:id", element: <Game /> },
      { path: "/tournament", element: <TournamentBoard /> },
      // { path: "/tournament", element: <Tournament2 /> },
    ],
  },
]);

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  return [
    {
      contractId: "5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK",
      networkId: alephzeroTestnet.network,
      abi: await import(`./abi/movechesscontract.json`),
      address: "5EXVePY8xnyfGKQjrbvQUgH9bdeXb5YszFqvhhXCnWYT6kBw",
    },
  ];
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <UseInkathonProvider appName="React Example dApp" defaultChain={alephzeroTestnet} connectOnInit={false} deployments={getDeployments()}>
      <Provider store={store}>
        <PopupProvider>
          <RouterProvider router={router}></RouterProvider>
        </PopupProvider>
      </Provider>
    </UseInkathonProvider>
  </React.StrictMode>,
);
