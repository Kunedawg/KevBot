var gd = require("../globaldata.js");
const { Message, User } = require("discord.js");
const hf = require("../helperfcns.js");

module.exports = {
  name: "getgreeting",
  description: "Returns the current greeting you have set.",
  usage: "getgreeting!",
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {User} methodargs.user
   */
  execute({ message, user }) {
    return new Promise(async (resolve, reject) => {
      // Validate inputs. There are two ways to call this fcn:
      // Either by providing a discord message or discord user, and then the discord id can be obtained.
      var discordId = user?.id || message?.author?.id;
      if (!discordId) {
        return reject({ userMess: `Failed to retrieve discord id!` });
      }

      // Call get_greeting stored procedure
      try {
        let queryStr = `CALL get_greeting('${discordId}', @greeting, @greeting_type); SELECT @greeting, @greeting_type;`;
        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
        let greeting = results[1][0]["@greeting"];
        let greeting_type = results[1][0]["@greeting_type"];
        let greeting_type_string;
        switch (greeting_type) {
          case gd.GREETING_TYPE.FILE:
            greeting_type_string = "file";
            break;
          case gd.GREETING_TYPE.CATEGORY:
            greeting_type_string = "category";
            break;
          default:
            greeting_type_string = "undefined";
        }
        if (greeting !== null && greeting_type !== null) {
          var response = `Your current greeting is set to the ${greeting_type_string} "${greeting}"!`;
          switch (greeting_type) {
            case gd.GREETING_TYPE.FILE:
              if (!(greeting in gd.audioDict)) {
                response += `\n"${greeting}" is not a valid file name. Consider changing it.`;
              }
              break;
            case gd.GREETING_TYPE.CATEGORY:
              if (!(greeting in gd.categoryDict)) {
                response += `\n"${greeting}" is not a valid category name. Consider changing it.`;
              }
              break;
            default:
              response += "\n Your greeting_type is invalid! Talk to Kevin!!!";
          }
        } else {
          var response = "You do not have a greeting configured.";
        }
        return resolve({ greeting: greeting, greeting_type: greeting_type, userMess: response });
      } catch (err) {
        return reject({ userMess: "Failed to retrieve greeting. Try again later or talk to Kevin.", err: err });
      }
    });
  },
};
