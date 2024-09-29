const UpArrow = ({
  size = 25,
  color = "#000",
  style = {},
  isRotated = false,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    transform={`${isRotated ? "rotate(-180)" : ""}`}
  >
    <path d="M12 19V6M5 12l7-7 7 7" />
  </svg>
)
export default UpArrow
