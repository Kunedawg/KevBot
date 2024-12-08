import { Network, GenericContainer, StartedTestContainer, Wait, StartedNetwork } from "testcontainers";
import path from "path";

let mysqlContainer: StartedTestContainer;
let gcsContainer: StartedTestContainer;
let network: StartedNetwork;

const runMigrationManager = async (db_connection_string: string) => {
  const migrationDir = path.resolve(__dirname, "../../db/migration");
  await new GenericContainer("migration-manager:latest")
    .withNetwork(network)
    .withStartupTimeout(120_000)
    .withEnvironment({ DB_CONNECTION_STRING: db_connection_string })
    .withCopyDirectoriesToContainer([
      { source: `${migrationDir}/migrations`, target: "/app/migration/migrations" },
      { source: `${migrationDir}/baseline`, target: "/app/migration/baseline" },
    ])
    .withCommand(["migrate", "migration"])
    .withWaitStrategy(Wait.forLogMessage("Database migration complete! None --> 2.10.0"))
    .withWaitStrategy(Wait.forOneShotStartup())
    .start();
};

beforeAll(async () => {
  network = await new Network().start();

  const MYSQL_TCP_PORT = 25060;
  mysqlContainer = await new GenericContainer("mysql:8.0.30")
    .withNetwork(network)
    .withEnvironment({
      MYSQL_ROOT_USER: "root",
      MYSQL_ROOT_PASSWORD: "1",
      MYSQL_DATABASE: "test_db",
      MYSQL_TCP_PORT: String(MYSQL_TCP_PORT),
    })
    .withExposedPorts(MYSQL_TCP_PORT)
    .start();

  const GCS_PORT = 4443;
  gcsContainer = await new GenericContainer("fsouza/fake-gcs-server")
    .withNetwork(network)
    .withExposedPorts(GCS_PORT)
    .withCommand(["-scheme", "http", "-filesystem-root", "/data"])
    .start();

  process.env.TEST_DB_HOST = mysqlContainer.getHost();
  process.env.TEST_DB_PORT = mysqlContainer.getMappedPort(MYSQL_TCP_PORT).toString();
  process.env.TEST_GCS_URL = `http://${gcsContainer.getHost()}:${gcsContainer.getMappedPort(GCS_PORT)}`;
  process.env.DB_CONNECTION_STRING = `mysql://root:1@${process.env.TEST_DB_HOST}:${process.env.TEST_DB_PORT}/test_db`;
  const migration_db_connection_string = `mysql://root:1@${mysqlContainer.getIpAddress(
    network.getName()
  )}:${MYSQL_TCP_PORT}/test_db`;

  await runMigrationManager(migration_db_connection_string);
}, 60000);

afterAll(async () => {
  await mysqlContainer.stop();
  await gcsContainer.stop();
});
