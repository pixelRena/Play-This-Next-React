import type React from "react";

export interface Data {
  data: string[];
  loading: boolean;
  error: string;
}

export enum ActionType {
  FETCH_REQUEST_FOR_SUGGESTED = `FETCH_REQUEST_FOR_SUGGESTED`,
  FETCH_SUCCESS_FOR_SUGGESTED = `FETCH_SUCCESS_FOR_SUGGESTED`,
  FETCH_FAIL_FOR_SUGGESTED = `FETCH_FAIL_FOR_SUGGESTED`,
  FETCH_REQUEST_FOR_STEAM = `FETCH_REQUEST_FOR_STEAM`,
  FETCH_SUCCESS_FOR_STEAM = `FETCH_SUCCESS_FOR_STEAM`,
  FETCH_FAIL_FOR_STEAM = `FETCH_FAIL_FOR_STEAM`,
  FETCH_REQUEST_FOR_RAWG = `FETCH_REQUEST_FOR_RAWG`,
  FETCH_SUCCESS_FOR_RAWG = `FETCH_SUCCESS_FOR_RAWG`,
  FETCH_FAIL_FOR_RAWG = `FETCH_FAIL_FOR_RAWG`,
  username = `username`,
}

export type Action = {
  // Todo: SHOULD BE USING ACTION TYPE TO GET VARIANT
  type: string;
  payload?: any;
};

export type State = {
  suggested: Data;
  steam: Data;
  rawg: Data;
  username: string | null;
};

export interface ContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  setPostRequest?: React.Dispatch<React.SetStateAction<boolean>>;
  usernameApi?: (value: string) => {};
}