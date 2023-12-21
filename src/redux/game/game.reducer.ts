import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { createAsyncThunk, createReducer } from "@reduxjs/toolkit";
import abi from "../../abi/movechesscontract.json";
import { RootState } from "../store";

export const getGame = createAsyncThunk(
  "game/get",
  async ({ index, activeAccount, activeSigner }: { index: string | number; activeAccount: any; activeSigner: any }, { getState, dispatch }) => {
    try {
      const wsProvider = new WsProvider("wss://ws.test.azero.dev");
      const api = await ApiPromise.create({ provider: wsProvider });
      let contract = new ContractPromise(api, abi, "5CRDBTruY3hLTCQmn7MTnULpL3ALXLMEUWLDa826hyFftKkK");

      const gasLimit = 30000 * 1000000;
      //@ts-ignore
      const gasLimit2 = api.registry.createType("WeightV2", api.consts.system.blockWeights["maxBlock"]) as WeightV2;

      const storageDepositLimit = null;
      const { result, output } = await contract.query.getGameInfo("5Fnk19f5rh7uUbomnJVyMVcek8fXT2F2sLb3e5isMLft7CVV", { gasLimit: gasLimit2 }, index);
      if (result.isOk && output) {
        return output.toJSON();
      }
    } catch (error) {
      return null;
      console.log("7s200:err", error);
    }
  },
);

export type GameReducer = {
  loading: boolean;
  game: any;
};

export const defaultGameReducer: GameReducer = {
  loading: false,
  game: null,
};

const gameReducer = createReducer(defaultGameReducer, (builder) => {
  builder
    .addCase(getGame.pending, (state) => {
      state.loading = true;
    })
    .addCase(getGame.fulfilled, (state, action) => {
      state.game = (action.payload as any).ok;
      state.loading = false;
    });
});

export const selectGame = (state: RootState) => state.game;

export default gameReducer;
