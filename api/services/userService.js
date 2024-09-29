const knex = require("../db/connection");

const PUBLIC_USER_FIELDS = ["id", "discord_id", "discord_username", "username", "created_at", "updated_at"];

exports.postUser = async (username, passwordHash) => {
  if (!username || !passwordHash) {
    throw new Error("invalid args");
  }

  try {
    const [id] = await knex("users").insert({ username: username, password_hash: passwordHash });
    return await this.getUserById(id);
  } catch (error) {
    throw error;
  }
};

exports.patchUser = async (id, username) => {
  if (!id || !username) {
    throw new Error("invalid args");
  }

  try {
    await knex("users").where("id", id).update({ username: username });
    return await this.getUserById(id);
  } catch (error) {
    throw error;
  }
};

exports.getUsers = async (options = {}) => {
  const { username, discordId, discordUsername } = options;
  try {
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

exports.getUserById = async (id) => {
  try {
    return await knex("users").select(PUBLIC_USER_FIELDS).where("id", id).first();
  } catch (error) {
    throw error;
  }
};

exports.getUserPasswordHash = async (username) => {
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
