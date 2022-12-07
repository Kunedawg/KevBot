/**
 * Removes the element from the array
 * @param {Object.<string, Array.<string>>} categoryDict
 * @param {string} category
 * @param {string} audio
 * @param {string} type
 *
 */
function updateCategoryDict(categoryDict, category, audio, type) {
  switch (type) {
    case "add":
      if (category in categoryDict) {
        categoryDict[category].push(audio);
      } else {
        categoryDict[category] = [audio];
      }
      break;

    case "remove":
      spliceElement(categoryDict[category], audio);
      if (categoryDict[category].length === 0) {
        delete categoryDict[category];
      }
      break;

    default:
      if (category in categoryDict) {
        categoryDict[category].push(audio);
      } else {
        categoryDict[category] = [audio];
      }
  }
}

module.exports = { updateCategoryDict };
