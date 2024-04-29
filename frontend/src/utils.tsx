export const generateDirectoryURL = (name) =>
  `https://twitch.tv/directory/category/${name
    .replace(/[:()]/g, "")
    .replaceAll(/\s/g, "-")
    .toLowerCase()}`
