import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "styles/App.scss";
import { NotificationContextProvider } from "components/notification/Notification.context";
import { ModalContextProvider } from "components/modal/Modal.context";
import { CardContextProvider } from "components/card/Card.context";
import { StoreProvider } from "context/Store.context";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <CardContextProvider>
      <StoreProvider>
        <ModalContextProvider>
          <NotificationContextProvider>
            <App />
          </NotificationContextProvider>
        </ModalContextProvider>
      </StoreProvider>
    </CardContextProvider>
  </React.StrictMode>
);
