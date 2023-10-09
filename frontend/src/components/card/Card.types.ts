export type Attributes = {
  cardHeader?: string;
  cardFooter?: string;
  buttonTitle?: string;
  isCardFlipped: boolean;
  gamesCompleted?: number;
  ownedGames?: number;
};

export type CardFn = {
  setCardInformation: (value: boolean) => void;
  setCount: (value: string, count: number) => void;
};

export type ContextValue = Attributes & CardFn;
