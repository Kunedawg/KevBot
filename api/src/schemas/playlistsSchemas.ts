import { z } from "zod";
import { playlistNameValidation } from "./sharedSchemas";

export const getPlaylistsQuerySchema = z.object({
  name: z.string().optional(),
  include_deleted: z.coerce.boolean().optional().default(false),
});

export const patchPlaylistBodySchema = z.object({
  name: playlistNameValidation,
});

export const postPlaylistBodySchema = z.object({
  name: playlistNameValidation,
});

export const restorePlaylistBodySchema = z.object({
  name: playlistNameValidation.optional(),
});

export const postPlaylistTracksBodySchema = z.object({
  track_ids: z.array(z.number().int()).min(1),
});

export const deletePlaylistTracksBodySchema = z.object({
  track_ids: z.array(z.number().int()).min(1),
});
