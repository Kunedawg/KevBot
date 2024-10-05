const knex = require("../db/connection");

exports.getPlaylists = async (options = {}) => {
  const { name, include_deleted = false } = options;
  try {
    const query = knex("playlists");
    if (name) {
      query.andWhere("name", name);
    }
    if (!include_deleted) {
      query.andWhere("deleted_at", null);
    }
    const fields = include_deleted ? ["*"] : ["id", "name", "created_at", "user_id", "updated_at"];
    return await query.select(fields);
  } catch (error) {
    throw error;
  }
};

exports.getPlaylistById = async (id) => {
  try {
    return await knex("playlists").where("id", id).first();
  } catch (error) {
    throw error;
  }
};

exports.patchPlaylist = async (id, name) => {
  try {
    await knex("playlists").where("id", id).update({ name: name });
    return await this.getPlaylistById(id);
  } catch (error) {
    throw error;
  }
};

exports.deletePlaylist = async (id) => {
  try {
    await knex("playlists").where("id", id).andWhere("deleted_at", null).update({ deleted_at: knex.fn.now() });
    return await this.getPlaylistById(id);
  } catch (error) {
    throw error;
  }
};

exports.restorePlaylist = async (id) => {
  try {
    await knex("playlists").where("id", id).whereNotNull("deleted_at").update({ deleted_at: null });
    return await this.getPlaylistById(id);
  } catch (error) {
    throw error;
  }
};

exports.postPlaylist = async (name, user_id) => {
  if (!name || !user_id) {
    throw new Error("invalid args");
  }

  const trx = await knex.transaction();
  try {
    const [id] = await trx("playlists").insert({ name: name, user_id: user_id });
    const playlist = await trx("playlists").where("id", id).first();
    await trx.commit();
    return playlist;
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during postPlaylist operation:", error);
    throw error;
  }
};
