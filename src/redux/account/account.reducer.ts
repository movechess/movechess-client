import { createReducer } from "@reduxjs/toolkit";

import { RootState } from "../store";

export type AccountReducer = {
  loading: boolean;
};

export const defaultAccountReducer: AccountReducer = {
  loading: false,
};

const accountReducer = createReducer(defaultAccountReducer, (builder) => {
  builder;
});

export const selectAcount = (state: RootState) => state.account;

export default accountReducer;
