function UserDetailsGetRequest(e) {
  // Access the Google Sheet by ID and specify the sheet name
  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('UserDetails');
  const data = sheet.getDataRange().getValues();

  // Get the query parameter for ID
  const userIdQuery = e.parameter.userIdQuery || '';

  // Convert the sheet data into an array of objects
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    let obj = {};
    row.forEach((value, index) => {
      obj[headers[index]] = value;
    });
    return obj;
  });

  // If no userIdQuery is provided, return all data
  if (!userIdQuery) {
    return ContentService.createTextOutput(JSON.stringify(rows))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  // Filter rows based on exact ID match
  const filteredRows = rows.filter(row => row.ID && row.ID.toString() === userIdQuery);

  // Return only the filtered data in JSON format
  return ContentService.createTextOutput(JSON.stringify(filteredRows))
                       .setMimeType(ContentService.MimeType.JSON);
}
