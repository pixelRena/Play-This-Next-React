import { ModalContext } from "../../components/modal/Modal.context";
import { CardContext } from "./Card.context";
import { useContext, useEffect, useState, useRef } from "react";
import { Store } from "../../context/Store.context";
import Text from "../text/Text";
import Button from "../../components/button/Button";
import Loader from "../../components/loader/Loader";
import "./Card.scss";
import "../../styles/Status.scss";

const cardInformation: {
  data: string[];
  text: string;
  status: "next" | "completed" | "declined" | "queue";
} = {
  data: [],
  text: "",
  status: "queue",
};

const Card = () => {
  const { cardHeader, cardFooter, ownedGames, gamesCompleted, isCardFlipped } =
    useContext(CardContext);
  const [card, setCard] = useState(cardInformation);
  const [selected, setSelected] = useState<any>("");
  const cardWindow = useRef(null);
  const { setModalVisibility } = useContext(ModalContext);
  const { state } = useContext(Store);
  const { suggested, steam } = state;
  const { data, text, status } = card;

  const handleSearch = (e) => {
    //  Todo: need to fix text field 'select all + delete' not responding
    let dataCopy = isCardFlipped ? steam.data : suggested.data;
    setCard((prev) => ({ ...prev, text: e.target.value }));

    if (text === "" || !text.length) {
      setCard((prev) => ({ ...prev, status: "queue" }));
    } else {
      let results;
      if (selected) {
        results = dataCopy.filter((game: any) => {
          return (
            game.name.toLowerCase().includes(text.toLowerCase()) &&
            game.status === selected
          );
        });
        setCard((prev) => ({ ...prev, status: selected }));
      } else {
        results = dataCopy.filter((game: any) => {
          return game.name.toLowerCase().includes(text.toLowerCase());
        });
      }
      setCard((prev) => ({ ...prev, data: results }));
    }
  };

  const handleStatus = (e) => {
    let results = suggested.data.filter((game: any) => {
      return game.status === e.target.value;
    });

    if (selected === e.target.value || !e.target.value) {
      // Reset selected filter
      setSelected("");
      setCard((prev) => ({ ...prev, data: suggested.data }));
      return;
    } else {
      setSelected(e.target.value);
    }
    setCard((prev) => ({ ...prev, data: results }));
  };

  const CardHeader = () => (
    <div id="card-header-container">
      <h3 id="card-header">{cardHeader}</h3>

      <div id="status-container">
        <div className="desktop">
          <label htmlFor="status">Sort by:</label>
          <Button
            className={selected === "next" && "selected"}
            variant="nextStatus"
            value="next"
            onClick={handleStatus}
          >
            Next
          </Button>
          <Button
            className={selected === "declined" && "selected"}
            variant="declinedStatus"
            value="declined"
            onClick={handleStatus}
          >
            Declined
          </Button>
          <Button
            className={selected === "queue" && "selected"}
            variant="queueStatus"
            value="queue"
            onClick={handleStatus}
          >
            Queue
          </Button>
          <Button
            className={selected === "completed" && "selected"}
            variant="completeStatus"
            value="completed"
            onClick={handleStatus}
          >
            Completed
          </Button>
        </div>
        <div className="mobile">
          <label htmlFor="status">Sort by:</label>
          <select
            name="status"
            id="status-selection"
            defaultValue=""
            onChange={handleStatus}
          >
            <option value="next">Next</option>
            <option value="">Show All</option>
            <option value="queue">Queue</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>
    </div>
  );

  const CardBody = () => (
    <div id="card-body" ref={cardWindow}>
      {/* <!-- Loop card items --> */}
      {suggested.loading ? <Loader /> : <CardList data={data} />}
    </div>
  );

  const CardFooter = () => (
    <div id="card-footer">
      {cardFooter}: {isCardFlipped ? ownedGames : gamesCompleted}
    </div>
  );

  useEffect(() => {
    // Sorts data when user types text to match suggested data
    setCard((prev) => ({ ...prev, data: suggested.data }));
  }, [suggested]);

  useEffect(() => {
    cardWindow.current.scrollTo(0, 0);
    if (data === suggested.data || isCardFlipped) {
      setCard((prev) => ({ ...prev, data: steam.data }));
    } else if (data === steam.data || !isCardFlipped) {
      setCard((prev) => ({ ...prev, data: suggested.data }));
    }
    // Empties textfield if card is flipped to different section
    setCard((prev) => ({ ...prev, text: "" }));

    // eslint-disable-next-line
  }, [isCardFlipped]);

  useEffect(() => {
    // Copies data into a different variable
    let dataCopy = isCardFlipped ? steam.data : suggested.data;

    // Sorts data according to status selected
    if (dataCopy === suggested.data) {
      let results = dataCopy.sort((a: any, b: any) => {
        if (a.status === status && b.status !== status) return -1;
        if (a.status !== status && b.status === status) return 1;
        return a.status.localeCompare(b.status);
      });

      setCard((prev) => ({ ...prev, data: results }));
      return;
    }
    setCard((prev) => ({ ...prev, data: dataCopy }));
    // eslint-disable-next-line
  }, [status]);

  return (
    <div id="card">
      <CardHeader />
      <input
        value={text}
        type="text"
        id="card-search-input"
        placeholder="Search games.."
        onChange={handleSearch}
      />
      <Button
        variant="add"
        title="Start searching for games to add!"
        onClick={setModalVisibility}
      >
        +
      </Button>
      <CardBody />
      <CardFooter />
    </div>
  );
};

export default Card;

const CardList = ({ data }) => {
  const { isCardFlipped } = useContext(CardContext);

  return (
    <div className="card-list">
      {data.length ? (
        data?.map(({ name, image, username, status }) => (
          <div className="card-list-item" key={`${name}-id`}>
            {/* <!-- Column --> */}
            <div>
              <div
                className={`${
                  isCardFlipped ? "card-list-image-steam" : "card-list-image"
                }`}
                style={{ backgroundImage: `url(${image})` }}
              ></div>
            </div>
            {/* <!-- Column --> */}
            <div className="card-information">
              <div className="card-list-item-title">{name}</div>
              {isCardFlipped ? null : (
                <div className="card-list-extra-information">
                  <div>
                    Posted by:&nbsp;
                    <strong>
                      <a
                        href={`https://www.twitch.tv/${username}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`Checkout ${username} on Twitch!`}
                      >
                        {username}
                      </a>
                    </strong>
                  </div>
                  <div className={`game-status-${status}`}>{status}</div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <Text size="large">No Games Found</Text>
      )}
    </div>
  );
};
