const { Message } = require("discord.js");
const { audioDict, categoryDict } = require("../data");
const { GREETING_TYPE } = require("../enumerations/GreetingType");

module.exports = {
  name: "setgreeting",
  description:
    "Used for updating or setting your greeting. Use delgreeting to remove greeting entirely. Type = {cat or file}",
  usage: "setgreeting!greeting type",
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {Array.<string>} methodargs.args
   */
  execute({ message, args }) {
    return new Promise(async (resolve, reject) => {
      // Get discord id and check that it is valid
      let discordId = message?.author?.id;
      if (!discordId) {
        return reject({ userMess: `Failed to retrieve discord id!` });
      }

      // Get greeting from args and check whether it is a file or a category
      let greeting = args?.[0];
      let isFile = greeting in audioDict;
      let isCategory = greeting in categoryDict;

      // Check if it is both a file and category
      let type = args?.[2];
      let greeting_type;
      if (isFile && isCategory) {
        if (!type) {
          return reject({
            userMess: `"${greeting}" is both a file and a category name. Please specify the type. For example: "setgreeting!${greeting} <type>", type = {cat or file}`,
          });
        }
        if (["file", "audio", "clip", "audioclip"].includes(type)) {
          greeting_type = GREETING_TYPE.FILE;
        } else if (["cat", "category"].includes(type)) {
          greeting_type = GREETING_TYPE.CATEGORY;
        } else {
          return reject({ userMess: `"${type}" is not a valid type. Please use "cat" or "file".` });
        }
      } else if (isFile) {
        greeting_type = GREETING_TYPE.FILE;
      } else if (isCategory) {
        greeting_type = GREETING_TYPE.CATEGORY;
      } else {
        return reject({ userMess: `"${greeting}" is not a valid greeting name. Check your spelling.` });
      }

      // Call set_greeting stored procedure
      try {
        let results = await sqlDatabase.asyncQuery(
          `CALL set_greeting('${discordId}','${greeting}', ${greeting_type}, @message); SELECT @message;`
        );
        let rtnMess = results[1][0]["@message"];
        if (rtnMess === "Success") {
          let greeting_type_string =
            greeting_type == GREETING_TYPE.FILE
              ? "file"
              : greeting_type == GREETING_TYPE.CATEGORY
              ? "category"
              : "undefined";
          return resolve({
            userMess: `Your greeting has been set to "${greeting}" with a type of ${greeting_type_string}!`,
          });
        } else {
          return reject({
            userMess: "Failed to set greeting. Try again later or talk to Kevin.",
            err: rtnMess,
          });
        }
      } catch (err) {
        return reject({
          userMess: "Failed to set greeting. Try again later or talk to Kevin.",
          err: err,
        });
      }
    });
  },
};
