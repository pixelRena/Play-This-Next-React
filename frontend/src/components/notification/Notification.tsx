import React from "react";
import { useContext, useEffect } from "react";
import { NotificationContext } from "./Notification.context";
import "./Notifications.scss";

export type Props = {
  children?: React.ReactNode;
};

const Notification = ({ children }: Props) => {
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
        {children && <div className="input-box">{children}</div>}
      </div>
    )
  );
};

export default Notification;
