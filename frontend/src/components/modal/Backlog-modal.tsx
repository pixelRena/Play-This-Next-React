import FocusTrap from "focus-trap-react"
import "./Modal.scss"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import Text from "../../components/text/Text"
import Button from "../../components/button/Button"
import "../../styles/Status.scss"
import Link from "svg/link"
import { generateDirectoryURL } from "utils"

const BacklogModal = (props) => {
  const [backlog, setBacklog] = useState<string[]>([])
  const [selected, setSelected] = useState<any>("")
  const [error, setError] = useState<boolean>(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await axios.get("/backlog")
        setError(false)
        setBacklog(data)
      } catch (error) {
        setError(true)
      }
    }
    fetchGames()
  }, [])

  const handleStatus = (e) => {
    let results: string[] = [...backlog].sort((a: any, b: any) => {
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
      ? setBacklog([
          ...backlog.sort((a: any, b: any) => a.name.localeCompare(b.name)),
        ])
      : setBacklog(results)

    resultsRef?.current?.scrollTo(0, 0)
  }

  return (
    props.visible && (
      <FocusTrap>
        <div
          id="modal-container"
          role="dialog"
          aria-modal="true"
          aria-hidden={props.visible}
          tabIndex={-1}
        >
          <div className="modal-content">
            <h2 className="modal-header">Backlog</h2>
            <div className="modal-body">
              <Text textStyle={{ textAlign: "center" }} bold>
                This list contains PS1/PS2 games that have not been suggested,
                but are being considered. This list includes steam games that
                are being considered as well.
              </Text>
              <div
                className="modal-listed-games"
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div id="status-container" style={{ padding: "15px" }}>
                  <div className="desktop">
                    <label htmlFor="status">
                      <Text bold>Sort by:</Text>
                    </label>
                    <Button
                      className={`${selected === "queue" && "selected"}`}
                      variant="queueStatus"
                      value="false"
                      onClick={handleStatus}
                    >
                      Queue
                    </Button>
                    <Button
                      className={`${selected === "completed" && "selected"}`}
                      variant="completeStatus"
                      value="true"
                      onClick={handleStatus}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
                <div
                  className="modal-results"
                  ref={resultsRef}
                  style={{
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {backlog.length ? (
                    backlog.map(({ name, image, played }: any, i) => (
                      <div
                        className="modal-results-item"
                        key={`${name}-game-results-${i}`}
                      >
                        <div className="modal-results-image">
                          <img
                            src={image}
                            alt={`${name}-game-cover`}
                            height="100%"
                            width="100%"
                          />
                        </div>
                        <div className="modal-results-description">
                          <div className="modal-results-title backlog">
                            <a
                              href={generateDirectoryURL(name)}
                              target="_blank"
                              rel="noreferrer"
                              title={name}
                            >
                              <Text className="link">{name}</Text>
                            </a>
                            <span>
                              <Link />
                            </span>
                          </div>
                          <Text
                            className={`game-status-${
                              played ? "completed" : "queue"
                            }`}
                            size="small"
                            textStyle={{ width: "auto" }}
                          >
                            {played ? "Completed" : "Queue"}
                          </Text>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Text>Backlog games are not available at this time.</Text>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="modalToggle" onClick={props.close}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </FocusTrap>
    )
  )
}

export default BacklogModal
