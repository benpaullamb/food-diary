const { DateTime } = require('luxon');

module.exports = ({ date: isoDate, id }) => {
  const date = DateTime.fromISO(isoDate);
  return `food-diary-${date.toFormat('dd-LL-yy')}-${id}.txt`;
};
