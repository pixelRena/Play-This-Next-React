import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NotificationContextProvider } from "./context/notification.context";
import { ModalContextProvider } from "./context/modal.context";
import { LoaderContextProvider } from "./context/loader.context";
import { CardContextProvider } from "./context/card.context";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoaderContextProvider>
      <ModalContextProvider>
        <NotificationContextProvider>
          <CardContextProvider>
            <App />
          </CardContextProvider>
        </NotificationContextProvider>
      </ModalContextProvider>
    </LoaderContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
