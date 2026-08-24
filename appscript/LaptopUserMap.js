function LaptopUserMap(payload) {
  // Parse payload (userId and laptopId) from request
  const { userId, laptopId } = payload;

  // Open the Google Sheet by ID
  var sheetId = '1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM';
  var spreadsheet = SpreadsheetApp.openById(sheetId);

  // Access the 'Laptop-User-Map' tab
  var mapSheet = spreadsheet.getSheetByName('Laptop-User-Map');
  
  // Get the current date
  const issuedDate = new Date();

  // Append the new row: Laptop ID, User ID, Issued Date
  mapSheet.appendRow([laptopId, userId, issuedDate]);
  
  // Return a success message
  return ContentService.createTextOutput('Data successfully saved.')
    .setMimeType(ContentService.MimeType.TEXT);
}
