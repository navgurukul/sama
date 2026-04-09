function MonthlyReport(data) {
  try {
    // Parse the incoming JSON data
    const payload = data;

    // Open the Google Sheet by ID or name
    const sheet = SpreadsheetApp.openById("1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM").getSheetByName("Report");
    const uniqueID = Math.floor(100 + Math.random() * 9000);

    // Append the data to the sheet
    sheet.appendRow([
       // Timestamp
      uniqueID,
      payload.ngoId,
      payload.teachersTrained,
      payload.schoolVisits,
      payload.sessionsConducted,
      payload.modulesCompleted,
      payload.studentsIntentRating,
      new Date(),
    ]);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Data submitted successfully!" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Handle errors
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
