import { z } from "zod";
import config from "../config/config";

export const getPlaylistsQuerySchema = z.object({
  name: z.string().optional(),
  include_deleted: z.coerce.boolean().optional().default(false),
});

export const patchPlaylistBodySchema = z.object({
  name: config.playlistNameValidation,
});

export const postPlaylistBodySchema = z.object({
  name: config.playlistNameValidation,
});

export const restorePlaylistBodySchema = z.object({
  name: config.playlistNameValidation.optional(),
});

export const postPlaylistTracksBodySchema = z.object({
  track_ids: z.array(z.number().int()).min(1),
});

export const deletePlaylistTracksBodySchema = z.object({
  track_ids: z.array(z.number().int()).min(1),
});
