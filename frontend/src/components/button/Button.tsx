import "./Button.scss";
import * as T from "./Button.types";

const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: T.ButtonProps) => {
  return (
    <button
      {...props}
      className={`button-container ${T.BUTTON_VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
