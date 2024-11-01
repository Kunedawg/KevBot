import app from "./app";

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
