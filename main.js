const path = require('path');
const _ = require('lodash');

const { group } = require('console');
const { readFileXlsx, mapData, createExcelData, groupByCustomer, groupBySO, handleDeliveryAlertBySO } = require('./utils/controllers');

const dirFileRevised = path.join(__dirname, './tmp/RAW DATA.xlsx');
const dirFileAlert = path.join(__dirname, './tmp/SGN.xlsx');

async function handleRevised() {
  const readData = readFileXlsx(dirFileRevised);
  const jsonData = _.cloneDeep(readData);

  const data = groupByCustomer(jsonData);

  const aa = data['825066'];
}

async function handleCheckAlert() {
  const readData = readFileXlsx(dirFileAlert);

  const groupData = groupBySO(readData);
  const jsonData = handleDeliveryAlertBySO(groupData);

  createExcelData(['SGN'], [jsonData]);
}

async function main() {
  await Promise.all([
    // handleRevised(),
    handleCheckAlert(),
  ]);
}

// const data = [
//   0.022, 3.791, 4.584, 0.617, 0.882, 1.587, 0.882, 0.22, 0.309, 0.419,
//   0.22, 0.815, 0.088, 0.099, 9.213, 14.987, 8.86, 7.053, 9.83, 0.705,
//   1.19, 5.378, 4.32, 2.733, 3.714, 0.22, 0.187, 3.769, 3.945, 17.026,
//   1.829, 6.48, 8.045, 3.185, 3.769, 7.053, 2.766, 3.119, 25.866, 29.263,
//   3.749, 8.718, 2.855, 6.675, 20.527, 3.783, 12.291, 26.083, 25.843,
//   39.112, 31.224, 0.095,
// ];

(async () => {
  await main();
})();
