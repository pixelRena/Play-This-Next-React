import { createContext, useState } from "react";

export const ModalContext = createContext({
  open: false,
  setOpen: () => {},
});

export const ModalContextProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const value = { open, setOpen };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
