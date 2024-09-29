import { createContext, useState } from "react"
import * as T from "./Card.types"

const cardAttributes = {
  cardHeader: "Suggested Games",
  cardFooter: "Games Completed",
  gamesCompleted: 0,
  ownedGames: 0,
}

export const CardContext = createContext<T.ContextValue>({
  setCount: () => {},
  ...cardAttributes,
})

export const CardContextProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [cardAttrs, setCardAttrs] = useState<T.Attributes>(cardAttributes)

  const setCount = (attr: string, c: number) => {
    setCardAttrs((prev) => ({
      ...prev,
      [attr]: c,
    }))
  }

  const value = {
    setCount,
    ...cardAttrs,
  }

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}
