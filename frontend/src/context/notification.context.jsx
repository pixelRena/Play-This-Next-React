import { createContext, useState } from "react";

export const NotificationContext = createContext({
  isVisible: false,
  text: "",
  clear: () => {},
});

export const NotificationContextProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");

  const notification = (text) => {
    setIsVisible(true);
    setText(text);
  };

  const clear = () => {
    setIsVisible(false);
    setText("");
  };

  const value = { isVisible, text, clear, notification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
