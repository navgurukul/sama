function findLaptop(id) {
  // const laptopId = e.parameter.id;
  const laptopId = id;

  if (!laptopId) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: "Missing laptop ID" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Laptop Labeling");

  const data = sheet.getDataRange().getValues();

  const headers = data[0]; // First row as headers

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === laptopId) {  // assuming ID is in first column
      let result = {};
      
      headers.forEach((header, index) => {
        result[header] = data[i][index];
      });

      console.log(result);

      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: "Laptop not found" }))
    .setMimeType(ContentService.MimeType.JSON);
}
