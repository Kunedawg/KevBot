import { db } from "../db/connection2";

const PUBLIC_USER_FIELDS = [
  "users.id",
  "users.discord_id",
  "users.discord_username",
  "users.username",
  "users.created_at",
  "users.updated_at",
] as const;

interface UserOptions {
  username?: string;
  discordId?: string;
  discordUsername?: string;
}

export const postUser = async (username: string, passwordHash: string) => {
  const { insertId } = await db
    .insertInto("users")
    .values({ username, password_hash: passwordHash })
    .executeTakeFirst();
  return await getUserById(Number(insertId));
};

export const patchUser = async (id: number | string, username: string) => {
  await db.updateTable("users").set({ username }).where("id", "=", Number(id)).execute();
  return await getUserById(id);
};

export const putGreeting = async (
  id: number | string,
  greeting_track_id: number | null,
  greeting_playlist_id: number | null
) => {
  if (Number.isInteger(greeting_track_id) && Number.isInteger(greeting_playlist_id)) {
    throw new Error("Only a greeting track OR a playlist can be provided, not both");
  }
  await db
    .insertInto("user_greetings")
    .values({ user_id: Number(id), greeting_track_id, greeting_playlist_id })
    .onDuplicateKeyUpdate({
      greeting_track_id: greeting_track_id,
      greeting_playlist_id: greeting_playlist_id,
    })
    .execute();
  return await getGreetingByUserId(id);
};

export const putFarewell = async (
  id: number | string,
  farewell_track_id: number | null,
  farewell_playlist_id: number | null
) => {
  if (Number.isInteger(farewell_track_id) && Number.isInteger(farewell_playlist_id)) {
    throw new Error("Only a farewell track OR a playlist can be provided, not both");
  }
  await db
    .insertInto("user_farewells")
    .values({ user_id: Number(id), farewell_track_id, farewell_playlist_id })
    .onDuplicateKeyUpdate({
      farewell_track_id: farewell_track_id,
      farewell_playlist_id: farewell_playlist_id,
    })
    .execute();
  return await getFarewellByUserId(id);
};

export const getUsers = async (options: UserOptions = {}) => {
  const { username, discordId, discordUsername } = options;
  let query = db.selectFrom("users").select(PUBLIC_USER_FIELDS);
  if (username) {
    query = query.where("users.username", "=", username);
  }
  if (discordId) {
    query = query.where("users.discord_id", "=", discordId);
  }
  if (discordUsername) {
    query = query.where("users.discord_username", "=", discordUsername);
  }
  return await query.execute();
};

export const getUserById = async (id: number | string) => {
  return await db.selectFrom("users").select(PUBLIC_USER_FIELDS).where("users.id", "=", Number(id)).executeTakeFirst();
};

export const getGreetingByUserId = async (id: number | string) => {
  const greeting = await db
    .selectFrom("user_greetings")
    .select(["greeting_track_id", "greeting_playlist_id"])
    .where("user_id", "=", Number(id))
    .executeTakeFirst();
  return greeting ?? { greeting_track_id: null, greeting_playlist_id: null };
};

export const getFarewellByUserId = async (id: number | string) => {
  const farewell = await db
    .selectFrom("user_farewells")
    .select(["farewell_track_id", "farewell_playlist_id"])
    .where("user_id", "=", Number(id))
    .executeTakeFirst();
  return farewell ?? { farewell_track_id: null, farewell_playlist_id: null };
};

export const getUserPasswordHash = async (username: string) => {
  const user = await db
    .selectFrom("users")
    .select(["password_hash"])
    .where("username", "=", username)
    .executeTakeFirst();
  if (!user?.password_hash) {
    throw new Error("could not retrieve password hash");
  }
  return user.password_hash;
};
