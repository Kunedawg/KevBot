import app from "./app";
import initTaskSchedules from "./schedulers/taskScheduler";

const port = Number(process.env.PORT) || 3000;
const address = process.env.ADDRESS || "0.0.0.0";

async function startServer() {
  try {
    await initTaskSchedules(); // Ensure tasks are initialized before starting the server
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
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with an error code if initialization fails
  }
}

startServer();
