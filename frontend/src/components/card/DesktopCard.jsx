import "../../styles/Card.scss"
import Results from "../../mock.json"
import Badge from "../badge/Badge"

const DesktopCard = () => {
  return (
    <div className="desktop-card card rounded-0 d-none d-sm-block text-uppercase">
      <div className="card-body p-4">
        <div className="d-flex flex-column gap-4">
          {Results.map(({ name, image }) => (
            <div className="d-flex flex-row gap-4" key={name}>
              <div className="card-game-cover">
                <img src={image} alt="" width="101px" />
              </div>

              <div>
                <div
                  className="card-game-title text-nowrap text-truncate"
                  title={name}
                >
                  {name}
                </div>
                <div className="d-flex flex-row gap-2 mt-2">
                  <Badge className="card-badge-game-completed">Completed</Badge>
                  <Badge className="card-badge-twitch-username">@wizebot</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DesktopCard
