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

// exports.postTrack = async (filepath, name) => {
//   let track;
//   try {
//     track = await knex("audio").insert({ audio_name: name }).returning("*");
//   } catch (error) {
//     console.log("Failed to insert track into database:", error);
//     throw error;
//   }

//   try {
//     await tracksBucket.upload(filepath, {
//       destination: `${track.audio_id}.mp3`,
//       resumable: false,
//       metadata: {
//         contentType: "audio/mpeg",
//       },
//     });
//   } catch (error) {
//     console.log("Failed to upload file to storage bucket:", error);
//     throw error;
//   }

//   return track;
// };

exports.postTrack = async (filepath, name, duration, user_id) => {
  if (!filepath || !name || !duration || !user_id) {
    throw new Error("invalid args");
  }

  const trx = await knex.transaction();
  try {
    const [id] = await trx("audio").insert({ audio_name: name, duration: duration, player_id: user_id });
    const track = await trx("audio").where("audio_id", id).first();
    await tracksBucket.upload(filepath, {
      destination: `${track.audio_id}.mp3`, // Use the track ID for the filename in the bucket
      resumable: false,
      metadata: {
        contentType: "audio/mpeg", // Set the correct content type for MP3
      },
    });
    await trx.commit();
    return track;
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during postTrack operation:", error);
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
