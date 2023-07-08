import { createContext, useEffect, useState, useReducer } from 'react';
import axios from 'axios'

export const Store = createContext();

const initialState = {
    suggested: {
        data: [],
        loading: true,
        error: ""
    },
    steam: {
        data: [],
        loading: true,
        error: ""
    },
    rawg: {
        data: [],
        loading: true,
        error: ""
	},
	username: localStorage.getItem('username-serenuy-games-ttv') ?? null
}

function reducer(state,action) {
	let name = action.type.split("_").pop().toLowerCase();
	let nameType = action.type.split("_").pop();
	
	switch(action.type) {
		case `FETCH_REQUEST_FOR_${nameType}`:
			return {
				...state, 
				[name]: { ...state[name] }
			};
		case `FETCH_SUCCESS_FOR_${nameType}`:
			return {
				...state,
				[name]: {
					...state[name],
					data: action.payload,
					loading: false,
					error: "",
				}
			};
		case `FETCH_FAIL_FOR_${nameType}`:
			return {
				...state,
				[name]: {
					...state[name],
					loading: false,
					error: action.payload,
				}
			};
		case "username": 
			return {
				...state,
				username: action.payload,
			}
		default:
			return state;
	}
}

export const StoreProvider = ({children}) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const [postRequest, setPostRequest] = useState(false)

	const api = async (url, actionType) => {
		dispatch({ type: `FETCH_REQUEST_FOR_${actionType}` });
		try {
		  const { data } = await axios.get(url);
		  dispatch({
			type: `FETCH_SUCCESS_FOR_${actionType}`,
			payload: data
		  });
		} catch (error) {
		  dispatch({
			type: `FETCH_FAIL_FOR_${actionType}`,
			payload: error.message
		  });
		}
	}

	useEffect(() => {
		const fetchGameData = async () => {
			await api("/suggested-games-collection", "SUGGESTED");
			await api("/steam-games-collection", "STEAM");
		};

		fetchGameData();
	}, [postRequest]);
	
	const value = {state, dispatch, setPostRequest};

	return <Store.Provider value={value}>{children}</Store.Provider>;
}