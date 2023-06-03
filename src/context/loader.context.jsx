import { createContext, useState } from "react";

export const LoaderContext = createContext({
    isLoading: false,
    setIsLoading: () => {}
})

export const LoaderContextProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(false);
    const value = {isLoading, setIsLoading};

    return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
}