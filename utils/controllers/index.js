const _ = require('lodash');
const xlsx = require('xlsx');

const covertToExcel = require('./convertToExcel');

const GROUP = {
  one: { min: 66, max: 68 },
  two: { min: 56, max: 58 },
  three: { min: 26, max: 28 },
};

function readFileXlsx(dirPath) {
  const data = [];

  const file = xlsx.readFile(dirPath, { cellDates: true });
  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i += 1) {
    const temp = xlsx.utils.sheet_to_json(
      file.Sheets[file.SheetNames[i]],
    );

    temp.forEach(res => {
      data.push(res);
    });
  }

  return data;
}

function mapData(data = [], keyName) {
  const map = new Map();
  const len = data.length;

  for (let i = 0; i < len; i += 1) {
    map.set(data[keyName], data[i]);
  }

  return map;
}

/**
 *
 */
function groupByCustomer(data = []) {
  const groups = _.groupBy(data, d => d['Customer Number']);

  _.forEach(groups, (value, key) => {
    groups[key] = groupAndSort(value);
  });

  return groups;
}

function handleGroupByCondition(data = []) {

}

/**
 * Alert
 */

function groupBySO(data = []) {
  const sort = data.sort((a, b) => a.GTS_SO.localeCompare(b.GTS_SO) || b['Market Delivery Date'].localeCompare(a['Market Delivery Date']));
  const groups = _.groupBy(sort, d => d.GTS_SO);
  return groups;
}

function handleAlertDeliveryBySO(data) {
  const results = [];

  _.forEach(data, deliveries => {
    handleAlertDeliveryByGroupWeek(results, deliveries);
  });

  return results;
}

function handleAlertDeliveryByGroupWeek(results, deliveries = []) {
  if (deliveries.length === 1) {
    results.push({ ...deliveries[0], Alert: ' ' });
    return;
  }

  const groupedByMonth = _.groupBy(deliveries, item => item['Market Delivery Date'].substring(0, 7));
  _.forEach(groupedByMonth, group => checkAlertDeliveryInMonth(results, group));
}

function checkAlertDeliveryInMonth(results, groupedByMonth) {
  const groupDate = groupDates(groupedByMonth);
  _.forEach(groupDate, (value, key) => {
    if (value.length === 0) {
      delete groupDate[key];
    }
  });

  const sortGroupDate = _.chain(groupDate)
    .toPairs()
    .sort((a, b) => a.length - b.length)
    .fromPairs()
    .value();

  let index = 0;
  _.forEach(sortGroupDate, value => {
    value.forEach(v => results.push({ ...v, Alert: index === 0 ? ' ' : 'X' }));
    index += 1;
  });
}

function groupDates(date) {
  const groups = {
    '1st': [],
    '2nd': [],
    '3rd': [],
    '4th': [],
    '5th': [],
  };

  const len = date.length;

  for (let i = 0; i < len; i += 1) {
    const element = date[i];
    const { 'Market Delivery Date': deliveryDate } = element;

    const day = parseInt(deliveryDate.substring(8, 10), 10);

    if (day >= 1 && day <= 7) {
      groups['1st'].push(element);
    } else if (day >= 8 && day <= 14) {
      groups['2nd'].push(element);
    } else if (day >= 15 && day <= 21) {
      groups['3rd'].push(element);
    } else if (day >= 22 && day <= 28) {
      groups['4th'].push(element);
    } else {
      groups['5th'].push(element);
    }
  }

  return groups;
}

/**
 * utils
 */

function groupAndSort(obj) {
  const groups = _.groupBy(obj, o => o['Vendor Booking']);
  const data = [];

  _.forEach(groups, (value, key) => {
    const vol = value.reduce((accumulator, object) => accumulator + object['PREASN Article VOL'], 0);
    const article = value.reduce((accumulator, object) => accumulator + object['Total Article Carton'], 0);
    data.push({
      key,
      vol,
      article,
      shipper: value[0]['Shipper Name'],
      division: value[0]['Division Desc'],
    });
  });

  const divisionOrder = ['Footwear', 'Accessories', 'Apparel'];

  return data.sort((a, b) => divisionOrder.indexOf(a.division) - divisionOrder.indexOf(b.division)
  || a.shipper.localeCompare(b.shipper));
}

module.exports = {
  ...covertToExcel,
  readFileXlsx,
  mapData,
  groupByCustomer,
  groupBySO,
  handleGroupByCondition,
  handleAlertDeliveryBySO,
};
