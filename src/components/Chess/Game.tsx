import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { useInkathon } from "@scio-labs/use-inkathon";
import { ChessBishop } from "@styled-icons/fa-solid";
import { Chess, Square } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard as Board } from "react-chessboard";
import { useLocation, useNavigate } from "react-router-dom";
import abi from "../../abi/movechesscontract.json";
import { getGame, selectGame } from "../../redux/game/game.reducer";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { truncateSuiTx } from "../../services/address";
import { socket } from "../../services/socket";
import { DEFAULT_0X0_ADDRESS } from "../../utils/address";
import { apiHeader, default as restApi } from "../../utils/api";
import { getGasLimit } from "../../utils/gas";
import Button from "../Button/Button";
import Header from "../Header/Header";
import LoadingGame from "../Loading/LoadingGame";
import Popup from "../Popup/Popup";

const Game: React.FC<{}> = () => {
  // const { contract, address: contractAddress } = useRegisteredContract("5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK");
  const { connect, error, isConnected, activeChain, activeAccount, disconnect, activeSigner } = useInkathon();
  const dispatch = useAppDispatch();
  const gameRx = useAppSelector(selectGame);

  const [isStartGame, setIsStartGame] = useState(false);

  const [game, setGame] = useState<Chess | any>();
  const [raw, setRaw] = useState<any>(null);

  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [moveFrom, setMoveFrom] = useState<any>("");
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  // const [piece, setPiece] = useState<Piece | null>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [isGameOver, setIsGameOver] = useState(new Chess().isGameOver());
  const [isGameDraw, setIsGameDraw] = useState(new Chess().isDraw());

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isHiddenGameStatus, setIsHiddenGameStatus] = useState(false);

  const [isDeposit, setIsDeposit] = useState(false);
  const [turnPlay, setTurnPlay] = useState("w");

  const [isClaim, setIsClaim] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    restApi
      .get(`/load-game-v2`, {
        params: {
          game_id: location.pathname.split("/")[2],
        },
      })
      .then(async (res) => {
        if (res.status === 200) {
          const data = res.data.game;
          setGame(new Chess(data.fen));
          setRaw(data);
          setPlayer1(data.player_1);
          setPlayer2(data.player_2);
          setTurnPlay(data.turn_player);
          if (data.player_1.length > 0 && data.player_2.length > 0) {
            setIsStartGame(true);
          }
        }
      })
      .catch((err) => {
        // localStorage.removeItem("token");
      });
  }, []);

  useEffect(() => {
    if (activeAccount && activeSigner && raw) {
      dispatch(getGame({ index: raw.pays.gameIndex, activeAccount, activeSigner }));
    }
  }, [dispatch, activeAccount, activeSigner]);

  useEffect(() => {
    function onConnect() {
      setIsSocketConnected(true);
    }

    function onNewMove(room: any) {
      console.log("new move", room);
      if (room.fen) {
        setGame(new Chess(room.fen));
        setTurnPlay(room.turn);
      }
    }
    function onStart(data: any) {
      console.log("7s200:socket:start", data);
      if (data.start === true) {
        setIsStartGame(data.start);
      }
    }
    socket.connect();

    socket.on("connection", onConnect);

    socket.on("newmove", onNewMove);

    socket.on("start", onStart);

    socket.emit("joinGame", { game_id: location.pathname.split("/")[2] });

    return () => {
      socket.off("connection", onConnect);
      socket.off("newmove", onNewMove);
      socket.off("start", onStart);
    };
  }, []);

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
    moves.map((move: any) => {
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
    if ((activeAccount?.address === player1 && turnPlay === "w") || (activeAccount?.address === player2 && turnPlay === "b")) {
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

        socket.emit("move", {
          from: moveFrom,
          to: square,
          game_id: location.pathname.split("/")[2],
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
    // console.log("7s200:onSquareRightClick", rightClickedSquares);
  }

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
              window.location.reload();
            } else if (result.status.isFinalized) {
              console.log("finalized");
              window.location.reload();
            }
          })
          .catch((e) => {
            console.log("e", e);
          });
        if (signtx) {
          socket.emit("joinGame", { game_id: location.pathname.split("/")[2] });
          navigate(`/game/${location.pathname.split("/")[2]}`);
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

  const onClaim = async () => {
    setIsClaim(true);
    const res = await restApi
      .post(
        "/update-winner-v2",
        {
          params: { game_id: location.pathname.split("/")[2] },
        },
        { headers: apiHeader },
      )
      .then((data) => {
        setIsClaim(false);

        return data;
      });
    if (res) {
      navigate(`/game/${location.pathname.split("/")[2]}`);
      setIsClaim(false);
    }
  };

  const onShowFen = () => {
    return game.fen();
  };

  const onShowPlayerTop = () => {
    if (!gameRx.game || !gameRx.game.userA || !gameRx.game.userB) {
      return;
    }
    if (activeAccount?.address !== gameRx.game.userA && activeAccount?.address !== gameRx.game.userB) {
      return (
        <div className="px-4 py-2 bg-[#baca44] w-2/3 border border-none rounded-xl shadow-xl">
          <div className="flex justify-center items-center space-x-2">
            <ChessBishop color="white" size={26} />
            <p className="font-bold text-[14px]">{gameRx.game.userB === DEFAULT_0X0_ADDRESS ? "Waiting player..." : truncateSuiTx(gameRx.game.userB)}</p>
          </div>
        </div>
      );
    } else {
      if (activeAccount?.address === player2) {
        return (
          <div className="px-4 py-2 bg-[#baca44] w-2/3 border border-none rounded-xl shadow-xl">
            <div className="flex justify-center items-center space-x-2">
              <ChessBishop color="white" size={26} />
              <p className="font-bold text-[14px]">{truncateSuiTx(player1)}</p>
            </div>
          </div>
        );
      } else {
        return (
          <div className="px-4 py-2 bg-[#baca44] w-2/3 border border-none rounded-xl shadow-xl">
            <div className="flex justify-center items-center space-x-2">
              <ChessBishop color="white" size={26} />
              <p className="font-bold text-[14px]">{truncateSuiTx(player2)}</p>
            </div>
          </div>
        );
      }
    }
  };

  const onShowPlayerBottom = () => {
    if (!gameRx.game || !gameRx.game.userA || !gameRx.game.userB) {
      return;
    }
    if (activeAccount?.address !== gameRx.game.userA && activeAccount?.address !== gameRx.game.userB) {
      return (
        <div className="px-4 py-2 bg-[#baca44] w-2/3 border border-none rounded-xl shadow-xl">
          <div className="flex justify-center items-center space-x-2">
            <ChessBishop color="white" size={26} />
            <p className="font-bold text-[14px]">{truncateSuiTx(gameRx.game.userA)}</p>
          </div>
        </div>
      );
    } else {
      if (activeAccount?.address === player1) {
        return (
          <div className="px-4 py-2 bg-[#baca44] w-2/3 border border-none rounded-xl shadow-xl">
            <div className="flex justify-center items-center space-x-2">
              <ChessBishop color="white" size={26} />
              <p className="font-bold text-[14px]">{truncateSuiTx(player1)}</p>
            </div>
          </div>
        );
      } else {
        return (
          <div className="px-4 py-2 bg-[#baca44] w-2/3 border border-none rounded-xl shadow-xl">
            <div className="flex justify-center items-center space-x-2">
              <ChessBishop color="white" size={26} />
              <p className="font-bold text-[14px]">{truncateSuiTx(player2)}</p>
            </div>
          </div>
        );
      }
    }
  };

  const onShowDepositPopup = () => {
    if (!gameRx.game || !gameRx.game.userA || !gameRx.game.userB) {
      return;
    }
    if ((activeAccount?.address !== gameRx.game.userA && !gameRx.game.userAPayable) || (activeAccount?.address !== gameRx.game.userB && !gameRx.game.userBPayable)) {
      if (activeAccount?.address === gameRx.game.userA && gameRx.game.userAPayable) {
        return;
      }
      if (activeAccount?.address === gameRx.game.userB && gameRx.game.userBPayable) {
        return;
      }
      return (
        <div className="absolute top-1/3 left-[50px] w-[400px] bg-white border boder-none rounded-xl">
          <div className="flex flex-col space-y-4 justify-center items-center h-[150px]">
            <div className="font-bold">Deposit 10 AZ0 to play this match</div>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 !rounded-xl font-bold text-white leading-[21px]" onClick={() => Deposit()} loading={isDeposit}>
              Deposit
            </Button>
          </div>
        </div>
      );
    }
  };

  const onShowWaitingStartGame = () => {
    if (!isStartGame) {
      return (
        <div className="absolute top-1/3 left-[50px] w-[400px] bg-white border boder-none rounded-xl">
          <div className="flex flex-col space-y-4 justify-center items-center h-[150px]">
            <div className="font-bold">Waiting player join the game...</div>
          </div>
        </div>
      );
    }
    return <></>;
  };

  const isOrientation = () => {
    if (!gameRx.game || !gameRx.game.userA || !gameRx.game.userB || !player1) {
      return;
    }
    if (activeAccount?.address === player1 && player1 === gameRx.game.userA) {
      return "white";
    } else {
      return "black";
    }
  };

  const onShowGame = () => {
    console.log("7s200:raw", raw, gameRx);
    if (gameRx.game === null) {
      return <LoadingGame />;
    } else {
      return (
        <div className="relative" style={{ height: "500px", width: "500px", cursor: "pointer" }}>
          <div className="flex flex-col space-y-4">
            {onShowPlayerTop()}
            <div className="relative">
              <Board
                boardOrientation={isOrientation()}
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
              {(game.isGameOver() || game.isDraw()) && (
                <div className={`absolute top-1/3 left-[50px] w-[400px] ${isHiddenGameStatus && "hidden"}`} onClick={() => setIsHiddenGameStatus(true)}>
                  <Popup className="bg-gray-50 w-[400px]">
                    <h1 className="mb-4 text-center font-bold text-[20px]">
                      {game.isGameOver() && <div>{game.turn() === "b" ? truncateSuiTx(player1) : truncateSuiTx(player2)}</div>}
                      {game.isDraw() && <div>Draw</div>}
                      {(raw as any).isPaymentMatch &&
                        game.isGameOver() &&
                        (((raw as any).turn_player === "b" && activeAccount?.address! === raw.player_1) ||
                          ((raw as any).turn_player === "w" && activeAccount?.address! === raw.player_2)) && (
                          <Button
                            className="mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 !rounded-xl font-bold text-white leading-[21px]"
                            onClick={() => onClaim()}
                            disabled={raw.isClaimed}
                            loading={isClaim}
                          >
                            {raw.isClaimed ? "Claimed" : "Claim"}
                          </Button>
                        )}
                    </h1>
                  </Popup>
                </div>
              )}
              {onShowWaitingStartGame()}
              {onShowDepositPopup()}
            </div>
            {onShowPlayerBottom()}
          </div>
        </div>
      );
    }
  };

  if (!game || !raw) {
    return <LoadingGame />;
  } else {
    return (
      <>
        <Header />
        <div className="flex p-8 md:ml-64 mt-14 bg-gray-100 h-screen">{onShowGame()}</div>
      </>
    );
  }
};
export default Game;
