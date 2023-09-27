import { useContext, useEffect } from "react";
import { NotificationContext } from "../context/notification.context";

const Notification = () => {
  const { isVisible, text, clear } = useContext(NotificationContext);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        clear();
      }, 6000);
    }
    // eslint-disable-next-line
  }, [isVisible]);

  return isVisible && <div id="notification">{text}</div>;
};

export default Notification;
