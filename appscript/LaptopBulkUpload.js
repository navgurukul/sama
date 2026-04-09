function BulkUploadHandler(data) {
  var jsonOutput;

  if (data && data.length > 0) {
    const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Laptop Labeling');
    
    if (!sheet) {
      throw new Error("Sheet not found.");
    }
    
    const lastRow = sheet.getLastRow();
    let startId = 1; // Default ID if no rows exist
    
    // Fetch last ID from column A if rows exist
    if (lastRow > 1) { 
      startId=lastRow+1
    }

    // Format the current date as DD-MM-YYYY
    const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss');

    // Get the headers from the sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Iterate over the JSON data and append rows
    data.forEach(function(row, index) {
      let newId = row["ID"]; // Check if ID is provided in the data

      // Use provided ID if available; only generate a new ID if not provided or invalid
      if (!newId || typeof newId !== 'string' && typeof newId !== 'number') {
        const donorCompany = row["Donor Company Name"] || row.donorCompanyName; 
        const donorCompanyCode = donorCompany.substring(0, 3).toUpperCase(); 
        newId = `SAMA-${donorCompanyCode}-${startId + index}`; // Generate ID in the format SAMA-[donorCompanyName]-[id]
      }

      const newRow = headers.map(function(header) {
        if (header == 'ID') return newId; // Use provided or generated ID
        if (header == 'Date') return currentDate; // Set date for bulk entries
        if (header == "Status") return row["Status"] || "Pickup Requested";
        if (header == "Working") return row["Working"] || "";
        if (header == "Battery Capacity") return row["Battery Capacity"] ? row["Battery Capacity"].toString() + "%" : "";
        if (header == "Batch") return row["Batch"] || "";

        
        return row[header] || '';  // Use an empty string if the column data is missing
      });

      // Append the new row to the sheet
      sheet.appendRow(newRow);
      const historySheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Audit for Laptops');
      historySheet.appendRow([
        newId,
        "Status",
        "-",
        row["Status"] || "Pickup Requested",
        "bulkUpload@script",
        currentDate
      ]);

      SpreadsheetApp.flush(); // Flush after each row to ensure data consistency
    });

    // Ensure all pending operations are completed
    SpreadsheetApp.flush();

    // Create response with CORS headers
    jsonOutput = ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data added successfully' }));
  } else {
    jsonOutput = ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No data received or data is empty' }));
  }

  return jsonOutput
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}



