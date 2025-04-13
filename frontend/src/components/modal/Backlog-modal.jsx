import FocusTrap from "focus-trap-react"
import "./Modal.scss"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import "../../styles/Status.scss"

const BacklogModal = (props) => {
  const [backlog, setBacklog] = useState([])
  const [selected, setSelected] = useState("")
  const resultsRef = useRef(null)

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await axios.get("/games/backlog")

      setBacklog(data)
    }
    fetchGames()
  }, [])

  const handleStatus = (e) => {
    let results = [...backlog].sort((a, b) => {
      if (e.target.value === "true") {
        return a.played === b.played ? 0 : a.played ? -1 : 1
      } else {
        return a.played === b.played ? 0 : a.played ? 1 : -1
      }
    })

    if (
      (selected === "completed" && e.target.value === "true") ||
      (selected === "queue" && e.target.value === "false")
    ) {
      // Reset selected filter
      setSelected("")
    } else {
      setSelected(e.target.value === "true" ? "completed" : "queue")
    }

    JSON.stringify(backlog) === JSON.stringify(results)
      ? setBacklog([...backlog.sort((a, b) => a.name.localeCompare(b.name))])
      : setBacklog(results)

    resultsRef?.current?.scrollTo(0, 0)
  }

  return props.visible && <FocusTrap></FocusTrap>
}

export default BacklogModal
