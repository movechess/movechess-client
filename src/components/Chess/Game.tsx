import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ChessBoard from ".";
import api from "../../utils/api";
import Header from "../Header/Header";

const Game: React.FC<{}> = () => {
  const [game, setGame] = useState(new Chess());

  const location = useLocation();

  useEffect(() => {
    api
      .get(`/load-game-v2`, {
        params: {
          game_id: location.pathname.split("/")[2],
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setGame(new Chess(res.data.game.fen));
        }
      })
      .catch((err) => {
        // localStorage.removeItem("token");
      });
  }, []);

  return (
    <>
      <Header />
      <div className="flex p-8 md:ml-64 mt-14 bg-gray-100 h-screen">
        {/* <div>
          <>{game.isGameOver() && <div>Game over</div>}</>
          <>{game.isDraw() && <div>Game draw</div>}</>
          <>{game.moves().length === 0 && <div>posible move ===0</div>}</>
        </div> */}

        <div style={{ height: "500px", width: "500px", cursor: "pointer" }}>
          <ChessBoard fen={game.fen()} game_id={location.pathname.split("/")[2]} />
        </div>
      </div>
    </>
    //   <div key={i} style={{ height: "150px", width: "150px", cursor: "pointer" }} onClick={() => onHandleJoinGame((e as any).game_id)}>
    //     <ChessBoard isItem fen={(e as any).fen} game_id={(e as any).game_id} />
    //   </div>
  );
};
export default Game;
