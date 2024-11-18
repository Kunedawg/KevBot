import { db } from "../db/connection";
import * as Boom from "@hapi/boom";
import { PublicUser } from "../db/schema";
import * as tracksService from "../services/tracksService";
import * as playlistsService from "../services/playlistsService";

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

const validateUsernameIsUnique = async (username: string, excludeId?: number) => {
  let query = db.selectFrom("users").select(["username"]).where("username", "=", username);
  if (excludeId) {
    query = query.where("id", "!=", excludeId);
  }
  const user = await query.executeTakeFirst();
  if (user) {
    throw Boom.conflict("Username is already taken");
  }
};

const userPermissionCheck = (user: PublicUser, req_user_id: number) => {
  if (user.id !== req_user_id) {
    throw Boom.forbidden("You do not have permission to modify this user.");
  }
};

export const postUser = async (username: string, passwordHash: string) => {
  await validateUsernameIsUnique(username);
  const { insertId } = await db
    .insertInto("users")
    .values({ username, password_hash: passwordHash })
    .executeTakeFirst();
  return await getUserById(Number(insertId));
};

export const patchUser = async (id: number, username: string, req_user_id: number) => {
  const user = await getUserById(id);
  userPermissionCheck(user, req_user_id);
  await validateUsernameIsUnique(username, id);
  if (user.username === username) {
    return user;
  }
  await db.updateTable("users").set({ username }).where("id", "=", id).execute();
  return await getUserById(id);
};

export const putGreeting = async (
  id: number,
  greeting_track_id: number | null,
  greeting_playlist_id: number | null,
  req_user_id: number
) => {
  if (Number.isInteger(greeting_track_id) && Number.isInteger(greeting_playlist_id)) {
    throw new Error("Only a greeting track OR a playlist can be provided, not both");
  }
  const user = await getUserById(id); // ensures user exits
  userPermissionCheck(user, req_user_id);
  if (greeting_track_id) {
    await tracksService.getTrackById(greeting_track_id); // ensures track exists
  }
  if (greeting_playlist_id) {
    await playlistsService.getPlaylistById(greeting_playlist_id); // ensures playlist exists
  }
  await db
    .insertInto("user_greetings")
    .values({ user_id: id, greeting_track_id, greeting_playlist_id })
    .onDuplicateKeyUpdate({
      greeting_track_id: greeting_track_id,
      greeting_playlist_id: greeting_playlist_id,
    })
    .execute();
  return await getGreetingByUserId(id);
};

export const putFarewell = async (
  id: number,
  farewell_track_id: number | null,
  farewell_playlist_id: number | null,
  req_user_id: number
) => {
  if (Number.isInteger(farewell_track_id) && Number.isInteger(farewell_playlist_id)) {
    throw new Error("Only a farewell track OR a playlist can be provided, not both");
  }
  const user = await getUserById(id); // ensures user exits
  userPermissionCheck(user, req_user_id);
  if (farewell_track_id) {
    await tracksService.getTrackById(farewell_track_id); // ensures track exists
  }
  if (farewell_playlist_id) {
    await playlistsService.getPlaylistById(farewell_playlist_id); // ensures playlist exists
  }
  await db
    .insertInto("user_farewells")
    .values({ user_id: id, farewell_track_id, farewell_playlist_id })
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

export const getUserById = async (id: number) => {
  const user = await db.selectFrom("users").select(PUBLIC_USER_FIELDS).where("users.id", "=", id).executeTakeFirst();
  if (!user) {
    throw Boom.notFound("User not found");
  }
  return user;
};

export const getGreetingByUserId = async (id: number) => {
  const greeting = await db
    .selectFrom("user_greetings")
    .select(["greeting_track_id", "greeting_playlist_id"])
    .where("user_id", "=", id)
    .executeTakeFirst();
  return greeting ?? { greeting_track_id: null, greeting_playlist_id: null };
};

export const getFarewellByUserId = async (id: number) => {
  const farewell = await db
    .selectFrom("user_farewells")
    .select(["farewell_track_id", "farewell_playlist_id"])
    .where("user_id", "=", id)
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
    throw Boom.unauthorized("Invalid username or password");
  }
  return user.password_hash;
};
