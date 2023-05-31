import { useContext } from "react";
import { NotificationContext } from "../context/notification.context";

const Notification = () => {
    const {isVisible, setIsVisible, text, setText} = useContext(NotificationContext);

    if(isVisible) {
        setTimeout(() => {
            setIsVisible(false);
            setText("");
        },6000)
    }

    return isVisible && <div id="notification">{text}</div>;
}
 
export default Notification;