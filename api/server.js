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
const app = require("./app");
// const config = require("./config/config");

// const port = config.port || 3000;

const server = app.listen(process.env.PORT, process.env.ADDRESS, () =>
  console.log(`API is listening on ${server.address().address}:${server.address().port}.`)
);
