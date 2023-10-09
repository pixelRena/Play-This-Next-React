import * as T from "./Text.types";

const Text = ({
  children,
  size = "medium",
  bold,
  inline,
  color = "white",
  ...otherProps
}: T.TextProps) => {
  const style: React.CSSProperties = {
    fontSize: T.TEXT_SIZES[size],
    color: color,
    ...(bold && { fontWeight: "bold" }),
    ...(inline && { display: "inline" }),
  };

  return (
    <div style={style} {...otherProps}>
      {children}
    </div>
  );
};

export default Text;
