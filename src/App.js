import './styles/App.scss';
import Notification from "./components/Notification.component";
import Modal from "./components/Modal.component";

const App = () => {
  return (
    <>
      {/* <!-- Notification alert --> */}
      <Notification/>      

      {/* <!-- Main Content --> */}
      <main>
        <section><div class="background-overlay"></div></section>
        <section>
            <div class="avatar-container">
                <div class="avatar"></div>
            </div>
            <button class="main-button">View Owned Games</button>
            <button class="add-game-button-mobile">Submit Game Suggestion</button>
            <div class="card">
                <div id="card-header-container">
                    <h3 class="card-header">Suggested Games:</h3>
                    <div id="sort-games-container">
                        <label for="games">Sort by:</label>
                        <select name="games" id="sort-games-selection">
                            <option value="next">Playing Next</option>
                            <option value="completed">Completed</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>
                <button class="add-game-button">+</button>
                <input type="text" id="card-search-input" placeholder="Search games.."/>
                <div class="card-body">
                    {/* <!-- Loop card items --> */}
                    <div class="card-list">

                    </div>
                    
                    {/* <!-- Loader --> */}
                    <div id="loader-container">
                        <div id="loader">
                            <div></div>
                            <div></div>
                        </div>
                    </div>

                </div>
                <div class="card-footer"></div>
            </div>
        </section>
        <section>
            <Modal/>
        </section>
      </main>
    </>
  );
}

export default App;
