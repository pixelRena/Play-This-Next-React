import * as T from "./Text.types"

const Text = ({
  children,
  size = "medium",
  bold,
  inline,
  color = "white",
  textStyle = {},
  ...otherProps
}: T.TextProps) => {
  const style: React.CSSProperties = {
    fontSize: T.TEXT_SIZES[size],
    color: color,
    ...(bold && { fontWeight: "bold" }),
    ...(inline && { display: "inline" }),
    ...textStyle,
  }

  return (
    <div style={style} {...otherProps}>
      {children}
    </div>
  )
}

export default Text
