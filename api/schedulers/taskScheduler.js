// schedulers/scheduler.js

const cron = require("node-cron");
const aggregatePlayCounts = require("../tasks/aggregatePlayCounts");

/**
 * Initializes all scheduled tasks.
 */
const initTaskSchedules = () => {
  // Schedule aggregatePlayCounts to run every hour at minute 0
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

module.exports = initTaskSchedules;
