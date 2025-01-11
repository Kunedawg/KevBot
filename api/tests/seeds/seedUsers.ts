import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";

export async function seedUsers(db: Kysely<Database>) {
  await db
    .insertInto("users")
    .values([
      {
        id: 1,
        discord_id: "123711472041781240",
        discord_username: "mr_anderson",
        created_at: new Date("2024-11-11T07:21:03.000Z"),
        updated_at: new Date("2024-11-11T07:21:03.000Z"),
        username: "mr_anderson",
        password_hash: "$2b$12$AqiikxuNowwgcVvHxJOq5u0w5fqc9etBoJO5NjegzUoFtSyQOFeO.",
      },
      {
        id: 1337,
        discord_id: "135319472041781248",
        discord_username: "discord_seed_user",
        created_at: new Date("2024-12-07T04:29:04.000Z"),
        updated_at: new Date("2024-12-07T04:29:04.000Z"),
        username: null,
        password_hash: null,
      },
    ])
    .execute();
}

export const user_login = { username: "mr_anderson", password: "Testpw1!" };
