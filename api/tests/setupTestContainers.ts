import { Network, GenericContainer, StartedTestContainer, Wait, StartedNetwork } from "testcontainers";
import path from "path";

let mysqlContainer: StartedTestContainer;
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
  const mysql = {
    ROOT_USER: "root",
    ROOT_PASSWORD: "1",
    DATABASE: "test_db",
    TCP_PORT: "25060",
    host: "placeholder",
    mappedPort: "placeholder",
    dockerIpAddr: "placeholder",
  };

  network = await new Network().start();

  const MYSQL_TCP_PORT = 25060;
  mysqlContainer = await new GenericContainer("mysql:8.0.30")
    .withNetwork(network)
    .withEnvironment({
      MYSQL_ROOT_USER: mysql.ROOT_USER,
      MYSQL_ROOT_PASSWORD: mysql.ROOT_PASSWORD,
      MYSQL_DATABASE: mysql.DATABASE,
      MYSQL_TCP_PORT: String(MYSQL_TCP_PORT),
    })
    .withExposedPorts(MYSQL_TCP_PORT)
    .start();

  mysql.host = mysqlContainer.getHost();
  mysql.mappedPort = mysqlContainer.getMappedPort(MYSQL_TCP_PORT).toString();
  mysql.dockerIpAddr = mysqlContainer.getIpAddress(network.getName());
  const factory = (addrPort: string) =>
    `mysql://${mysql.ROOT_USER}:${mysql.ROOT_PASSWORD}@${addrPort}/${mysql.DATABASE}`;
  process.env.DB_CONNECTION_STRING = factory(`${mysql.host}:${mysql.mappedPort}`);
  const migration_db_connection_string = factory(`${mysql.dockerIpAddr}:${mysql.TCP_PORT}`);

  await runMigrationManager(migration_db_connection_string);
}, 60000);

afterAll(async () => {
  await mysqlContainer.stop();
});
