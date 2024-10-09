const { z } = require("zod");
const playsService = require("../services/playsService");
const playlistService = require("../services/playlistService");
const trackService = require("../services/trackService");

const logTracksPlayBodySchema = z.object({
  track_id: z.number().int(),
  play_type: z.union([
    z.literal(playsService.PLAY_TYPE.PLAY),
    z.literal(playsService.PLAY_TYPE.PLAY_RANDOM),
    z.literal(playsService.PLAY_TYPE.GREETING),
    z.literal(playsService.PLAY_TYPE.RAID),
    z.literal(playsService.PLAY_TYPE.FAREWELL),
    z.literal(playsService.PLAY_TYPE.CATEGORY_GREETING),
  ]),
});

exports.logTracksPlay = async (req, res, next) => {
  try {
    const result = logTracksPlayBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { track_id, play_type } = result.data;

    const track = await trackService.getTrackById(track_id);
    if (!track) {
      return res.status(400).json({ error: "Track not found" });
    }

    const response = await playsService.logTracksPlay(track_id, play_type, { user_id: req.user?.id });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const logRandomPlaylistsPlayBodySchema = z.object({
  playlist_id: z.number().int(),
});

exports.logRandomPlaylistsPlay = async (req, res, next) => {
  try {
    const result = logRandomPlaylistsPlayBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { playlist_id } = result.data;

    const playlist = await playlistService.getPlaylistById(playlist_id);
    if (!playlist) {
      return res.status(400).json({ error: "Playlist not found" });
    }

    const response = await playsService.logRandomPlaylistPlay(playlist_id, { user_id: req.user?.id });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
