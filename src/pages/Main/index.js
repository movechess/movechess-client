import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import api from "../../services/api";
import Board from "../../components/Board";
import PlayerInfo from "../../components/Player";
import MovesContainer from "../../components/Container";
import {
  Container,
  Button,
  BoardContainer,
  InfoText,
  InfoContainer,
} from "./styles";
import SideBar from "../../components/SideBar";

export default function Main() {
  const [info, setInfo] = useState("Loading...");
  const [board, setBoard] = useState();
  const [moves, setMoves] = useState([]);
  const [score, setScore] = useState();
  const [gameId, setGameId] = useState();
  const [possibleMoves, setPossibleMoves] = useState();
  const [selected, setSelected] = useState();
  const [turn, setTurn] = useState();
  const [loading, setLoading] = useState(true);

  async function newGame() {
    setLoading(true);
    setInfo("Loading...");
    setBoard(null);
    setScore(null);
    setMoves([]);
    try {
      const response = await api.post("/new-game");
      const {data} = response;

      setBoard(data.board.board);
      console.log("7s200:data", data);

      setTurn(data.board.turn_player === "W" ? "B" : "W");
      setGameId(data.board.game_id);
      setScore(data.board.score);
      localStorage.setItem("game_id", data.board.game_id);
    } catch (e) {
      console.log("7s200:newgame-e", e);
      setInfo("Oops! Something went wrong :(");
    }
    setLoading(false);
  }

  useEffect(() => {
    async function loadGame(gameId) {
      setLoading(true);
      setInfo("Loading...");
      try {
        const response = await api.get("/load-game", {
          headers: {
            game_id: gameId,
          },
        });
        const {data} = response;
        setBoard(data.board.board);
        setTurn(data.board.turn_player === "W" ? "B" : "W");
        setMoves(data.moves);
        setScore(data.board.score);
      } catch (e) {
        setInfo("Oops! Something went wrong :(");
      }
      setLoading(false);
    }
    const game_id = localStorage.getItem("game_id");
    if (game_id) {
      setGameId(game_id);
      loadGame(game_id);
    } else {
      newGame();
    }
  }, []);

  async function getPossibleMoves({position}) {
    setSelected(position);
    try {
      console.log("game_id", gameId);
      const response = await api.get(`/legal-moves/${gameId}/${position}`);
      setPossibleMoves(response.data);
    } catch (e) {
      toast.error("Oops! Something went wrong");
    }
  }

  function clearHighlights() {
    setPossibleMoves([]);
  }

  async function handleMakeMove({position}) {
    if (selected) {
      try {
        const response = await api.post(`/make-move/${selected}/${position}`, {
          game_id: gameId,
        });
        const {data} = response;
        setBoard(data.board.board);
        setTurn(turn === "W" ? "B" : "W");
        setMoves([data.move, ...moves]);
        setScore(data.board.score);
        setPossibleMoves([]);
      } catch (e) {
        toast.error("Oops! Something went wrong");
      }
    }
  }

  return (
    <Container>
      <SideBar>
        <Button onClick={newGame}>New Game</Button>
      </SideBar>

      {loading && <InfoText>{info}</InfoText>}
      {!board && !loading && (
        <InfoText>Sorry, something went wrong...</InfoText>
      )}
      {board && (
        <BoardContainer>
          <InfoContainer>
            {score && <PlayerInfo player="B" score={score.B} turn={turn} />}
            <MovesContainer moves={moves} />
            {score && <PlayerInfo player="W" score={score.W} turn={turn} />}
          </InfoContainer>
          <Board
            board={board}
            getPossibleMoves={getPossibleMoves}
            makeMove={handleMakeMove}
            highlights={possibleMoves}
            clearHighlights={clearHighlights}
            turn={turn}
          />
        </BoardContainer>
      )}
    </Container>
  );
}
