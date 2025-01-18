## Requirements

- Node.js (I'm using v18.18.0)
- Npm (9.8.1 and up)

## Installation

After cloning the repository, you can install the required packages by running the following command in the root directory of the repository:

`npm i` or `npm install`

Then make sure to run the same command in the **frontend** and **server** directory.

## Configuration

Rename the `.env.test` to `.env` file in the **server** directory. You will need to have your own STEAM and RAWG api keys.

## Running the server and react-app together

You can easily run the server and react-app together by running the following command in the **root** directory of the repository:

`npm run test`

### Running the server and react-app separately

Run the server: (cd into the server directory) `npm run watch`

Run the client: (cd into the frontend directory) `npm start`

Client will be running on `http://localhost:3000/` and the server will be running on `http://localhost:3001/`.

### Important

In the server.js file, uncomment the line 15 and comment line 16 to allow the client to make requests to the server without parsing when local. Make sure to not include serve.js changes in commits.
