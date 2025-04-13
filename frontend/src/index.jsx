import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles/App.scss"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
// import { NotificationContextProvider } from "components/notification/Notification.context"
// import { ModalContextProvider } from "components/modal/Modal.context"
// import { StoreProvider } from "context/Store.context"

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <React.StrictMode>
    {/* <StoreProvider>
      <ModalContextProvider>
        <NotificationContextProvider> */}
    <App />
    {/* </NotificationContextProvider>
      </ModalContextProvider>
    </StoreProvider> */}
  </React.StrictMode>
)
