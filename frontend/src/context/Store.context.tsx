import {
  createContext,
  useEffect,
  useState,
  useReducer,
  useContext,
} from "react"
import { CardContext } from "../components/card/Card.context"
import axios from "axios"
import * as T from "./Store.types"

const initialState: T.State = {
  suggested: {
    data: [],
    loading: true,
    error: "",
  },
  steam: {
    data: [],
    loading: true,
    error: "",
  },
  rawg: {
    data: [],
    loading: true,
    error: "",
  },
  username: localStorage.getItem("ttv-username") ?? null,
}

export const Store = createContext<T.ContextValue>({
  state: initialState,
  dispatch: () => null,
})

// Todo: Adjust action properties
const reducer = (state: T.State, action: T.Action) => {
  let name = action.type.split("_").pop()?.toLowerCase() || ""
  let nameType = action.type.split("_").pop() || ""

  switch (action.type) {
    case `FETCH_REQUEST_FOR_${nameType}`:
      return {
        ...state,
        [name]: { ...(state[name as keyof T.State] as T.Data) },
      }
    case `FETCH_SUCCESS_FOR_${nameType}`:
      return {
        ...state,
        [name]: {
          ...(state[name as keyof T.State] as T.Data),
          data: action.payload,
          loading: false,
          error: "",
        },
      }
    case `FETCH_FAIL_FOR_${nameType}`:
      return {
        ...state,
        [name]: {
          ...(state[name as keyof T.State] as T.Data),
          loading: false,
          error: action.payload,
        },
      }
    case "username":
      return {
        ...state,
        username: action.payload,
      }
    default:
      return state
  }
}

export const StoreProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { setCount } = useContext(CardContext)
  const [postRequest, setPostRequest] = useState(false)

  const api = async (url: string, actionType: string) => {
    dispatch({ type: `FETCH_REQUEST_FOR_${actionType}` })
    try {
      const { data } = await axios.get(url)
      dispatch({
        type: `FETCH_SUCCESS_FOR_${actionType}`,
        payload: data,
      })
      if (actionType === "SUGGESTED") {
        let c = data.reduce((c, type) => {
          if (type.status === "completed") return c + 1

          return c
        }, 0)
        setCount("gamesCompleted", c)
      } else {
        setCount("ownedGames", data.length)
      }
    } catch (error) {
      dispatch({
        type: `FETCH_FAIL_FOR_${actionType}`,
        payload: error.message,
      })
    }
  }

  const usernameApi = async (newUsername: string) => {
    try {
      if (newUsername) {
        // TODO: update username for existing
        // await axios
        //   .post("/update-username", {
        //     oldUsername: state.username,
        //     newUsername,
        //   })
        //   .then(() => {
        //     localStorage.setItem("ttv-username", newUsername)
        //   })
        localStorage.setItem("ttv-username", newUsername)

        dispatch({
          type: "username",
          payload: newUsername,
        })
        return 1
      }
      throw new Error()
    } catch (error) {
      return 0
    }
  }

  useEffect(() => {
    const fetchGameData = async () => {
      await api("/suggested-games-collection", "SUGGESTED")
      await api("/steam-games-collection", "STEAM")
    }
    fetchGameData()
    // eslint-disable-next-line
  }, [postRequest])

  const authorize = async () =>
    window.location.replace(
      `https://id.twitch.tv/oauth2/authorize?client_id=8h55e8b7evg28b8f1ybsb3sin8b883&redirect_uri=https://nuygames.xyz/callback&response_type=token&scope=user_read`
    )

  const value = {
    state,
    dispatch,
    setPostRequest,
    usernameApi,
    authorize,
  }

  return <Store.Provider value={value}>{children}</Store.Provider>
}
