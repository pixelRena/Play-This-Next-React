const axios = require("axios")

const handleSearch = async (req, res) => {
  const { name, token } = req.query
  try {
    const { data } = await axios.get(
      `https://api.twitch.tv/helix/search/categories?query=${name}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    )
    let dataReceived = data["data"]
    let dataArr = []
    dataReceived.map(({ name, box_art_url }) =>
      dataArr.push({
        name: name,
        image: box_art_url.replace("52x72", "150x200"),
      })
    )
    res.send(dataArr)
  } catch (error) {
    // Todo: Account for if token needs to be re-validated
    res.send(error)
  }
}

const handleAuth = async (req, res) => {
  const { access_token } = req.query

  try {
    const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Client-ID": process.env.TWITCH_CLIENT_ID,
      },
    })

    const validateToken = await axios.get(
      "https://id.twitch.tv/oauth2/validate",
      {
        headers: {
          Authorization: `OAuth ${access_token}`,
        },
      }
    )

    res.status(200).json({
      twitchUsername: userResponse.data.data[0].login,
      expires_in: validateToken["data"]["expires_in"],
      isOwner: isOwnerId(validateToken.data),
    })
  } catch (error) {
    res.status(404).send("Unable to fetch twitch username. Try again later.")
  }
}

// Twitch user ids are permanent, unlike login names
const isOwnerId = ({ user_id, client_id }) =>
  !!process.env.TWITCH_OWNER_ID &&
  user_id === process.env.TWITCH_OWNER_ID &&
  client_id === process.env.TWITCH_CLIENT_ID

// Express middleware: only lets the app owner through. The identity comes from
// Twitch's validate response for the token, never from the request body.
const requireOwner = async (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "")
  if (!token) return res.status(401).send("Missing token")

  try {
    const { data } = await axios.get("https://id.twitch.tv/oauth2/validate", {
      headers: { Authorization: `OAuth ${token}` },
    })
    if (!isOwnerId(data)) return res.status(403).send("Not allowed")
    next()
  } catch (error) {
    res.status(401).send("Invalid or expired token")
  }
}

module.exports = {
  handleSearch,
  handleAuth,
  requireOwner,
}
