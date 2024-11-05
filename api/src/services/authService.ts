import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import secrets from "../config/secrets";
import config from "../config/config";
import * as userService from "./usersService";
import { User } from "../models/User";

export const registerUser = async (username: string, password: string) => {
  if (!username || !password) {
    throw new Error("invalid args");
  }
  try {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    return await userService.postUser(username, passwordHash);
  } catch (error) {
    throw error;
  }
};

export const verifyPassword = async (username: string, password: string) => {
  if (!username || !password) {
    throw new Error("invalid args");
  }
  try {
    const passwordHash = await userService.getUserPasswordHash(username);
    if (!passwordHash) {
      throw new Error("password hash does not exist");
    }
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    throw error;
  }
};

export const signUser = async (user: User): Promise<string> => {
  if (!user) {
    throw new Error("invalid args");
  }
  try {
    const token = jwt.sign({ id: user.id, username: user.username }, secrets.API_JWT_SECRET, {
      expiresIn: config.jwtTokenExpirationTime,
    });
    return token;
  } catch (error) {
    throw error;
  }
};

function isUserPayload(payload: any): payload is User {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.id === "number" &&
    typeof payload.username === "string"
  );
}

export const verifyToken = async (token: string): Promise<User> => {
  if (!token) {
    throw new Error("invalid args");
  }
  try {
    const decoded = jwt.verify(token, secrets.API_JWT_SECRET);
    if (isUserPayload(decoded)) {
      return decoded;
    } else {
      throw new Error("Token payload is invalid");
    }
  } catch (error) {
    throw error;
  }
};
