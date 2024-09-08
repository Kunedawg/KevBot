const knex = require("../db/connection");
const tracksBucket = require("../storage/tracksBucket");

exports.getAllTracks = async () => {
  try {
    return await knex("audio").select("*"); // Fetch all tracks
  } catch (error) {
    throw error;
  }
};

exports.getTrackByName = async (name) => {
  try {
    return await knex("audio").where("audio_name", name).select("*"); // Fetch track by name
  } catch (error) {
    throw error;
  }
};

exports.getTrackById = async (id) => {
  try {
    return await knex("audio").where("audio_id", id).first(); // Fetch track by ID
  } catch (error) {
    throw error;
  }
};

exports.getTrackFile = async (track) => {
  try {
    const file = tracksBucket.file(`${track.audio_id}.mp3`);
    const exists = await file.exists();
    if (!exists[0]) return null;
    return file;
  } catch (error) {
    throw error;
  }
};

exports.patchTrack = async (id, name) => {
  try {
    await knex("audio").where("audio_id", id).update({ audio_name: name });
    return await this.getTrackById(id);
  } catch (error) {
    throw error;
  }
};

// exports.createTrack = async (trackData) => {
//   try {
//     return await knex("tracks").insert(trackData).returning("*"); // Insert new track
//   } catch (error) {
//     throw error;
//   }
// };

// exports.updateTrack = async (id, updateData) => {
//   try {
//     return await knex("tracks").where({ id }).update(updateData).returning("*"); // Update track
//   } catch (error) {
//     throw error;
//   }
// };

// exports.deleteTrack = async (id) => {
//   try {
//     return await knex("tracks").where({ id }).del(); // Delete track
//   } catch (error) {
//     throw error;
//   }
// };
