function DeleteUserDetail(payload){
  try {
    
    const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('UserDetails'); // Replace 'Sheet1' with your sheet name
    const idToDelete = payload.userId; // ID to delete should be passed in the request body

    if (!idToDelete) {
      return ContentService.createTextOutput(JSON.stringify({ error: "ID is required" })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    let rowToDelete = -1;

    // Search for the ID in the first column
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == idToDelete) { // Assuming ID is in the first column
        rowToDelete = i + 1; // Account for header row
        break;
      }
    }

    if (rowToDelete > 0) {
      sheet.deleteRow(rowToDelete);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Row deleted" })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ID not found" })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
