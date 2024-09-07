const app = require("./app");
// const config = require("./config/config");

// const port = config.port || 3000;

const server = app.listen(process.env.PORT, process.env.ADDRESS, () =>
  console.log(`API is listening on ${server.address().address}:${server.address().port}.`)
);
