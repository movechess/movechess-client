import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { createAsyncThunk, createReducer } from "@reduxjs/toolkit";
import tournament_abi from "../../abi/tournamentcontract.json";
import { AZ_WSS_URL, TOURNAMENT_CONTRACT_ADDRESS } from "../../utils/data";
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

// [TO-DO]
export const createTournament = createAsyncThunk("tournament/create", async ({}: {}, {}) => {});
export const updateTournamentStatus = createAsyncThunk("tournament/update", async ({}: {}, {}) => {});
export const registerTournament = createAsyncThunk("tournament/register", async ({}: {}, {}) => {});
export const claimReward = createAsyncThunk("tournament/claim", async ({}: {}, {}) => {});

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
