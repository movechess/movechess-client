import {Chess, Square} from "chess.js";
import {useState} from "react";
import {Chessboard as Board} from "react-chessboard";

const ChessBoard: React.FC<{fen: any}> = ({fen}) => {
  const [game, setGame] = useState(new Chess(fen));
  const [moveFrom, setMoveFrom] = useState<any>("");
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});

  function safeGameMutate(modify: any) {
    setGame((g: any) => {
      const update = {...g};
      modify(update);
      return update;
    });
  }

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
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
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
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // to square
    if (!moveTo) {
      // check if valid move before showing dialog
      const moves = game.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m: any) => m.from === moveFrom && m.to === square
      ) as any;
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

      // if promotion move
      if (
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1")
      ) {
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
      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }
      console.log("7s2:game", game);
      console.log("7s2:copy", gameCopy);

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
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : {backgroundColor: colour},
    });
    console.log("7s200:onSquareRightClick", rightClickedSquares);
  }

  if (!fen && game.board()) {
    return <>Loading...</>;
  }
  console.table({
    over: game.isGameOver(),
    draw: game.isDraw(),
    posibleMove: game.moves().length,
  });

  return (
    <>
      <>{game.isGameOver() && <div>Game over</div>}</>
      <>{game.isDraw() && <div>Game draw</div>}</>
      <>{game.moves().length === 0 && <div>posible move ===0</div>}</>
      <Board
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
    </>
  );
};
export default ChessBoard;
