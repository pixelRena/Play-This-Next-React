// Local dev entry point. server.js only exports the app (for Vercel).
const app = require("./server")

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`listening on port ${port}`))
