/**
 * Removes the element from the array
 * @param {array} array
 * @param {*} element
 */
function spliceElement(array, element) {
  const index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  }
}

module.exports = { spliceElement };
