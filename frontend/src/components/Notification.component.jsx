import { useContext, useEffect } from "react";
import { NotificationContext } from "../context/notification.context";
import "../styles/Notifications.scss";

const Notification = ({ children }) => {
  const { isVisible, text, clear } = useContext(NotificationContext);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        clear();
      }, 6000);
    }
    // eslint-disable-next-line
  }, [isVisible]);

  return (
    isVisible && (
      <div id="notification">
        <div>{text}</div>
        {children && <div class="input-box">{children}</div>}
      </div>
    )
  );
};

export default Notification;
