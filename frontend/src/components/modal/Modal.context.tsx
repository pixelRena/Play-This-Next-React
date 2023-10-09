import { createContext, useState } from "react";
import * as T from "./Modal.types";

const ModalDetails = {
  text: "",
  games: [],
  results: [],
  filtered: false,
};

export const ModalContext = createContext<T.ContextValue>({
  open: false,
  modalAttrs: ModalDetails,
  setModalVisibility: () => {},
  setModalDetails: () => {},
});

export const ModalContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [modalAttrs, setModalAttrs] = useState(ModalDetails);

  const setModalVisibility = () => setOpen(!open);

  const setModalDetails = (
    attr: string,
    value: string | string[] | boolean
  ) => {
    setModalAttrs((prev) => ({
      ...prev,
      [attr]: value,
    }));
  };

  const value = { open, modalAttrs, setModalVisibility, setModalDetails };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
