import { createContext, useState } from "react";

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
});

export const CardContextProvider = ({children}) => {
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const [cardHeader, setCardHeader] = useState("Suggested Games:");
    const [cardFooter, setCardFooter] = useState("Games Completed:");
    const [gamesCompleted, setGamesCompleted] = useState(0);
    const [ownedGames, setOwnedGames] = useState(0);
    const [buttonTitle, setButtonTitle] = useState("View Owned Games");

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
    };

    return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}