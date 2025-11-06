import { createContext, useEffect, useState, useReducer } from "react"
import axios from "axios"
import { initialState, reducer } from "./Store.utils.jsx"

export const Store = createContext({
  state: initialState,
  dispatch: () => null,
})

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [postRequest, forceFetchCall] = useState(false)

  const api = async (url, actionType) => {
    dispatch({ type: `FETCH_REQUEST_FOR_${actionType}` })
    try {
      const { data } = await axios.get(url)
      if (actionType === "BACKLOG") {
        data.sort((a, b) => {
          if (a.played) return 1
          if (b.played) return -1
          return 0
        })
        dispatch({
          type: `FETCH_SUCCESS_FOR_${actionType}`,
          payload: data,
        })
        return
      }

      dispatch({
        type: `FETCH_SUCCESS_FOR_${actionType}`,
        payload: [...data].sort(
          (a, b) =>
            ({ next: 1, queue: 2, completed: 3, declined: 4 }[
              a.status.toLowerCase()
            ] -
            { next: 1, queue: 2, completed: 3, declined: 4 }[
              b.status.toLowerCase()
            ])
        ),
      })
    } catch (error) {
      dispatch({
        type: `FETCH_FAIL_FOR_${actionType}`,
        payload: error.message,
      })
    }
  }

  const usernameApi = async (newUsername, token, expires_in) => {
    try {
      localStorage.setItem("ttv-username", newUsername)
      localStorage.setItem("ttv-token", token)
      localStorage.setItem("ttv-token-expires-in", expires_in)
      dispatch({
        type: "user",
        payload: {
          username: newUsername,
          token,
          expires_in,
        },
      })
      return
    } catch (error) {
      console.error(error)
      return
    }
  }

  useEffect(() => {
    const fetchGameData = async () => {
      await api("https://play-this-next-react.vercel.app/games", "SUGGESTED")
      await api(
        "https://play-this-next-react.vercel.app/games/backlog",
        "BACKLOG"
      )
    }
    fetchGameData()
  }, [postRequest])

  const authorize = async () =>
    window.location.replace(
      `https://id.twitch.tv/oauth2/authorize?client_id=8h55e8b7evg28b8f1ybsb3sin8b883&redirect_uri=https://play-this-next-react.vercel.app/callback&response_type=token&scope=user_read`
    )

  const value = {
    state,
    dispatch,
    forceFetchCall,
    usernameApi,
    authorize,
    api,
  }

  return <Store.Provider value={value}>{children}</Store.Provider>
}
