import cron from "node-cron";
import aggregatePlayCounts from "../tasks/aggregatePlayCounts";
import { checkDatabaseVersion } from "../tasks/checkDatabaseVersion";

const initTaskSchedules = async () => {
  // run on startup
  await aggregatePlayCounts();
  await checkDatabaseVersion();

  // run on schedule
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
