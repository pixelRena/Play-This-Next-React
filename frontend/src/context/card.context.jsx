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
    const { state } = useContext(Store)
    const { suggested, steam } = state

    useEffect(() => {
        setCardHeader(isCardFlipped ? "Owned Games:" : "Suggested Games:")
        setCardFooter(isCardFlipped ? "Games Owned (Steam):" : "Games Completed:")
        setButtonTitle(isCardFlipped ?  "View Suggested Games" : "View Owned Games" )
        // eslint-disable-next-line
    }, [isCardFlipped])
    
    useEffect(() => {
        let { data } = suggested
        let gamesCompleted

        if(data.length > 0){
            gamesCompleted = data.filter(game => game.status === "completed").length
            setGamesCompleted(gamesCompleted)
        } 

    }, [suggested])

    useEffect(() => {
        let { data } = steam

        setOwnedGames(data.length)
    },[steam])
    
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