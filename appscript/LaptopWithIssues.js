function UpdateLaptopComment(data) {
  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM');
  const laptopSheet = sheet.getSheetByName('Laptop Labeling');
  const auditSheet = sheet.getSheetByName('Audit for Laptops') || sheet.insertSheet('Audit for Laptops');

  const response = { success: false, message: '' };

  try {
    if (!data || !data.laptopId) {
      throw new Error("Laptop ID is required.");
    }

    const rows = laptopSheet.getDataRange().getValues();
    const headers = rows[0];

    const idCol = headers.indexOf('ID') + 1;
    const commentCol = headers.indexOf('Comment for the Issues') + 1;
    const updatedByCol = headers.indexOf('Last Updated By') + 1;
    const updatedOnCol = headers.indexOf('Last Updated On') + 1;

    if (idCol === 0 || commentCol === 0) {
      throw new Error("Required columns not found in the sheet.");
    }

    let found = false;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idCol - 1] === data.laptopId) {
        found = true;

        const oldComment = rows[i][commentCol - 1];
        const updatedBy = data.updatedBy || "System";
        const updatedOn = new Date();

        // ✅ Write "Resolved" instead of clearing the content
        laptopSheet.getRange(i + 1, commentCol).setValue("Resolved");

        if (updatedByCol > 0) laptopSheet.getRange(i + 1, updatedByCol).setValue(updatedBy);
        if (updatedOnCol > 0) laptopSheet.getRange(i + 1, updatedOnCol).setValue(updatedOn);

        // ➕ Log to Audit tab
        auditSheet.appendRow([
          data.laptopId,
          'Comment for the Issues',
          oldComment,
          'Resolved',
          updatedBy,
          Utilities.formatDate(updatedOn, Session.getScriptTimeZone(), "dd-MM-yyyy")
        ]);

        response.success = true;
        response.message = `Comment for Laptop ID ${data.laptopId} marked as Resolved`;
        break;
      }
    }

    if (!found) {
      response.message = `Laptop ID ${data.laptopId} not found`;
    }
  } catch (error) {
    response.message = `Error: ${error.message}`;
  }

  Logger.log(response);
}



// function testUpdateLaptopComment() {
//   const testData = {
//     laptopId: "SAMA-ABC-5",   // Use a valid ID from your sheet
//     updatedBy: "aman@navgurukul.org"
//   };

//   UpdateLaptopComment(testData);
// }
