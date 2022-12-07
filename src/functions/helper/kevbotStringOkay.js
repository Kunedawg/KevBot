/**
 * Tests if a string is lowercase and numbers only (for validating file names)
 * @param {string} str
 */
function kevbotStringOkay(str) {
  const regex = /^[a-z\d]+$/g;
  return regex.test(str);
}

module.exports = { kevbotStringOkay };
