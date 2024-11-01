const knex = require("../db/connection");

const PUBLIC_USER_FIELDS = [
  "users.id",
  "users.discord_id",
  "users.discord_username",
  "users.username",
  "users.created_at",
  "users.updated_at",
];

interface UserOptions {
  username?: string;
  discordId?: string;
  discordUsername?: string;
}

interface Greeting {
  greeting_track_id: number | null;
  greeting_playlist_id: number | null;
}

interface Farewell {
  farewell_track_id: number | null;
  farewell_playlist_id: number | null;
}

export const postUser = async (username: string, passwordHash: string) => {
  if (!username || !passwordHash) {
    throw new Error("invalid args");
  }

  try {
    const [id] = await knex("users").insert({ username, password_hash: passwordHash });
    return await getUserById(id);
  } catch (error) {
    throw error;
  }
};

export const patchUser = async (id: number | string, username: string) => {
  if (!id || !username) {
    throw new Error("invalid args");
  }

  try {
    await knex("users").where("id", id).update({ username });
    return await getUserById(id);
  } catch (error) {
    throw error;
  }
};

export const putGreeting = async (
  id: number | string,
  greeting_track_id: number | null,
  greeting_playlist_id: number | null
) => {
  const trx = await knex.transaction();
  try {
    if (!(Number.isInteger(greeting_track_id) || greeting_track_id === null)) {
      throw new Error("greeting_track_id is an invalid type");
    }
    if (!(Number.isInteger(greeting_playlist_id) || greeting_playlist_id === null)) {
      throw new Error("greeting_playlist_id is an invalid type");
    }
    if (Number.isInteger(greeting_track_id) && Number.isInteger(greeting_playlist_id)) {
      throw new Error("Only a greeting track OR a playlist can be provided, not both");
    }

    await trx("user_greetings")
      .insert({ user_id: id, greeting_track_id, greeting_playlist_id })
      .onConflict("user_id")
      .merge();
    await trx.commit();
    return await getGreetingByUserId(id);
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const putFarewell = async (
  id: number | string,
  farewell_track_id: number | null,
  farewell_playlist_id: number | null
) => {
  const trx = await knex.transaction();
  try {
    if (!(Number.isInteger(farewell_track_id) || farewell_track_id === null)) {
      throw new Error("farewell_track_id is an invalid type");
    }
    if (!(Number.isInteger(farewell_playlist_id) || farewell_playlist_id === null)) {
      throw new Error("farewell_playlist_id is an invalid type");
    }
    if (Number.isInteger(farewell_track_id) && Number.isInteger(farewell_playlist_id)) {
      throw new Error("Only a farewell track OR a playlist can be provided, not both");
    }

    await trx("user_farewells")
      .insert({ user_id: id, farewell_track_id, farewell_playlist_id })
      .onConflict("user_id")
      .merge();
    await trx.commit();
    return await getFarewellByUserId(id);
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const getUsers = async (options: UserOptions = {}) => {
  try {
    const { username, discordId, discordUsername } = options;
    const query = knex("users");
    if (username) {
      query.andWhere("username", username);
    }
    if (discordId) {
      query.andWhere("discord_id", discordId);
    }
    if (discordUsername) {
      query.andWhere("discord_username", discordUsername);
    }
    return await query.select(PUBLIC_USER_FIELDS);
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id: number | string) => {
  try {
    return await knex("users").select(PUBLIC_USER_FIELDS).where("id", id).first();
  } catch (error) {
    throw error;
  }
};

export const getGreetingByUserId = async (id: number | string): Promise<Greeting> => {
  try {
    return (
      (await knex("user_greetings")
        .select(["greeting_track_id", "greeting_playlist_id"])
        .where("user_id", id)
        .first()) ?? { greeting_track_id: null, greeting_playlist_id: null }
    );
  } catch (error) {
    throw error;
  }
};

export const getFarewellByUserId = async (id: number | string): Promise<Farewell> => {
  try {
    return (
      (await knex("user_farewells")
        .select(["farewell_track_id", "farewell_playlist_id"])
        .where("user_id", id)
        .first()) ?? { farewell_track_id: null, farewell_playlist_id: null }
    );
  } catch (error) {
    throw error;
  }
};

export const getUserPasswordHash = async (username: string): Promise<string> => {
  try {
    const user = await knex("users").select(["password_hash"]).where("username", username).first();
    if (!user?.password_hash) {
      throw new Error("could not retrieve password hash");
    }
    return user.password_hash;
  } catch (error) {
    throw error;
  }
};
