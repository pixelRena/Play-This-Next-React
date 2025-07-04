import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles/App.scss"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
// import { NotificationContextProvider } from "components/notification/Notification.context"
// import { ModalContextProvider } from "components/modal/Modal.context"
// import { StoreProvider } from "context/Store.context"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <>
    {/* <StoreProvider>
      <ModalContextProvider>
        <NotificationContextProvider> */}
    <App />
    {/* </NotificationContextProvider>
      </ModalContextProvider>
    </StoreProvider> */}
  </>
)
