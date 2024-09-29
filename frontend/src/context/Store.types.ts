import type React from "react"

export interface Data {
  data: string[]
  loading: boolean
  error: string
}

export enum ActionType {
  FETCH_REQUEST_FOR_SUGGESTED = `FETCH_REQUEST_FOR_SUGGESTED`,
  FETCH_SUCCESS_FOR_SUGGESTED = `FETCH_SUCCESS_FOR_SUGGESTED`,
  FETCH_FAIL_FOR_SUGGESTED = `FETCH_FAIL_FOR_SUGGESTED`,
  username = `username`,
}

export type Action = {
  // Todo: SHOULD BE USING ACTION TYPE TO GET VARIANT
  type: string
  payload?: any
}

export type State = {
  suggested: Data
  user: {
    username: string | null
    token: string | null
    expires_in: number | null
  }
}

export interface ContextValue {
  state: State
  dispatch: React.Dispatch<Action>
  setPostRequest?: React.Dispatch<React.SetStateAction<boolean>>
  usernameApi?: (value: string, token: string, expires_in: number) => {}
  authorize?: () => void
  api?: (url: string, collection: string) => void
}
