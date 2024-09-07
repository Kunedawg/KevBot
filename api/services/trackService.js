const knex = require("../db/connection");

// const knex = require("knex")({
//   client: "mysql2",
//   connection: process.env.DB_CONNECTION_STRING,
// });

exports.getAllTracks = async () => {
  try {
    return await knex("audio").select("*"); // Fetch all tracks
  } catch (error) {
    throw error;
  }
};

// exports.getTrackById = async (id) => {
//   try {
//     return await knex("tracks").where({ id }).first(); // Fetch track by ID
//   } catch (error) {
//     throw error;
//   }
// };

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
