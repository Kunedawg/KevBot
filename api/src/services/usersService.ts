import * as Boom from "@hapi/boom";
import { PostUserOptions, PatchUserOptions, PublicUser } from "../db/schema";
import { KevbotDb } from "../db/connection";
import { TracksService } from "./tracksService";
import { PlaylistsService } from "./playlistsService";
import { Config } from "../config/config";
import { sql } from "kysely";

const PUBLIC_USER_FIELDS = [
  "users.id",
  "users.discord_id",
  "users.discord_username",
  "users.discord_avatar_hash",
  "users.created_at",
  "users.updated_at",
] as const;

interface UserOptions {
  discord_id?: string;
  discord_username?: string;
}

// TODO: should services support injection of execution context? That was it would be easy to do complex transactions.
type UserSearchResult = {
  data: PublicUser[];
  total: number;
};

export function usersServiceFactory(
  db: KevbotDb,
  config: Config,
  tracksService: TracksService,
  playlistsService: PlaylistsService
) {
  const validateDiscordIdIsUnique = async (discordId: string) => {
    const user = await db
      .selectFrom("users")
      .select(["discord_id"])
      .where("discord_id", "=", discordId)
      .executeTakeFirst();
    if (user) {
      throw Boom.conflict("Discord ID is already taken");
    }
  };

  const userPermissionCheck = (user: PublicUser, req_user_id: number) => {
    if (user.id !== req_user_id) {
      throw Boom.forbidden("You do not have permission to modify this user.");
    }
  };

  const postUser = async (options: PostUserOptions) => {
    await validateDiscordIdIsUnique(options.discord_id);
    const { insertId } = await db.insertInto("users").values(options).executeTakeFirst();
    return await getUserById(Number(insertId));
  };

  const patchUser = async (id: number, req_user_id: number, options: PatchUserOptions) => {
    const user = await getUserById(id);
    userPermissionCheck(user, req_user_id);
    if (Object.keys(options).length === 0) {
      return user;
    }
    await db.updateTable("users").set(options).where("id", "=", id).execute();
    return await getUserById(id);
  };

  const putGreeting = async (
    id: number,
    greeting_track_id: number | null,
    greeting_playlist_id: number | null,
    req_user_id: number
  ) => {
    if (Number.isInteger(greeting_track_id) && Number.isInteger(greeting_playlist_id)) {
      throw Boom.badRequest("Only a greeting track OR a playlist can be provided, not both");
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

  const putFarewell = async (
    id: number,
    farewell_track_id: number | null,
    farewell_playlist_id: number | null,
    req_user_id: number
  ) => {
    if (Number.isInteger(farewell_track_id) && Number.isInteger(farewell_playlist_id)) {
      throw Boom.badRequest("Only a farewell track OR a playlist can be provided, not both");
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

  const getUsers = async (options: UserOptions = {}) => {
    const { discord_id, discord_username } = options;
    let query = db.selectFrom("users").select(PUBLIC_USER_FIELDS);
    if (discord_id) {
      query = query.where("users.discord_id", "=", discord_id);
    }
    if (discord_username) {
      query = query.where("users.discord_username", "=", discord_username);
    }
    return await query.execute();
  };

  const getUserById = async (id: number) => {
    const user = await db.selectFrom("users").select(PUBLIC_USER_FIELDS).where("users.id", "=", id).executeTakeFirst();
    if (!user) {
      throw Boom.notFound("User not found");
    }
    return user;
  };

  const getUserByDiscordId = async (discordId: string) => {
    const user = await db
      .selectFrom("users")
      .select(PUBLIC_USER_FIELDS)
      .where("users.discord_id", "=", discordId)
      .executeTakeFirst();
    if (!user) {
      throw Boom.notFound("User not found");
    }
    return user;
  };

  const getGreetingByUserId = async (id: number) => {
    const greeting = await db
      .selectFrom("user_greetings")
      .select(["greeting_track_id", "greeting_playlist_id"])
      .where("user_id", "=", id)
      .executeTakeFirst();
    return greeting ?? { greeting_track_id: null, greeting_playlist_id: null };
  };

  const getFarewellByUserId = async (id: number) => {
    const farewell = await db
      .selectFrom("user_farewells")
      .select(["farewell_track_id", "farewell_playlist_id"])
      .where("user_id", "=", id)
      .executeTakeFirst();
    return farewell ?? { farewell_track_id: null, farewell_playlist_id: null };
  };

  const searchUsers = async ({
    q,
    limit,
    offset = 0,
    hybridRatio = config.hybridRelevanceRatio,
  }: {
    q: string | null;
    limit: number;
    offset?: number;
    hybridRatio?: number;
  }): Promise<UserSearchResult> => {
    const trimmed = q?.trim() ?? "";

    if (!trimmed) {
      const rows = await db
        .selectFrom("users as u")
        .select([
          "u.id",
          "u.discord_id",
          "u.discord_username",
          "u.discord_avatar_hash",
          "u.created_at",
          "u.updated_at",
          sql<number>`COUNT(*) OVER ()`.as("total_rows"),
        ])
        .orderBy(sql`u.discord_username IS NULL`, "asc")
        .orderBy("u.discord_username", "asc")
        .orderBy("u.discord_id", "asc")
        .limit(limit)
        .offset(offset)
        .execute();
      const total = rows.length ? rows[0].total_rows : 0;
      return {
        data: rows.map(({ total_rows, ...rest }) => rest as PublicUser),
        total,
      };
    }

    const rows = await db
      .with("scored", (db) =>
        db
          .selectFrom("users as u")
          .select([
            "u.id",
            "u.discord_id",
            "u.discord_username",
            "u.discord_avatar_hash",
            "u.created_at",
            "u.updated_at",
            sql<number>`MATCH(u.discord_username) AGAINST (${trimmed} IN NATURAL LANGUAGE MODE)`.as("rel"),
            sql<boolean>`u.discord_username LIKE CONCAT(${trimmed}, '%')`.as("is_prefix"),
            sql<boolean>`u.discord_id LIKE CONCAT(${trimmed}, '%')`.as("is_id_prefix"),
          ])
          .where((eb) =>
            eb.or([
              sql<boolean>`u.discord_username LIKE CONCAT(${trimmed}, '%')`,
              sql<boolean>`u.discord_id LIKE CONCAT(${trimmed}, '%')`,
              sql<boolean>`MATCH(u.discord_username) AGAINST (${trimmed} IN NATURAL LANGUAGE MODE)`,
            ])
          )
      )
      .with("aug", (db) =>
        db.selectFrom("scored as s").selectAll().select(sql<number>`MAX(s.rel) OVER ()`.as("max_rel"))
      )
      .with("kept", (db) =>
        db
          .selectFrom("aug as s")
          .selectAll()
          .where((eb) =>
            eb.or([
              sql<boolean>`s.is_prefix = 1`,
              sql<boolean>`s.is_id_prefix = 1`,
              eb.and([sql<boolean>`s.rel > 0`, sql<boolean>`s.rel >= ${hybridRatio} * s.max_rel`]),
            ])
          )
      )
      .selectFrom("kept as s")
      .select([
        "s.id",
        "s.discord_id",
        "s.discord_username",
        "s.discord_avatar_hash",
        "s.created_at",
        "s.updated_at",
        sql<number>`COUNT(*) OVER ()`.as("total_rows"),
      ])
      .orderBy(sql`CASE WHEN s.is_prefix = 1 THEN 0 ELSE 1 END`, "asc")
      .orderBy(sql`CASE WHEN s.is_prefix = 1 THEN s.discord_username ELSE NULL END`, "asc")
      .orderBy(sql`CASE WHEN s.is_id_prefix = 1 THEN 0 ELSE 1 END`, "asc")
      .orderBy(sql`CASE WHEN s.is_id_prefix = 1 THEN s.discord_id ELSE NULL END`, "asc")
      .orderBy("s.rel", "desc")
      .orderBy("s.discord_username", "asc")
      .orderBy("s.discord_id", "asc")
      .limit(limit)
      .offset(offset)
      .execute();

    const total = rows.length ? rows[0].total_rows : 0;
    return {
      data: rows.map(({ total_rows, ...rest }) => rest as PublicUser),
      total,
    };
  };

  return {
    postUser,
    patchUser,
    putGreeting,
    putFarewell,
    getUsers,
    getUserById,
    getGreetingByUserId,
    getFarewellByUserId,
    getUserByDiscordId,
    searchUsers,
  };
}

export type UsersService = ReturnType<typeof usersServiceFactory>;
