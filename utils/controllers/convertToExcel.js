const _ = require('lodash');
const XLSX = require('xlsx');

function addHyperlink(sheet, data, hyperlinks) {
  for (let i = 0; i < hyperlinks.length; i += 1) {
    const name = hyperlinks[i];
    let index = -1;
    let currentLine = 0;
    do {
      index = _.findIndex(Object.keys(data[currentLine]), x => x === name);
      currentLine += 1;
    } while (index < 0);

    for (let ii = 1; ii < data.length + 1; ii += 1) {
      const cell = sheet[XLSX.utils.encode_cell({
        r: ii,
        c: index,
      })];
      if (cell?.v) {
        cell.l = { Target: cell.v };
      }
    }
  }
}

function createSheet({ wb, sheetName, data, hyperlinks }) {
  const newSheet = XLSX.utils.json_to_sheet(data);

  if (hyperlinks?.length) {
    addHyperlink(newSheet, data, hyperlinks);
  }
  XLSX.utils.book_append_sheet(wb, newSheet, sheetName);
}

function createExcelData(sheetNames, jsonArray, hyperlinkArray = []) {
  const wb = XLSX.utils.book_new();
  for (let i = 0; i < sheetNames.length; i += 1) {
    if (sheetNames.length > 1) {
      logger.debug(`------ create Excel Data: [${i + 1}/${sheetNames.length}]`);
    }
    createSheet({
      wb,
      sheetName: sheetNames[i],
      data: jsonArray[i],
      hyperlinks: hyperlinkArray[i],
    });
  }

  XLSX.writeFile(wb, 'SGN Export.xlsx');

  // return XLSX.write(wb, { type: 'buffer' });
}

module.exports = {
  createExcelData,
};
