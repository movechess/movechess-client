import React, {useEffect, useState} from "react";
import logo from "./logo.svg";
import "./App.css";
import ChessBoard from "./components/Chess";
import axios from "axios";
import api from "./utils/api";
import {Chess} from "chess.js";

function App() {
  const [board, setBoard] = useState();
  useEffect(() => {
    api
      .get(`/load-game-v2`, {
        params: {
          game_id: "52fa3a0adf825ae124f1800f2329bf98",
        },
      })
      .then((res) => {
        setBoard(res.data.game);
      });
  }, []);
  if (!board) {
    return <>Loading...</>;
  }
  return (
    <div className="App">
      <header className="App-header">
        <div style={{height: "500px", width: "500px"}}>
          <ChessBoard fen={(board as any).fen} />
        </div>
      </header>
    </div>
  );
}

export default App;
