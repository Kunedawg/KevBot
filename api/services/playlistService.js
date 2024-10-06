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

exports.getPlaylistTracks = async (id) => {
  try {
    const playlist = await knex("playlists").where("id", id).first();
    if (!playlist) {
      return null;
    }
    const tracks = await knex("tracks")
      .select("tracks.*")
      .join("playlist_tracks", "tracks.id", "=", "playlist_tracks.track_id")
      .where("playlist_tracks.playlist_id", id)
      .andWhere("tracks.deleted_at", null);
    return tracks;
  } catch (error) {
    throw error;
  }
};

exports.postPlaylistTracks = async (id, track_ids, user_id) => {
  if (!id || !track_ids || !user_id) {
    throw new Error("invalid args");
  }

  const trx = await knex.transaction();
  try {
    const playlist = await trx("playlists").where({ id }).first();
    if (!playlist) {
      throw { status: 404, message: "Playlist not found." };
    }

    const validTrackIds = await trx("tracks").whereIn("id", track_ids).pluck("id");
    const invalidTrackIds = track_ids.filter((id) => !validTrackIds.includes(id));
    if (invalidTrackIds > 0) {
      throw { status: 400, message: "invalid track ids" };
    }

    const inPlaylistTrackIds = await trx("playlist_tracks")
      .where({ playlist_id: id })
      .whereIn("track_id", validTrackIds)
      .pluck("track_id");
    const notInPlaylistTrackIds = validTrackIds.filter((id) => !inPlaylistTrackIds.includes(id));

    const rowsToInsert = notInPlaylistTrackIds.map((track_id) => ({
      track_id,
      playlist_id: id,
      user_id,
    }));
    if (rowsToInsert.length > 0) {
      await trx("playlist_tracks").insert(rowsToInsert);
    }
    await trx.commit();
    return {
      message: "Tracks added successfully to the playlist.",
      playlist_id: id,
      added_track_ids: track_ids,
    };
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during postPlaylistTracks operation:", error);
    throw error;
  }
};

exports.deletePlaylistTracks = async (id, track_ids, user_id) => {
  if (!id || !track_ids || !user_id) {
    throw new Error("invalid args");
  }

  const trx = await knex.transaction();
  try {
    const playlist = await trx("playlists").where({ id, user_id }).first();
    if (!playlist) {
      throw { status: 404, message: "Playlist not found or access denied." };
    }

    const validTrackIds = await trx("tracks").whereIn("id", track_ids).pluck("id");
    const invalidTrackIds = track_ids.filter((id) => !validTrackIds.includes(id));
    const inPlaylistTrackIds = await trx("playlist_tracks")
      .where({ playlist_id: id })
      .whereIn("track_id", validTrackIds)
      .pluck("track_id");
    const notInPlaylistTrackIds = validTrackIds.filter((id) => !inPlaylistTrackIds.includes(id));

    if (inPlaylistTrackIds.length > 0) {
      await trx("playlist_tracks").where({ playlist_id: id }).whereIn("track_id", inPlaylistTrackIds).del();
    }

    await trx.commit();
    return {
      message: "Playlist track deletion complete.",
      deleted_track_ids: inPlaylistTrackIds,
      not_in_playlist_track_ids: notInPlaylistTrackIds,
      invalid_track_ids: invalidTrackIds,
    };
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during deletePlaylistTracks operation:", error);
    throw error;
  }
};
