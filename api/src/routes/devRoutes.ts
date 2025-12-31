import express from "express";
import { RequestHandler } from "express";
import { Config, Secrets } from "../config/config";
import * as Boom from "@hapi/boom";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { KevbotDb } from "../db/connection";
import { createSession, computeAccessToken } from "../services/authService";
import { daysToMs } from "../utils/utils";
import { UsersService } from "../services/usersService";

const postDevSessionBodySchema = z
  .object({
    user_id: z.number().int().positive().optional(),
    discord_id: z.string().min(1).optional(),
  })
  .strict()
  .refine((data) => Object.values(data).filter((v) => v !== undefined).length === 1, {
    message: "Provide exactly one of user_id or discord_id",
    path: ["user_id || discord_id"],
  });

const postDevUsersBodySchema = z
  .object({
    discord_id: z.string().min(1),
    discord_username: z.string().min(1).optional(),
    discord_avatar_hash: z.string().min(1).optional(),
  })
  .strict();

// TODO: Not a fan having db as an argument here, since it does not manage a database table directly.
export function devRoutesFactory(config: Config, secrets: Secrets, db: KevbotDb, usersService: UsersService) {
  const requireDev: RequestHandler = (req, _res, next) => {
    if (!config.devRoutesEnabled) {
      throw Boom.forbidden("Only available when dev routes are enabled");
    }
    if (!secrets.DEV_AUTH_SECRET) {
      throw Boom.internal("DEV_AUTH_SECRET is not configured");
    }
    if (req.header(config.devAuthHeader) !== secrets.DEV_AUTH_SECRET) {
      throw Boom.unauthorized("Invalid dev auth secret");
    }
    next();
  };

  const router = express.Router();
  router.use(requireDev);

  router.post("/users", async (req, res) => {
    const parsedBody = postDevUsersBodySchema.parse(req.body);
    const user = await usersService.postUser(parsedBody);
    res.status(StatusCodes.CREATED).json(user);
  });

  router.post("/sessions", async (req, res) => {
    const { user_id, discord_id } = postDevSessionBodySchema.parse(req.body);

    const userIdForToken = await (async () => {
      if (user_id) {
        return (await usersService.getUserById(user_id)).id;
      }
      if (discord_id) {
        return (await usersService.getUserByDiscordId(discord_id)).id;
      }
      throw Boom.badRequest("User not found");
    })();

    const session = await createSession(db, config, userIdForToken, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
    const tokenBundle = computeAccessToken(config, secrets, "user", userIdForToken, session.id);

    res
      .cookie(config.authRefreshCookieName, session.id, {
        httpOnly: true,
        secure: config.secureCookies,
        sameSite: "lax",
        path: config.authRefreshCookiePath,
        maxAge: daysToMs(config.authRefreshTokenTtlDays),
        expires: session.expiresAt,
      })
      .status(StatusCodes.CREATED)
      .json({
        access_token: tokenBundle.accessToken,
        token_type: "Bearer",
        expires_in: tokenBundle.expiresIn,
        user: { id: userIdForToken },
      });
  });

  return router;
}
