import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { createAsyncThunk, createReducer } from "@reduxjs/toolkit";
import tournament_abi from "../../abi/tournamentcontract.json";
import { AZ_WSS_URL, TOURNAMENT_CONTRACT_ADDRESS } from "../../utils/data";
import { getGasLimit } from "../../utils/gas";
import { RootState } from "../store";

export const getTournaments = createAsyncThunk("tournament/get", async ({}: {}, { getState, dispatch }) => {
  try {
    const wsProvider = new WsProvider(AZ_WSS_URL);
    const api = await ApiPromise.create({ provider: wsProvider });
    let contract = new ContractPromise(api, tournament_abi, TOURNAMENT_CONTRACT_ADDRESS);

    //@ts-ignore
    const gasLimit2 = api.registry.createType("WeightV2", api.consts.system.blockWeights["maxBlock"]) as WeightV2;

    const { result, output } = await contract.query.getCounter("5D4s8PFzAtY7sdnCCuC6n7nHCio19dPmwC6ytkQrWUZjCaXN", { gasLimit: gasLimit2 });
    let out = output;
    let res = [];
    if (result.isOk && output) {
      for (let index = 0; index < Number((out?.toJSON() as any).ok); index++) {
        const { result, output } = await contract.query.getGameDetail("5D4s8PFzAtY7sdnCCuC6n7nHCio19dPmwC6ytkQrWUZjCaXN", { gasLimit: gasLimit2 }, index);
        if (result.isOk && output) {
          res.push((output.toJSON() as any).ok);
        }
      }
    }
    return res;
  } catch (error) {
    console.log("7s200:err", error);
    return null;
  }
});
export const createTournament = createAsyncThunk(
  "tournament/create",
  async ({ activeSigner, activeAccount, reward, totalPlayer }: { activeSigner: any; activeAccount: any; reward: number; totalPlayer: number }, {}) => {
    try {
      if (!activeSigner) return;

      const wsProvider = new WsProvider(AZ_WSS_URL);
      const api = await ApiPromise.create({ provider: wsProvider });
      let contract = new ContractPromise(api, tournament_abi, TOURNAMENT_CONTRACT_ADDRESS);

      // @ts-ignore
      const gasLimitResult = await getGasLimit(contract.api, activeAccount.address, "createTournament", contract, { value: 10000000000000 }, [totalPlayer]);
      const { value: gasLimit } = gasLimitResult as any;
      await api.setSigner(activeSigner!);

      const txn = await contract.tx.createTournament({ value: reward, gasLimit: gasLimit, storageDepositLimit: null }, totalPlayer);
      console.log("7s200:createTournament:tx", txn);
      const signtx = await txn
        .signAndSend(activeAccount.address, (result: any) => {
          if (result.status.isInBlock) {
            console.log("in a block");
          } else if (result.status.isFinalized) {
            console.log("finalized");
          }
        })
        .catch((e) => {
          console.log("7s200:createTournament:err", e);
        });
      console.log("7s200:createTournament", signtx);
    } catch (error) {
      console.log("7s200:createTournament:err", error);
      return;
    }
  },
);
export const updateTournamentStatus = createAsyncThunk(
  "tournament/update",
  async (
    { activeSigner, activeAccount, tournamentIndex, isStart, isEnd }: { activeSigner: any; activeAccount: any; tournamentIndex: number; isStart: boolean; isEnd: boolean },
    {},
  ) => {
    try {
      if (!activeSigner) return;

      const wsProvider = new WsProvider(AZ_WSS_URL);
      const api = await ApiPromise.create({ provider: wsProvider });
      let contract = new ContractPromise(api, tournament_abi, TOURNAMENT_CONTRACT_ADDRESS);

      // @ts-ignore
      const gasLimitResult = await getGasLimit(contract.api, activeAccount.address, "updateGameStatus", contract, [tournamentIndex, isStart, isEnd]);
      const { value: gasLimit } = gasLimitResult as any;
      await api.setSigner(activeSigner!);

      const txn = await contract.tx.updateGameStatus({ gasLimit: gasLimit, storageDepositLimit: null }, tournamentIndex, isStart, isEnd);
      const signtx = await txn
        .signAndSend(activeAccount.address, (result: any) => {
          if (result.status.isInBlock) {
            console.log("in a block");
          } else if (result.status.isFinalized) {
            console.log("finalized");
          }
        })
        .catch((e) => {
          console.log("7s200:updateTournamentStatus:err", e);
        });
      console.log("7s200:updateTournamentStatus", signtx);
    } catch (error) {
      console.log("7s200:updateTournamentStatus:err", error);
      return;
    }
  },
);
export const registerTournament = createAsyncThunk(
  "tournament/register",
  async ({ activeSigner, activeAccount, tournamentIndex, cb }: { activeSigner: any; activeAccount: any; tournamentIndex: number; cb: (status: boolean) => void }, {}) => {
    try {
      if (!activeSigner) return;
      console.log("7s200:vien", tournamentIndex);

      const wsProvider = new WsProvider(AZ_WSS_URL);
      const api = await ApiPromise.create({ provider: wsProvider });
      let contract = new ContractPromise(api, tournament_abi, TOURNAMENT_CONTRACT_ADDRESS);

      // @ts-ignore
      const gasLimitResult = await getGasLimit(contract.api, activeAccount.address, "registerTournament", contract, { value: 0 }, [tournamentIndex]);
      const { value: gasLimit } = gasLimitResult as any;
      await api.setSigner(activeSigner!);

      const txn = await contract.tx.registerTournament({ gasLimit: gasLimit, storageDepositLimit: null }, tournamentIndex);
      const signtx = await txn
        .signAndSend(activeAccount.address, (result: any) => {
          if (result.status.isInBlock) {
            console.log("in a block");
          } else if (result.status.isFinalized) {
            console.log("finalized");
            cb(true);
          }
        })
        .catch((e) => {
          console.log("7s200:registerTournament:err", e);
          cb(false);
        });
      console.log("7s200:registerTournament", signtx);
    } catch (error) {
      console.log("7s200:registerTournament:err", error);
      cb(false);

      return;
    }
  },
);
export const claimReward = createAsyncThunk(
  "tournament/claim",
  async ({ activeSigner, activeAccount, tournamentIndex }: { activeSigner: any; activeAccount: any; tournamentIndex: number }, {}) => {
    try {
      if (!activeSigner) return;

      const wsProvider = new WsProvider(AZ_WSS_URL);
      const api = await ApiPromise.create({ provider: wsProvider });
      let contract = new ContractPromise(api, tournament_abi, TOURNAMENT_CONTRACT_ADDRESS);

      // @ts-ignore
      const gasLimitResult = await getGasLimit(contract.api, activeAccount.address, "claimReward", contract, [tournamentIndex]);
      const { value: gasLimit } = gasLimitResult as any;
      await api.setSigner(activeSigner!);

      const txn = await contract.tx.claimReward({ gasLimit: gasLimit, storageDepositLimit: null }, tournamentIndex);
      const signtx = await txn
        .signAndSend(activeAccount.address, (result: any) => {
          if (result.status.isInBlock) {
            console.log("in a block");
          } else if (result.status.isFinalized) {
            console.log("finalized");
          }
        })
        .catch((e) => {
          console.log("7s200:claimReward:err", e);
        });
      console.log("7s200:claimReward", signtx);
    } catch (error) {
      console.log("7s200:claimReward:err", error);
      return;
    }
  },
);

export type TournamentReducer = {
  loading: boolean;
  tournament: any;
};

export const defaultTournamentReducer: TournamentReducer = {
  loading: false,
  tournament: null,
};

const tournamentReducer = createReducer(defaultTournamentReducer, (builder) => {
  builder
    .addCase(getTournaments.pending, (state) => {
      state.loading = true;
    })
    .addCase(getTournaments.fulfilled, (state, action) => {
      state.tournament = action.payload;
      state.loading = false;
    });
});

export const selectTournament = (state: RootState) => state.tournament;

export default tournamentReducer;
