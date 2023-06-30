import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/App.scss'
import './styles/Loader.scss'
import App from './App'
import { NotificationContextProvider } from "./context/notification.context"
import { ModalContextProvider } from "./context/modal.context"
import { CardContextProvider } from "./context/card.context"
import { StoreProvider } from "./context/store.context"

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <StoreProvider>
      <ModalContextProvider>
        <NotificationContextProvider>
          <CardContextProvider>
            <App />
          </CardContextProvider>
        </NotificationContextProvider>
      </ModalContextProvider>
    </StoreProvider>
  </React.StrictMode>
)
