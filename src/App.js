import './styles/App.scss';

const App = () => {
  return (
    <>
      {/* <!-- Notification alert --> */}
      <div id="notification"></div>

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
        <section class="modal-section">
              <div class="submit-modal">
                  <h2 class="modal-header">Suggest a game</h2>
                  <div class="modal-body">
                      <form class="search-wrapper" onsubmit="onModalSubmitHandler(event)">
                          <input class="search-field" type="text" placeholder="Search a game..."/>
                          <button class="search-btn" type="submit">Search</button>
                      </form>
                      <button id="filter-games-btn" type="button">Filter By Games Selected</button>
                      <div class="modal-listed-games">
                          <div class="game-box">

                          </div>
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button id="submit-game-button" disabled>Submit Game Suggestion</button>
                      <button id="close-modal-button">Close</button>
                  </div>
              </div>
          </section>
      </main>
    </>
  );
}

export default App;
