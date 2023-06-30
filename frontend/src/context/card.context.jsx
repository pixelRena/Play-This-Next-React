import { createContext, useContext, useState, useEffect } from "react"
import { Store } from "./store.context"

export const CardContext = createContext({
    isCardFlipped: false,
    setIsCardFlipped: () => {},
    cardHeader: "Suggested Games:",
    setCardHeader: () => {},
    cardFooter: "Games Completed:",
    setCardFooter: () => {},
    gamesCompleted: 0,
    setGamesCompleted: () => {},
    ownedGames: 0,
    setOwnedGames: () => {},
    buttonTitle: "View Owned Games",
    setButtonTitle: () => {}
})

export const CardContextProvider = ({children}) => {
    const [isCardFlipped, setIsCardFlipped] = useState(false)
    const [cardHeader, setCardHeader] = useState("Suggested Games:")
    const [cardFooter, setCardFooter] = useState("Games Completed:")
    const [gamesCompleted, setGamesCompleted] = useState(0)
    const [ownedGames, setOwnedGames] = useState(0)
    const [buttonTitle, setButtonTitle] = useState("View Owned Games")
    const { suggestedGames, steam } = useContext(Store)

    useEffect(() => {
        setCardHeader(isCardFlipped ? "Owned Games:" : "Suggested Games:")
        setCardFooter(isCardFlipped ? "Games Owned (Steam):" : "Games Completed:")
        setButtonTitle(isCardFlipped ?  "View Suggested Games" : "View Owned Games" )
        // eslint-disable-next-line
    },[isCardFlipped])
    
    const value = {
        isCardFlipped,
        setIsCardFlipped,
        cardHeader,
        setCardHeader,
        cardFooter,
        setCardFooter,
        gamesCompleted,
        setGamesCompleted,
        ownedGames,
        setOwnedGames,
        buttonTitle,
        setButtonTitle
    }

    return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}