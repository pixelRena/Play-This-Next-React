import "../styles/Button.scss";

const BUTTON_VARIANT_CLASSES = {
  primary: "primary",
  light: "light",
  add: "add",
  modalInput: "modal-input",
  modalToggle: "modal-toggle",
  modalAdd: "modal-add",
  simple: "simple",
};

const Button = ({ children, variant = "primary", ...otherProps }) => {
  return (
    <button
      {...otherProps}
      className={`button-container ${BUTTON_VARIANT_CLASSES[variant]} ${otherProps.className}`}
    >
      {children}
    </button>
  );
};

export default Button;
