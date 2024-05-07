import { createContext, useState } from "react"
import * as T from "./Card.types"

const cardAttributes = {
  cardHeader: "Suggested Games",
  cardFooter: "Games Completed",
  buttonTitle: "View Owned Games (Steam)",
  isCardFlipped: false,
  gamesCompleted: 0,
  ownedGames: 0,
}

export const CardContext = createContext<T.ContextValue>({
  setCardInformation: () => {},
  setCount: () => {},
  ...cardAttributes,
})

export const CardContextProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [cardAttrs, setCardAttrs] = useState<T.Attributes>(cardAttributes)

  const setCardInformation = (isCardFlipped: boolean) => {
    if (!isCardFlipped) {
      setCardAttrs((prev) => ({
        ...prev,
        isCardFlipped: false,
        cardHeader: "Suggested Games",
        cardFooter: "Games Completed",
        buttonTitle: "View Owned Games (Steam)",
      }))
      return
    }

    setCardAttrs((prev) => ({
      ...prev,
      isCardFlipped: true,
      cardHeader: "Owned Games (Steam)",
      cardFooter: "Games Owned",
      buttonTitle: "View Suggested Games",
    }))
  }

  const setCount = (attr: string, c: number) => {
    setCardAttrs((prev) => ({
      ...prev,
      [attr]: c,
    }))
  }

  const value = {
    setCardInformation,
    setCount,
    ...cardAttrs,
  }

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}
