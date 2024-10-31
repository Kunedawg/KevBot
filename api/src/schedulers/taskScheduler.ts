import cron from "node-cron";
const aggregatePlayCounts = require("../tasks/aggregatePlayCounts");

const initTaskSchedules = () => {
  aggregatePlayCounts(); // run on startup
  cron.schedule(
    "0 * * * *",
    () => {
      aggregatePlayCounts();
    },
    {
      timezone: "UTC",
    }
  );

  console.log("Scheduled play count aggregation to run every hour.");
};

export default initTaskSchedules;
