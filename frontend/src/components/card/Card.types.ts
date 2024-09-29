export type Attributes = {
  cardHeader?: string
  cardFooter?: string
  gamesCompleted?: number
  ownedGames?: number
}

export type CardFn = {
  setCount: (value: string, count: number) => void
}

export type ContextValue = Attributes & CardFn
