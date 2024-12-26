import { z } from "zod";
import { playlistNameValidationFactory } from "./sharedSchemas";
import { Config } from "../config/config";

export function playlistsSchemaFactory(config: Config) {
  const playlistNameValidation = playlistNameValidationFactory(config);

  const getPlaylistsQuerySchema = z.object({
    name: z.string().optional(),
    include_deleted: z.coerce.boolean().optional().default(false),
  });

  const patchPlaylistBodySchema = z.object({
    name: playlistNameValidation,
  });

  const postPlaylistBodySchema = z.object({
    name: playlistNameValidation,
  });

  const restorePlaylistBodySchema = z.object({
    name: playlistNameValidation.optional(),
  });

  const postPlaylistTracksBodySchema = z.object({
    track_ids: z.array(z.number().int()).min(1),
  });

  const deletePlaylistTracksBodySchema = z.object({
    track_ids: z.array(z.number().int()).min(1),
  });

  return {
    getPlaylistsQuerySchema,
    patchPlaylistBodySchema,
    postPlaylistBodySchema,
    restorePlaylistBodySchema,
    postPlaylistTracksBodySchema,
    deletePlaylistTracksBodySchema,
  };
}
