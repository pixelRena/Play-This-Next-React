import { createContext, useState } from "react"

const ModalDetails = {
  text: "",
  games: [],
  results: [],
  filtered: false,
}

export const ModalContext = createContext({
  open: false,
  modalAttrs: ModalDetails,
  setModalVisibility: () => {},
  setModalDetails: () => {},
})

export const ModalContextProvider = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [modalAttrs, setModalAttrs] = useState(ModalDetails)

  const setModalVisibility = () => setOpen(!open)

  const setModalDetails = (attr, value) => {
    setModalAttrs((prev) => ({
      ...prev,
      [attr]: value,
    }))
  }

  const value = { open, modalAttrs, setModalVisibility, setModalDetails }

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}
