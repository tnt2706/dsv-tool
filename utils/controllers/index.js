const commonUtils = require('./commonUtils');
const covertToExcel = require('./convertToExcel');

module.exports = {
  ...covertToExcel,
  ...commonUtils,
};
