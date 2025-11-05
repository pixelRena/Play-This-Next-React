import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles/App.scss"
import "./styles/Modal.scss"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import { StoreProvider } from "./context/Store.context.jsx"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <>
    <StoreProvider>
      <App />
    </StoreProvider>
  </>
)
