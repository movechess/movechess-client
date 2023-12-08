import { useInkathon } from "@scio-labs/use-inkathon";
import { Chess, Square } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard as Board } from "react-chessboard";
import { socket } from "../../services/socket";
import api from "../../utils/api";

const ChessBoard: React.FC<{ isItem?: boolean; fen: any; game_id: string; player_1?: string; player_2?: string }> = ({ isItem, fen, game_id, player_1, player_2 }) => {
  const { connect, error, isConnected, activeChain, activeAccount, disconnect } = useInkathon();
  const [game, setGame] = useState(new Chess(fen));
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [moveFrom, setMoveFrom] = useState<any>("");
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  // const [piece, setPiece] = useState<Piece | null>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});

  const [isSocketConnected, setIsSocketConnected] = useState(false);

  function safeGameMutate(modify: any) {
    setGame((g: any) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  useEffect(() => {
    api
      .get(`/load-game-v2`, {
        params: {
          game_id: game_id,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log("7s200:", res.data.game);
          setGame(new Chess(res.data.game.fen));
          setPlayer1(res.data.game.player_1);
          setPlayer2(res.data.game.player_2);
        }
      })
      .catch((err) => {
        // localStorage.removeItem("token");
      });
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsSocketConnected(true);
    }

    function onDisconnect() {
      setIsSocketConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.emit("joinGame", { game_id: game_id });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  socket.on("newMove", function (room) {
    if (room.fen) {
      setGame(new Chess(room.fen));
    }
  });

  function getMoveOptions(square: Square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});

    // from square

    // to square
    if (!moveTo) {
      if (!moveFrom) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }
      // check if valid move before showing dialog
      const moves = game.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find((m: any) => m.from === moveFrom && m.to === square) as any;
      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square);
        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      // valid move
      setMoveTo(square);
      // console.log("7s200:move", moveFrom, square, game.turn());

      // if promotion move
      if ((foundMove.color === "w" && foundMove.piece === "p" && square[1] === "8") || (foundMove.color === "b" && foundMove.piece === "p" && square[1] === "1")) {
        setShowPromotionDialog(true);
        return;
      }

      // is normal move
      let gameCopy = game;

      const move = gameCopy.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });
      console.log("7s200:move", move);
      console.log("game.fend", game.fen());
      socket.emit("joinGame", { game_id: game_id });
      socket.emit(game_id, {
        moveFrom,
        square,
        turn: game.turn(),
        address: activeAccount?.address,
        fen: game.fen(),
        isPromotion: (foundMove.color === "w" && foundMove.piece === "p" && square[1] === "8") || (foundMove.color === "b" && foundMove.piece === "p" && square[1] === "1"),
      });
      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      setGame(gameCopy);

      // setTimeout(makeRandomMove, 300);
      setMoveFrom("");
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  function onPromotionPieceSelect(piece: any) {
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece) {
      let gameCopy: any = game;
      gameCopy.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? "q",
      });
      console.log("7s200:pro", { promotion: piece[1].toLowerCase() ?? "q" });
      setGame(gameCopy);
      // setTimeout(makeRandomMove, 300);
    }

    setMoveFrom("");
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return true;
  }

  function onSquareRightClick(square: any) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour ? undefined : { backgroundColor: colour },
    });
    console.log("7s200:onSquareRightClick", rightClickedSquares);
  }

  if (!fen && game.board()) {
    return <>Loading...</>;
  }
  if (!activeAccount?.address) {
    return <>ReConnect Wallet</>;
  }

  // console.table({
  //   over: game.isGameOver(),
  //   draw: game.isDraw(),
  //   posibleMove: game.moves().length,
  // });
  function onPieceClick(piece: string) {
    socket.emit("joinGame", { game_id: game_id });
    socket.emit(game_id, {
      piece,
      moveFrom,
      moveTo,
    });
  }

  console.log("7s200:index", game.fen());

  return (
    <div>
      <>{game.isGameOver() && <div>Game over</div>}</>
      <>{game.isDraw() && <div>Game draw</div>}</>
      <>{game.moves().length === 0 && <div>posible move ===0</div>}</>
      {isItem && isSocketConnected ? (
        <Board
          position={game.fen()}
          id="ClickToMove"
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
            ...rightClickedSquares,
          }}
          promotionToSquare={moveTo}
          showPromotionDialog={showPromotionDialog}
        />
      ) : (
        <Board
          boardOrientation={activeAccount.address === player1 ? "white" : "black"}
          position={game.fen()}
          id="ClickToMove"
          animationDuration={200}
          arePiecesDraggable={false}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
            ...rightClickedSquares,
          }}
          promotionToSquare={moveTo}
          showPromotionDialog={showPromotionDialog}
        />
      )}
    </div>
  );
};
export default ChessBoard;
