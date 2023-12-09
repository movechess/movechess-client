import { useInkathon } from "@scio-labs/use-inkathon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChessBoard from "./components/Chess";
import Header from "./components/Header/Header";
import { socket } from "./services/socket";
import api, { apiHeader } from "./utils/api";

function App() {
  const { connect, error, isConnected, activeChain, activeAccount, disconnect } = useInkathon();
  const navigate = useNavigate();
  function hasJWT() {
    let flag = false;
    localStorage.getItem("token") ? (flag = true) : (flag = false);
    return flag;
  }

  const [board, setBoard] = useState();
  const [games, setGames] = useState([]);
  useEffect(() => {
    hasJWT() &&
      api
        .get(`/get-game-v2`, { headers: apiHeader })
        .then((res) => {
          if (res.data.status === 200) {
            setGames(res.data.games);
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            localStorage.removeItem("token");
          }
        });
  }, [isConnected]);

  useEffect(() => {
    function onConnect() {
      // setIsConnected(true);
    }

    function onDisconnect() {
      // setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  if (!board && !games) {
    return <>Loading...</>;
  }

  const onShowGames = () => {
    let temp = null;
    if (games.length > 0) {
      temp = games.map((e, i) => {
        return (
          <div key={i} style={{ height: "150px", width: "150px", cursor: "pointer" }} onClick={() => onHandleJoinGame((e as any).game_id)}>
            <ChessBoard isItem fen={(e as any).fen} game_id={(e as any).game_id} />
          </div>
        );
      });
    }
    return temp;
  };

  const onHandleJoinGame = async (game_id: string) => {
    socket.emit("joinGame", { game_id: game_id });
    navigate(`/game/${game_id}`);
  };
  const onHandleCreateGame = async () => {
    socket.emit("createGame");
  };
  return (
    <>
      <Header />
      <div className="p-4 md:ml-64 mt-14 bg-gray-100 h-screen">{hasJWT() ? <div className="w-full grid grid-cols-4">{onShowGames()}</div> : <>Login</>}</div>
    </>
  );
}

export default App;
