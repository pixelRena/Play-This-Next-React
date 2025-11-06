const initialState = {
  suggested: {
    originalData: [],
    data: [],
    loading: true,
    error: "",
  },
  backlog: {
    originalData: [],
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
      return {
        ...state,
        [name]: {
          ...state[name],
          originalData: action.payload,
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

    case "isBacklog":
      return {
        ...state,
        isBacklog: action.payload,
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

    case "FILTER_SUGGESTED_TEXT":
      return {
        ...state,
        suggested: {
          ...state.suggested,
          data: state.suggested.data.filter((item) =>
            item.name.toLowerCase().includes(action.payload.toLowerCase())
          ),
        },
      }

    case "FILTER_BACKLOG_TEXT":
      return {
        ...state,
        backlog: {
          ...state.backlog,
          data: state.backlog.data.filter((item) =>
            item.name.toLowerCase().includes(action.payload.toLowerCase())
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

    case "RESET_BACKLOG":
      return {
        ...state,
        backlog: {
          ...state.backlog,
          data: action.payload,
        },
      }
    default:
      return state
  }
}

export { initialState, reducer }
