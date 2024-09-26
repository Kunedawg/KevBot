const bcrypt = require("bcrypt");
const userService = require("./userService");

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
