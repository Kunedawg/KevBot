import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import secrets from "../config/secrets";
import config from "../config/config";
// import userService from "./usersService";
const userService = require("./usersService");
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

export default {
  registerUser,
  verifyPassword,
  signUser,
  verifyToken,
};

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { API_JWT_SECRET } = require("../config/secrets");
// const { jwtTokenExpirationTime } = require("../config/config");
// const userService = require("./usersService");

// exports.registerUser = async (username, password) => {
//   if (!username || !password) {
//     throw new Error("invalid args");
//   }
//   try {
//     const saltRounds = 12;
//     const passwordHash = await bcrypt.hash(password, saltRounds);
//     return await userService.postUser(username, passwordHash);
//   } catch (error) {
//     throw error;
//   }
// };

// exports.verifyPassword = async (username, password) => {
//   if (!username || !password) {
//     throw new Error("invalid args");
//   }
//   try {
//     const passwordHash = await userService.getUserPasswordHash(username);
//     if (!passwordHash) {
//       throw new Error("password hash does not exist");
//     }
//     return await bcrypt.compare(password, passwordHash);
//   } catch (error) {
//     throw error;
//   }
// };

// exports.signUser = async (user) => {
//   if (!user) {
//     throw new Error("invalid args");
//   }
//   try {
//     const token = jwt.sign({ id: user.id, username: user.username }, API_JWT_SECRET, {
//       expiresIn: jwtTokenExpirationTime,
//     });
//     return token;
//   } catch (error) {
//     throw error;
//   }
// };

// exports.verifyToken = async (token) => {
//   if (!token) {
//     throw new Error("invalid args");
//   }
//   try {
//     return jwt.verify(token, API_JWT_SECRET);
//   } catch (error) {
//     throw error;
//   }
// };
