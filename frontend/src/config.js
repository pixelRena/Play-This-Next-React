// `npm start` loads frontend/.env.development, which points this at the local
// server. Production builds fall back to the deployed Vercel API.
export const API_URL =
  process.env.REACT_APP_API_URL ?? "https://play-this-next-react.vercel.app"

// This URL must be registered as a redirect URL in the Twitch developer console
export const REDIRECT_URL =
  process.env.NODE_ENV === "development"
    ? `${window.location.origin}/callback/`
    : "https://pixelrena.github.io/Play-This-Next-React"
