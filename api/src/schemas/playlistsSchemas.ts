import { z } from "zod";
import { playlistNameValidationFactory } from "./sharedSchemas";
import { Config } from "../config/config";

export function playlistsSchemaFactory(config: Config) {
  const playlistNameValidation = playlistNameValidationFactory(config);

  const getPlaylistsQuerySchema = z
    .object({
      name: z.string().optional(),
      include_deleted: z.coerce.boolean().optional().default(false),
    })
    .strict();

  const patchPlaylistBodySchema = z
    .object({
      name: playlistNameValidation,
    })
    .strict();

  const postPlaylistBodySchema = z
    .object({
      name: playlistNameValidation,
    })
    .strict();

  const restorePlaylistBodySchema = z
    .object({
      name: playlistNameValidation.optional(),
    })
    .strict();

  const postPlaylistTracksBodySchema = z
    .object({
      track_ids: z.array(z.number().int()).min(1),
    })
    .strict();

  const deletePlaylistTracksBodySchema = z
    .object({
      track_ids: z.array(z.number().int()).min(1),
    })
    .strict();

  return {
    getPlaylistsQuerySchema,
    patchPlaylistBodySchema,
    postPlaylistBodySchema,
    restorePlaylistBodySchema,
    postPlaylistTracksBodySchema,
    deletePlaylistTracksBodySchema,
  };
}
