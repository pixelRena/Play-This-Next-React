import { createContext, useReducer } from 'react';

export const Store = createContext();

const initalState = {
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
    }
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
		default:
			return state;
	}
}

export const StoreProvider = ({children}) => {
	const [state, dispatch] = useReducer(reducer, initalState);
	const value = {state, dispatch};

	return <Store.Provider value={value}>{children}</Store.Provider>;
}