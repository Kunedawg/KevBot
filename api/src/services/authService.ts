import bcrypt from "bcrypt";
import jwt, { TokenExpiredError, NotBeforeError, JsonWebTokenError } from "jsonwebtoken";
import secrets from "../config/secrets";
import config from "../config/config";
import * as userService from "./usersService";
import { User } from "../models/User";
import * as Boom from "@hapi/boom";

export const registerUser = async (username: string, password: string) => {
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  return await userService.postUser(username, passwordHash);
};

export const verifyPassword = async (username: string, password: string): Promise<User> => {
  const passwordHash = await userService.getUserPasswordHash(username);
  const passwordIsValid = await bcrypt.compare(password, passwordHash);
  if (!passwordIsValid) {
    throw Boom.unauthorized("Invalid username or password");
  }
  const users = await userService.getUsers({ username });
  if (users.length > 1) {
    throw Boom.internal("Non-unique username was found");
  }
  const user = users[0];
  if (!user?.username) {
    throw Boom.internal("Null or undefined username should not be possible here");
  }
  return { id: user.id, username: user.username };
};

export const signUser = async (user: User) => {
  const token = jwt.sign({ id: user.id, username: user.username }, secrets.API_JWT_SECRET, {
    expiresIn: config.jwtTokenExpirationTime,
  });
  return token;
};

function isUserPayload(payload: any): payload is User {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.id === "number" &&
    typeof payload.username === "string"
  );
}

function isJwtError(err: unknown): err is JsonWebTokenError {
  return err instanceof JsonWebTokenError || err instanceof TokenExpiredError || err instanceof NotBeforeError;
}

export const verifyToken = async (token: string) => {
  let decoded;
  try {
    decoded = jwt.verify(token, secrets.API_JWT_SECRET);
  } catch (err) {
    if (isJwtError(err)) {
      throw Boom.unauthorized(err.message);
    }
    throw Boom.unauthorized();
  }
  if (!isUserPayload(decoded)) {
    throw Boom.unauthorized("Token payload is invalid");
  }
  return decoded;
};
