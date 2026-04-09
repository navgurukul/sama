function HandleUserDetailsBulkUpload(data) {

  var jsonOutput;

  if (data && data.length > 0) {
    const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('UserDetails');
    
    if (!sheet) {
      throw new Error("Sheet not found.");
    }

    // Get the highest existing ID from the sheet
    const lastRow = sheet.getLastRow();
    let startId = 1; // Default ID if no rows exist
    if (lastRow > 1) { // Ensure there's data excluding header
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues(); // Exclude header
      const maxId = Math.max(...ids.map(row => row[0]));
      startId = maxId + 1;
    }

    // Format the current date as DD-MM-YYYY
    const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy');

    // Get the headers from the sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Iterate over the JSON data and append rows
    data.forEach(function(row, index) {
      const newRow = headers.map(function(header) {
        if (header === 'ID') return startId + index; // Set ID for bulk entries
        if (header === 'Date') return currentDate; // Set date for bulk entries
        if (header === 'Ngo') return row['Ngo'] || ''; 
        return row[header] || '';  // Use an empty string if the column data is missing
      });
      sheet.appendRow(newRow);
    });

    // Create response with CORS headers
    jsonOutput = ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data added successfully' }));
  } else {
    jsonOutput = ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No data received or data is empty' }));
  }

  // Set appropriate CORS headers to handle the request
  return jsonOutput
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
