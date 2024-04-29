import type React from "react"

type Sizes = "small" | "medium" | "large" | "veryLarge"

export type TextProps = {
  children?: React.ReactNode
  size?: Sizes
  bold?: boolean
  inline?: boolean
  color?: string
  textStyle?: React.CSSProperties
  [x: string]: any
}

export const TEXT_SIZES = {
  small: "13px",
  medium: "17px",
  large: "22px",
  veryLarge: "25px",
}
