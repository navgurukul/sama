function Audit(e) {
  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM')
    .getSheetByName('Audit for Laptops');

  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0];
  const allRows = [];

  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    const rowObject = {};
    for (let j = 0; j < headers.length; j++) {
      // Format dates consistently
      if (headers[j] === "Updated On" && row[j] instanceof Date) {
        const date = row[j];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        rowObject[headers[j]] = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
      } else {
        rowObject[headers[j]] = row[j];
      }
    }
    allRows.push(rowObject);
  }

  return ContentService.createTextOutput(JSON.stringify(allRows))
    .setMimeType(ContentService.MimeType.JSON);
}