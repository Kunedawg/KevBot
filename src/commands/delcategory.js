const gd = require("../globaldata.js");
const { Message } = require("discord.js");
const hf = require("../helperfcns.js");

module.exports = {
  name: "delcategory",
  description: "Deletes the specified category.",
  usage: "delcategory!category_name",
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

      // Get category from args and check that it is not null
      var category = args?.[0];
      if (!category) {
        return reject({ userMess: `You did not provide a category name, ya dingus!` });
      }

      // Check that category name is in the existing list of categories
      if (!gd.categoryList.includes(category)) {
        return reject({ userMess: `The category "${category}" does not exist, so it cannot be deleted!` });
      }

      // Check if category is protected
      if (gd.protectedCategoryNames.includes(category)) {
        return reject({ userMess: `The category "${category}" is restricted!` });
      }

      // Check that category is not in the dictionary (meaning there are no entries added to the category yet)
      if (Object.keys(gd.categoryDict).includes(category)) {
        return reject({
          userMess: `The category "${category}" has audio associated with it, so it cannot be deleted!`,
        });
      }

      // Check that no additional args were given
      if (args.length > 1) {
        return reject({
          userMess: `Please provide only one category at a time. Also remember spaces are not allowed in category names.`,
        });
      }

      // Check that the user originally created this category
      try {
        let queryStr = `SELECT discord_id FROM categories INNER JOIN player_info ON player_info.player_id = categories.player_id WHERE category_name = '${category}';`;
        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
        let rtnDiscordId = results[0]["discord_id"];
        if (![Number(rtnDiscordId), Number(process.env.MASTER_DISCORD_ID)].includes(Number(discordId))) {
          return reject({ userMess: `You did not create the category "${category}" so you may not delete it!` });
        }
      } catch (err) {
        return reject(err);
      }

      // Calling the delete category stored procedure
      try {
        let queryStr = `CALL del_category('${category}', @message); SELECT @message;`;
        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
        let rtnMess = results[1][0]["@message"];
        if (rtnMess === "Success") {
          hf.removeElementFromArray(gd.categoryList, category);
          return resolve({ userMess: `You have deleted the category "${category}"!` });
        } else {
          return reject({
            userMess: `Failed to delete category "${category}". Try again later or talk to Kevin.`,
            err: rtnMess,
          });
        }
      } catch (err) {
        return reject(err);
      }
    });
  },
};
