import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { useInkathon } from "@scio-labs/use-inkathon";
import { useState } from "react";
import abi from "../../abi/movechesscontract.json";
import { getGasLimit } from "../../utils/gas";
import Button from "../Button/Button";
import Popup from "./Popup";

import { useNavigate } from "react-router-dom";
import restApi, { apiHeader } from "../../utils/api";
import { usePopups } from "./PopupProvider";

const PopupCreateGame: React.FC<{}> = () => {
  const { api, activeAccount, activeSigner } = useInkathon();

  const [isBettingMatch, setIsBettingMatch] = useState(false);
  const [isLoadingCreateGame, setIsLoadingCreateGame] = useState(false);
  const navigate = useNavigate();

  const { removeAll } = usePopups();

  const onHandleCreateMatch = async () => {
    try {
      if (isBettingMatch) {
        await Deposit().then((data) => {
          setIsLoadingCreateGame(false);
        });
      } else {
        const res = await restApi
          .post(
            "/new-game-v2",
            {
              params: { isPaymentMatch: isBettingMatch },
            },
            { headers: apiHeader },
          )
          .then((data) => {
            return data;
          });
        if (res.data.status === 200) {
          navigate(`/game/${res.data.board.game_id}`);
          setIsLoadingCreateGame(false);
          removeAll();
        }
      }
    } catch (error) {
      setIsLoadingCreateGame(false);
    }
  };

  async function Deposit() {
    await setIsLoadingCreateGame(true);

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
        const contract = new ContractPromise(api, abi, "5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK");
        const gasLimitResult = await getGasLimit(contract.api, activeAccount.address, "matchGame", contract, { value: 10000000000000 }, [4]);
        const { value: gasLimit } = gasLimitResult;

        //@ts-ignore
        const { result, output } = await contract.query.getCounter(activeAccount.address, { gasLimit: gasLimit });
        if (result.isOk && output) {
          console.log("7s200", (output.toJSON() as any).ok);

          const gasLimitResult = await getGasLimit(contract.api, activeAccount.address, "matchGame", contract, { value: 10000000000000 }, [(output.toJSON() as any).ok]);
          const { value: gasLimit } = gasLimitResult;
          await api.setSigner(activeSigner!);
          // @ts-ignore
          const txn = await contract.tx.matchGame({ value: 10000000000000, gasLimit: gasLimit, storageDepositLimit: null }, (output.toJSON() as any).ok);
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
            const res = await restApi
              .post(
                "/new-game-v2",
                {
                  params: { isPaymentMatch: isBettingMatch },
                },
                { headers: apiHeader },
              )
              .then((data) => {
                return data;
              });
            if (res.data.status === 200) {
              navigate(`/game/${res.data.board.game_id}`);
              setIsLoadingCreateGame(false);
              removeAll();
            }
            return true;
          }
        }

        return false;
      }
    });
    api.on("error", (err) => {
      console.log("error", err);
    });
  }

  return (
    <Popup className="bg-gray-50 min-w-[500px] max-w-[600px]">
      <div className="flex flex-col space-y-4">
        <h1 className="mb-4 text-center font-bold text-[20px]">Create chess match</h1>
        <div className="flex justify-between space-x-2 text-center">
          <div className="border border-2 border-green-400 bg-green-100 rounded-2xl w-1/2 p-2 cursor-pointer" onClick={() => setIsBettingMatch(false)}>
            <div className="text-[20px] font-semibold flex space-x-2 justify-center items-center">
              <input
                id="link-checkbox"
                type="checkbox"
                checked={isBettingMatch === true ? false : true}
                onClick={() => setIsBettingMatch(false)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>Fee match</div>
            </div>
            <div className="text-[14px]">User web 2.0 and web 3.0 can be play together</div>
          </div>

          <div className="border border-2 border-blue-400 bg-blue-100 rounded-2xl w-1/2 p-2 cursor-pointer" onClick={() => setIsBettingMatch(true)}>
            <div className="text-[20px] font-semibold flex space-x-2 justify-center items-center">
              <input
                id="link-checkbox"
                type="checkbox"
                checked={isBettingMatch}
                onClick={() => setIsBettingMatch(true)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>Betting match</div>
            </div>
            <div className="text-[14px]">User web 3.0 can be play together with betting 10 AZ0</div>
          </div>
        </div>
        <div className="mx-auto">
          <Button
            className="cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 !rounded-3xl font-bold text-white min-w-[200px] leading-[21px]"
            size="small"
            loading={isLoadingCreateGame}
            onClick={onHandleCreateMatch}
          >
            Create match
          </Button>
        </div>
      </div>
    </Popup>
  );
};
export default PopupCreateGame;
