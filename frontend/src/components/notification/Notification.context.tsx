import { createContext, useState } from "react";
import * as T from "./Notification.types";

export const NotificationContext = createContext<T.ContextValue>({
  isVisible: false,
  text: "",
  clear: () => {},
  notification: () => {},
});

export const NotificationContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");

  const notification = (text: string) => {
    setIsVisible(true);
    setText(text);
  };

  const clear = () => {
    setIsVisible(false);
    setText("");
  };

  const value: T.ContextValue = {
    isVisible,
    text,
    clear,
    notification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
