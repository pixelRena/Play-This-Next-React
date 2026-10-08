import { createContext, useEffect, useState, useReducer } from "react"
import axios from "axios"
import { initialState, reducer } from "./Store.utils.jsx"
import { API_URL, REDIRECT_URL } from "../config"

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

  const usernameApi = async (
    newUsername,
    token,
    expires_in,
    isOwner,
    userId
  ) => {
    try {
      localStorage.setItem("ttv-username", newUsername)
      localStorage.setItem("ttv-token", token)
      localStorage.setItem("ttv-token-expires-in", expires_in)
      localStorage.setItem("ttv-is-owner", String(!!isOwner))
      localStorage.setItem("ttv-user-id", userId)
      dispatch({
        type: "user",
        payload: {
          username: newUsername,
          token,
          expires_in,
          isOwner: !!isOwner,
          userId,
        },
      })
      return
    } catch (error) {
      console.error(error)
      return
    }
  }

  // Re-check ownership for an existing session. Fresh logins (token in the URL
  // hash) are handled by the cards, so skip those.
  useEffect(() => {
    const { token } = state.user
    const hasHashToken = new URLSearchParams(document.location.hash).has(
      "#access_token"
    )
    if (!token || hasHashToken) return

    const refreshUser = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/auth?access_token=${token}`
        )
        usernameApi(
          data.twitchUsername,
          token,
          data.expires_in,
          data.isOwner,
          data.userId
        )
      } catch (error) {
        console.error(error)
      }
    }
    refreshUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The server decides who may delete what; the buttons are just hidden for
  // everyone else
  const deleteGame = async (name, isBacklog) => {
    if (!window.confirm(`Delete "${name}"?`)) return

    try {
      await axios.delete(
        `${API_URL}/games/${
          isBacklog ? "backlog" : "suggested"
        }?name=${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${state.user.token}` } }
      )
      forceFetchCall((prev) => !prev)
    } catch (error) {
      console.error(error)
      window.alert("Unable to delete game.")
    }
  }

  useEffect(() => {
    const fetchGameData = async () => {
      await api(`${API_URL}/games`, "SUGGESTED")
      await api(`${API_URL}/games/backlog`, "BACKLOG")
    }
    fetchGameData()
  }, [postRequest])

  const authorize = async () =>
    window.location.replace(
      `https://id.twitch.tv/oauth2/authorize?client_id=8h55e8b7evg28b8f1ybsb3sin8b883&redirect_uri=${REDIRECT_URL}&response_type=token&scope=user_read`
    )

  const value = {
    state,
    dispatch,
    forceFetchCall,
    usernameApi,
    deleteGame,
    authorize,
    api,
  }

  return <Store.Provider value={value}>{children}</Store.Provider>
}
