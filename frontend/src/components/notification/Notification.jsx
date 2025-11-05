import { useContext, useEffect } from "react"
import { Store } from "../../context/Store.context.jsx"
import "../../styles/Notification.scss"

const Notification = () => {
  const { state, dispatch } = useContext(Store)
  const { message, type, isVisible } = state.toastr
  const toastrClass = `${type === "error" ? "bg-danger" : "bg-success"} ${
    isVisible ? "show" : ""
  }`

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        dispatch({
          type: "toastr",
          payload: {
            message: "",
            type: "",
            isVisible: false,
          },
        })
      }, 6000)
    }
  }, [isVisible])

  return (
    <div
      className={`toast align-items-center text-uppercase ${toastrClass}`}
      role="alert"
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
      </div>
    </div>
  )
}

export default Notification
