const TEXT_SIZES = {
    small: "13px",
    medium: "17px",
    large: "22px",
    veryLarge: "25px",
}
const Text = ({ children, size="medium", bold, inline, color="white", ...otherProps }) => {

    const style = {
        fontSize: TEXT_SIZES[size],
        color: color,
        ...bold && { fontWeight: "bold" },
        ...inline && { display: "inline" },
    }

    return <div style={style} {...otherProps}>{children}</div>;
}
 
export default Text;