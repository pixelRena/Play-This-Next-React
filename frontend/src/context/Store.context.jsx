import { createContext, useEffect, useState, useReducer } from "react"
import axios from "axios"

const initialState = {
  suggested: {
    originalData: [],
    data: [],
    loading: true,
    error: "",
  },
  backlog: {
    data: [],
    loading: true,
    error: "",
  },
  user: {
    username: localStorage.getItem("ttv-username") ?? null,
    token: localStorage.getItem("ttv-token") ?? null,
    expires_in: localStorage.getItem("ttv-token-expires-in") ?? null,
  },
  toastr: {
    message: "",
    type: "",
    isVisible: false,
  },
  isBacklog: false,
}

export const Store = createContext({
  state: initialState,
  dispatch: () => null,
})

const reducer = (state, action) => {
  let name = action.type.split("_").pop()?.toLowerCase() || ""
  let nameType = action.type.split("_").pop() || ""

  switch (action.type) {
    case `FETCH_REQUEST_FOR_${nameType}`:
      return {
        ...state,
        [name]: { ...state[name] },
      }

    case `FETCH_SUCCESS_FOR_${nameType}`:
      if (nameType === "SUGGESTED") {
        return {
          ...state,
          [name]: {
            ...state[name],
            originalData: action.payload,
            data: action.payload,
            loading: false,
          },
        }
      }
      return {
        ...state,
        [name]: {
          ...state[name],
          data: action.payload,
          loading: false,
        },
      }

    case `FETCH_FAIL_FOR_${nameType}`:
      return {
        ...state,
        [name]: {
          ...state[name],
          loading: false,
          error: action.payload,
        },
      }

    case "user":
      return {
        ...state,
        user: action.payload,
      }

    case "toastr":
      return {
        ...state,
        toastr: action.payload,
      }

    case "FILTER_SUGGESTED":
      return {
        ...state,
        suggested: {
          ...state.suggested,
          data: state.suggested.originalData.filter(
            (item) => item.status === action.payload.status
          ),
        },
      }

    case "SORT_SUGGESTED":
      return {
        ...state,
        suggested: {
          ...state.suggested,
          data: [...state.suggested.originalData].sort((a, b) => {
            if (a.status === action.payload) return -1
            if (b.status === action.payload) return 1
            return 0
          }),
        },
      }

    case "RESET_SUGGESTED":
      return {
        ...state,
        suggested: {
          ...state.suggested,
          data: action.payload,
        },
      }
    default:
      return state
  }
}

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
      await api("http://localhost:3001/games", "SUGGESTED")
      await api("http://localhost:3001/games/backlog", "BACKLOG")
    }
    fetchGameData()
  }, [postRequest])

  const authorize = async () =>
    window.location.replace(
      `https://id.twitch.tv/oauth2/authorize?client_id=8h55e8b7evg28b8f1ybsb3sin8b883&redirect_uri=http://localhost:3000/callback&response_type=token&scope=user_read`
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
