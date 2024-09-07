const trackService = require("../services/trackService");

exports.getTracks = async (req, res, next) => {
  try {
    const tracks = await trackService.getAllTracks();
    res.status(200).json(tracks);
  } catch (error) {
    next(error);
  }
};

// exports.createTrack = async (req, res, next) => {
//   try {
//     const track = await trackService.createTrack(req.body);
//     res.status(201).json(track);
//   } catch (error) {
//     next(error);
//   }
// };
