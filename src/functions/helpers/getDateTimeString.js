// For nice formatting of a date time string
/**
 * @param {Date} date
 */
function getDateTimeString(date) {
  if (date instanceof Date) {
    let year = String(date.getUTCFullYear());
    let day = String(date.getUTCDate());
    let month = String(date.getUTCMonth());
    let hour = String(date.getUTCHours());
    let min = String(date.getUTCMinutes());
    let sec = String(date.getUTCSeconds());
    let pad = (str) => {
      if (str.length === 1) {
        return `0${str}`;
      } else {
        return `${str}`;
      }
    };
    return `${pad(year)}-${pad(month)}-${day} ${pad(hour)}:${pad(min)}:${pad(sec)} (UTC)`;
  } else if (typeof date === "string") {
    return date + " (UTC)";
  }
}

module.exports = { getDateTimeString };
