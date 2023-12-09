import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { useInkathon, useRegisteredContract } from "@scio-labs/use-inkathon";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ChessBoard from ".";
import abi from "../../abi/movechesscontract.json";
import restApi from "../../utils/api";
import Header from "../Header/Header";

const Game: React.FC<{}> = () => {
  const { api, activeAccount, activeSigner } = useInkathon();
  const { contract, address: contractAddress } = useRegisteredContract("5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK");

  const [game, setGame] = useState(new Chess());
  const [raw, setRaw] = useState(null);
  const [gamePay, setGamePay] = useState(null);

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
          if (data.isPaymentMatch) {
            setRaw(data);
            // if (data.player_1.length === 0 && data.player_2.length === 0) {
            //   return;
            // }
            if (data.player_1 === activeAccount?.address) {
              return;
            }
            if (data.player_2 === activeAccount?.address && data.pays.player2 === 0) {
              //Deposit
              // await Deposit();
            }

            if (!activeAccount || !contract || !activeSigner || !api) {
              return;
            }

            try {
            } catch (e) {
              console.error(e);
            } finally {
              // fetchGreeting();
            }
            //deposit
          }

          setGame(new Chess(res.data.game.fen));
        }
      })
      .catch((err) => {
        // localStorage.removeItem("token");
      });
  }, []);

  const fetchGame = async () => {
    const provider = new WsProvider("wss://ws.test.azero.dev");
    const api = await ApiPromise.create({
      provider: provider,
    });
    const contract = new ContractPromise(api, abi, "5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK");

    const gasLimit2 = api.registry.createType("WeightV2", (api!.consts as any).system.blockWeights["maxBlock"]) as any;
    const SubWalletExtension = (window as any).injectedWeb3["subwallet-js"];
    const extension = await SubWalletExtension.enable();
    const signer = extension.signer;
    const { result, output } = await contract.query.getGameInfo(
      "5EXVePY8xnyfGKQjrbvQUgH9bdeXb5YszFqvhhXCnWYT6kBw",
      {
        gasLimit: gasLimit2,
        storageDepositLimit: null,
      },
      0,
    );
    if (result.isOk) {
      setGamePay((output?.toJSON() as any).ok);
    }
    return;
  };
  useEffect(() => {
    if (!contract || !activeAccount || !api) {
      return;
    }
    fetchGame();
  }, [contract]);

  return (
    <>
      <Header />
      <div className="flex p-8 md:ml-64 mt-14 bg-gray-100 h-screen">
        {/* <div>
          <>{game.isGameOver() && <div>Game over</div>}</>
          <>{game.isDraw() && <div>Game draw</div>}</>
          <>{game.moves().length === 0 && <div>posible move ===0</div>}</>
        </div> */}

        <div className="relative" style={{ height: "500px", width: "500px", cursor: "pointer" }}>
          <ChessBoard raw={raw} fen={game.fen()} game_id={location.pathname.split("/")[2]} />
        </div>
      </div>
    </>
    //   <div key={i} style={{ height: "150px", width: "150px", cursor: "pointer" }} onClick={() => onHandleJoinGame((e as any).game_id)}>
    //     <ChessBoard isItem fen={(e as any).fen} game_id={(e as any).game_id} />
    //   </div>
  );
};
export default Game;
