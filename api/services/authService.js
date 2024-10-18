const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { API_JWT_SECRET } = require("../config/secrets");
const { jwtTokenExpirationTime } = require("../config/config");
const userService = require("./usersService");

exports.registerUser = async (username, password) => {
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

exports.verifyPassword = async (username, password) => {
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

exports.signUser = async (user) => {
  if (!user) {
    throw new Error("invalid args");
  }
  try {
    const token = jwt.sign({ id: user.id, username: user.username }, API_JWT_SECRET, {
      expiresIn: jwtTokenExpirationTime,
    });
    return token;
  } catch (error) {
    throw error;
  }
};

exports.verifyToken = async (token) => {
  if (!token) {
    throw new Error("invalid args");
  }
  try {
    return jwt.verify(token, API_JWT_SECRET);
  } catch (error) {
    throw error;
  }
};
