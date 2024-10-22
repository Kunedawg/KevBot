// process.env.FFMPEG_PATH = require("ffmpeg-static");
// process.env.FFPROBE_PATH = require("ffprobe-static").path;
// process.env.FFPROBE_PATH = "/api/node_modules/ffprobe-static/bin/linux/x64/ffprobe";

// const os = require("os");
// console.log(process.env.npm_config_platform);
// console.log(os.platform());
// console.log(process.env.npm_config_arch);
// console.log(os.arch());

// console.log(process.env.FFMPEG_PATH);
// console.log(process.env.FFPROBE_PATH);
// const app = require("./app");
import app from "./app";
// import app from "./app.js";
// const config = require("./config/config");

// const port = config.port || 3000;

const port = Number(process.env.PORT) || 3000;
const address = process.env.ADDRESS || "0.0.0.0";

const server = app.listen(port, address, () => {
  const addr = server.address();
  if (addr === null) {
    console.error("Server address is null. The server might not be listening.");
    return;
  }
  if (typeof addr === "object") {
    console.log(`API is listening on ${addr.address}:${addr.port}.`);
    return;
  }
  console.log(`API is listening on ${addr}.`);
});
