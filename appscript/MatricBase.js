function doGet(e) {
  // Get the active spreadsheet and the first sheet
    const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Metrics Base');
  
  const data = sheet.getDataRange().getValues();

    // Initialize an object to store the output
    let output = {};

    // Loop through the data to map column A to column B
    for (let i = 1; i < data.length; i++) { // Start at 1 to skip the header row
        const key = data[i][0];
        const value = data[i][4];

        // Only add entries where both key and value are not empty
        if (key ) {
            output[key] = value;
        }
    }
    console.log(output)

    // Return the data as JSON
    return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}