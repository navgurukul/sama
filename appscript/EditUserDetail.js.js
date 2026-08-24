function EditUserStatus(payload) {
  try {
    var sheetId = '1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM';
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName('UserDetails');

    if (!sheet) {
      throw new Error('Sheet not found');
    }
    var values = sheet.getDataRange().getValues();
    var updatedUserIds = []; // Array to store updated user IDs

    // Loop through each userId in the payload's id array
    payload.id.forEach(userId => {
      var row = values.findIndex(row => row[0] === userId) + 1;

      if (row === 0) {
        throw new Error(`User ID ${userId} not found`);
      }

      // Update the status in the appropriate column (e.g., column 16 for status)
      sheet.getRange(row, 17).setValue(payload.status);
      
      // If the status is "Laptop Assigned", update the "Assigned At" column with the provided timestamp
      if (payload.status === "Laptop Assigned" && payload.assignedAt) {
        var formattedDate = new Date(payload.assignedAt).toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        sheet.getRange(row, 21).setValue(formattedDate); // Assuming column 18 is for "Assigned At"
      }

      updatedUserIds.push(userId); // Add userId to the updated list
    });

    // Return output with updated user IDs and their shared status
    var output = {
      id: updatedUserIds,
      status: payload.status
    };

    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
