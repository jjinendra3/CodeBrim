const Rollbar = require("rollbar");
const dotenv = require("dotenv");
dotenv.config();

export const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});
