import { createContext, useState } from "react";

export const NotificationContext = createContext({
    isVisible: false,
    setIsVisible: () => {},
    text: "",
    setText: () => {}
})

export const NotificationContextProvider = ({children}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [text, setText] = useState("");
    const value = {isVisible, setIsVisible, text, setText};

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}