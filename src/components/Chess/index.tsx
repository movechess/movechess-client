import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { useInkathon } from "@scio-labs/use-inkathon";
import { ChessBishop } from "@styled-icons/fa-solid";
import { Chess, Square } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard as Board } from "react-chessboard";
import { useNavigate } from "react-router-dom";
import abi from "../../abi/movechesscontract.json";
import { truncateSuiTx } from "../../services/address";
import { socket } from "../../services/socket";
import { apiHeader, default as api, default as restApi } from "../../utils/api";
import { getGasLimit } from "../../utils/gas";
import Button from "../Button/Button";
import Popup from "../Popup/Popup";
import { usePopups } from "../Popup/PopupProvider";

const ChessBoard: React.FC<{ isItem?: boolean; fen: any; game_id: string; player_1?: string; player_2?: string; raw?: any }> = ({
  isItem,
  fen,
  game_id,
  player_1,
  player_2,
  raw,
}) => {
  const { connect, error, isConnected, activeChain, activeAccount, disconnect, activeSigner } = useInkathon();
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
  const [isGameOver, setIsGameOver] = useState(new Chess(fen).isGameOver());
  const [isGameDraw, setIsGameDraw] = useState(new Chess(fen).isDraw());

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isHiddenGameStatus, setIsHiddenGameStatus] = useState(false);

  const [isDeposit, setIsDeposit] = useState(false);

  const [isClaim, setIsClaim] = useState(false);
  const navigate = useNavigate();

  const { addPopup } = usePopups();

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

  // console.log("7s200:index", game.isGameOver(), game.isDraw());
  async function Deposit() {
    const provider = new WsProvider("wss://ws.test.azero.dev");
    const api = new ApiPromise({
      provider,
      rpc: jsonrpc,
      types: {
        ContractsPsp34Id: {
          _enum: {
            U8: "u8",
            U16: "u16",
            U32: "u32",
            U64: "u64",
            U128: "u128",
            Bytes: "Vec<u8>",
          },
        },
      },
    });
    api.on("connected", async () => {
      api.isReady.then((api) => {
        console.log("Smartnet AZERO Connected");
      });
    });
    api.on("ready", async () => {
      if (activeAccount) {
        setIsDeposit(true);

        const contract = new ContractPromise(api, abi, "5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK");

        //@ts-ignore

        const gasLimitResult = await getGasLimit(contract.api, activeAccount.address, "matchGame", contract, { value: 10000000000000 }, [raw.pays.gameIndex]);
        const { value: gasLimit } = gasLimitResult;
        console.log("7s200:", gasLimit, raw.pays);
        await api.setSigner(activeSigner!);
        // @ts-ignore
        const txn = await contract.tx.matchGame({ value: 10000000000000, gasLimit: gasLimit, storageDepositLimit: null }, raw.pays.gameIndex);
        const signtx = await txn
          .signAndSend(activeAccount.address, (result) => {
            if (result.status.isInBlock) {
              console.log("in a block");
            } else if (result.status.isFinalized) {
              console.log("finalized");
            }
          })
          .catch((e) => {
            console.log("e", e);
          });
        if (signtx) {
          navigate(`/game/${raw.game_id}`);
        }

        setIsDeposit(false);
        return false;
      }
    });
    api.on("error", (err) => {
      setIsDeposit(false);
      console.log("error", err);
    });
  }
  console.log("7s200:raw", raw);
  const onClaim = async () => {
    setIsClaim(true);
    const res = await restApi
      .post(
        "/update-winner-v2",
        {
          params: { game_id: raw.game_id },
        },
        { headers: apiHeader },
      )
      .then((data) => {
        setIsClaim(false);

        return data;
      });
    if (res) {
      navigate(`/game/${raw.game_id}`);
      setIsClaim(false);
    }
  };
  return (
    <div>
      {/* <>{game.isGameOver() && <div>Game over</div>}</>
      <>{game.isDraw() && <div>Game draw</div>}</>
      <>{game.moves().length === 0 && <div>posible move ===0</div>}</> */}
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
        <>
          <div className="flex flex-col space-y-4">
            {!isItem && (
              <div className="px-4 py-2 bg-[#baca44] w-1/3 border border-none rounded-xl shadow-xl">
                {activeAccount.address === player2 ? (
                  <div className="flex justify-center items-center space-x-2">
                    <ChessBishop color="white" size={26} />
                    <p className="font-bold text-[14px]">{truncateSuiTx(player1)}</p>
                  </div>
                ) : (
                  <div className="flex justify-center items-center space-x-2">
                    <ChessBishop color="black" size={26} />
                    <p className="font-bold text-[14px]">{truncateSuiTx(player2)}</p>
                  </div>
                )}
              </div>
            )}
            <div className="relative">
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
              {((game.isGameOver() && !isItem) || (game.isDraw() && !isItem)) && (
                <div className={`absolute top-1/3 left-[50px] w-[400px] ${isHiddenGameStatus && "hidden"}`} onClick={() => setIsHiddenGameStatus(true)}>
                  <Popup className="bg-gray-50 w-[400px]">
                    <h1 className="mb-4 text-center font-bold text-[20px]">
                      {game.isGameOver() && <div>{game.turn() === "b" ? truncateSuiTx(player1) : truncateSuiTx(player2)}</div>}
                      {game.isDraw() && <div>Draw</div>}
                      {(raw as any).isPaymentMatch &&
                        game.isGameOver() &&
                        (((raw as any).turn_player === "w" && activeAccount.address === raw.player_1) ||
                          ((raw as any).turn_player === "b" && activeAccount.address === raw.player_2)) && (
                          <Button
                            className="mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 !rounded-xl font-bold text-white leading-[21px]"
                            onClick={() => onClaim()}
                            disabled={raw.isClaimed}
                          >
                            {raw.isClaimed ? "Claimed" : "Claim"}
                          </Button>
                        )}
                    </h1>
                  </Popup>
                </div>
              )}
              {raw && raw.player_1 !== activeAccount?.address && raw.pays.player2 === 0 && (
                <div className="absolute top-1/3 left-[50px] w-[400px] bg-white border boder-none rounded-xl">
                  <div className="flex flex-col space-y-4 justify-center items-center h-[150px]">
                    <div className="font-bold">Deposit 10 AZ0 to play this match</div>
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 !rounded-xl font-bold text-white leading-[21px]" onClick={() => Deposit()} loading={isDeposit}>
                      Deposit
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {!isItem && (
              <div className="px-4 py-2 bg-[#baca44] w-1/3 border border-none rounded-xl shadow-xl">
                {activeAccount.address === player1 ? (
                  <div className="flex justify-center items-center space-x-2">
                    <ChessBishop color="white" size={26} />
                    <p className="font-bold text-[14px]">{truncateSuiTx(player1)}</p>
                  </div>
                ) : (
                  <div className="flex justify-center items-center space-x-2">
                    <ChessBishop color="black" size={26} />
                    <p className="font-bold text-[14px]">{truncateSuiTx(player2)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default ChessBoard;
