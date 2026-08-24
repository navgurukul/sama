// function DataPdf(data) {

//   try {

//     const laptopId = data.laptopId || "UnknownLaptop";
//     const summaryEncoded = data.summary;

//     const summaryText = Utilities.newBlob(Utilities.base64Decode(summaryEncoded)).getDataAsString();

//     const folder = DriveApp.getFolderById("1zXH0srDaAMP3BTvkB9RlZw8iI7wA3E2c"); // Your Drive folder ID
//     const fileName = laptopId + "_Inspection_Report.pdf";

//     // Create Google Doc
//     const doc = DocumentApp.create(fileName);
//     const body = doc.getBody();
//     body.appendParagraph("🛠️ Hardware Inspection Summary\n").setHeading(DocumentApp.ParagraphHeading.HEADING1);
//     body.appendParagraph(summaryText);
//     doc.saveAndClose();

//     // Convert to PDF
//     const docFile = DriveApp.getFileById(doc.getId());
//     const pdfBlob = docFile.getAs("application/pdf");
//     const pdfFile = folder.createFile(pdfBlob);
//     pdfFile.setName(fileName);

//     // Optional: Delete intermediate Google Doc
//     docFile.setTrashed(true);

//     // Make PDF public & get URL
//     pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
//     const pdfUrl = pdfFile.getUrl();

//     // Update in the correct row of the Google Sheet
//     const sheet = SpreadsheetApp.openById("1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM").getSheetByName("Laptop Labeling"); // Replace with actual sheet ID and name
//     const dataRange = sheet.getDataRange();
//     const values = dataRange.getValues();

//     let idColIndex = values[0].indexOf("ID");
//     let lastColIndex = values[0].length; // Append in the next empty column

//     let updated = false;

//     for (let i = 1; i < values.length; i++) {
//       if (values[i][idColIndex] == laptopId) {
//         sheet.getRange(i + 1, lastColIndex + 1).setValue(pdfUrl); // Write to last column
//         updated = true;
//         break;
//       }
//     }

//     if (!updated) {
//       return ContentService
//         .createTextOutput(JSON.stringify({ status: "error", message: "ID not found in sheet" }))
//         .setMimeType(ContentService.MimeType.JSON);
//     }

//     return ContentService
//       .createTextOutput(JSON.stringify({ status: "success", fileName: fileName, url: pdfUrl }))
//       .setMimeType(ContentService.MimeType.JSON);

//   } catch (err) {
//     return ContentService
//       .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
//       .setMimeType(ContentService.MimeType.JSON);
//   }
// }
// function testDataPdf() {
//   const testSummary = `
// 🛠️ Hardware Inspection Report

// ✅ Display Test: Passed
// ✅ SSD Health: PASSED | Temp: 35°C
// ✅ RAM Test: No errors detected
// ✅ Battery Health: 95% | Cycle Count: 120
// ✅ Mic: Working
// ✅ Speaker: Working
// ✅ Camera: Working
// ✅ Keyboard: All keys responsive
// ✅ Network: Connected
// `;

//   const base64Summary = Utilities.base64Encode(testSummary);

//   const mockData = {
//     laptopId: "devtesting",
//     summary: base64Summary
//   };

//   const result = DataPdf(mockData);
//   Logger.log(result.getContent()); // Logs the output of the PDF generation

// }

// -------------------------------------------------------------------------------
// function DataPdf(data) {
//   try {
//     const laptopId = data.laptopId || "UnknownLaptop";
//     const summaryText = data.summary || "No summary provided.";

//     const timestamp = new Date();
//     const formattedTime = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");
//     const fileName = `Report_${formattedTime}.pdf`;

//     // const rootFolder = DriveApp.getFolderById("1zXH0srDaAMP3BTvkB9RlZw8iI7wA3E2c");
//     let rootFolder;
//     try {
//       rootFolder = DriveApp.getFolderById("1zXH0srDaAMP3BTvkB9RlZw8iI7wA3E2c");
//       Logger.log("✅ Folder loaded: " + rootFolder.getName());
//     } catch (e) {
//       Logger.log("❌ Folder error: " + e.message);
//       throw new Error("Drive folder not accessible → " + e.message);
//     }
//     /////

//     // 🔍 Search or create folder with laptopId
//     let subFolders = rootFolder.getFoldersByName(laptopId);
//     let laptopFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder(laptopId);

//     // 📝 Create Google Doc
//     const doc = DocumentApp.create(fileName);
//     const body = doc.getBody();
//     body.appendParagraph("🛠️ Hardware Inspection Summary").setHeading(DocumentApp.ParagraphHeading.HEADING1);
//     body.appendParagraph(summaryText);
//     doc.saveAndClose();

//     // 📄 Convert to PDF
//     const docFile = DriveApp.getFileById(doc.getId());
//     const pdfBlob = docFile.getAs("application/pdf");
//     const pdfFile = laptopFolder.createFile(pdfBlob);
//     pdfFile.setName(fileName);
//     docFile.setTrashed(true); // delete original Google Doc

//     // 🌍 Make public
//     pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
//     const pdfUrl = pdfFile.getUrl();

//     // 📊 Update Sheet
//     // const sheet = SpreadsheetApp.openById("1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM")
//     //                             .getSheetByName("Laptop Labeling");
//     let sheet;
//     try {
//       sheet = SpreadsheetApp.openById("1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM")
//         .getSheetByName("Laptop Labeling");
//       Logger.log("✅ Sheet loaded: " + sheet.getName());
//     } catch (e) {
//       Logger.log("❌ Sheet error: " + e.message);
//       throw new Error("Spreadsheet not accessible → " + e.message);
//     }
//     ///
//     const dataRange = sheet.getDataRange().getValues();
//     const headers = dataRange[0];
//     const idColIndex = headers.indexOf("ID");

//     const targetColumn = 24; // Column X
//     let updated = false;

//     for (let i = 1; i < dataRange.length; i++) {
//       if (dataRange[i][idColIndex] === laptopId) {
//         const currentCell = sheet.getRange(i + 1, targetColumn);
//         const existingValue = currentCell.getValue();
//         const newValue = existingValue ? `${existingValue} , ${pdfUrl}` : pdfUrl;
//         currentCell.setValue(newValue);
//         updated = true;
//         break;
//       }
//     }

//     if (!updated) {
//       return ContentService.createTextOutput(JSON.stringify({
//         status: "error",
//         message: "Laptop ID not found in sheet."
//       })).setMimeType(ContentService.MimeType.JSON);
//     }

//     return ContentService.createTextOutput(JSON.stringify({
//       status: "success",
//       fileName: fileName,
//       url: pdfUrl
//     })).setMimeType(ContentService.MimeType.JSON);

//   } catch (err) {
//     return ContentService.createTextOutput(JSON.stringify({
//       status: "error",
//       message: err.message
//     })).setMimeType(ContentService.MimeType.JSON);
//   }
// }

// function testDataPdf() {
//   const testSummary = `
// 🛠️ Hardware Inspection Report

// ✅ Display Test: Passed
// ✅ SSD Health: PASSED | Temp: 35°C
// ✅ RAM Test: No errors detected
// ✅ Battery Health: 95% | Cycle Count: 120
// ✅ Mic: Working
// ✅ Speaker: Working
// ✅ Camera: Working
// ✅ Keyboard: All keys responsive
// ✅ Network: Connected
// `;

//   const mockData = {
//     laptopId: "newtest", // Make sure this ID exists in your Sheet under column "ID"
//     summary: testSummary
//   };

//   const result = DataPdf(mockData);
//   Logger.log(result.getContent());
// }

// ----------------------------------------------------------------------------------------------

// Fixed doPost function - make sure it returns the response
// function doPost(e) {
//   var data = JSON.parse(e.postData.contents);
//   Logger.log("doPost received: " + JSON.stringify(data));

//   if (data.type == "laptopLabeling") {
//     return LabelHandler(data);
//   } else if (data.type == "bulkupload") {
//     return BulkUploadHandler(data.data);
//   } else if(data.type == "userdetails"){
//     return HandleUserDetailsUpload(data);
//   } else if ((data.type == "userdetailsbulkupload")){
//     return HandleUserDetailsBulkUpload(data.data); 
//   } else if (data.type == "laptopusermap"){
//     return LaptopUserMap(data.data);
//   } else if (data.type == "editUser"){
//     return EditUserStatus(data);
//   } else if (data.type == "assign") {
//     StoreIdInSheetC(data);
//     UpdateStatusInSheetA(data);
//     UpdateStatusInSheetB(data);
//     return LabelHandler(data);
//   } else if (data.type == "deleteUser"){
//     return DeleteUserDetail(data);
//   } else if (data.type == "preliminary"){
//     return Preliminary(data);
//   } else if (data.type=="monthly"){
//     return MonthlyReport(data);
//   } else if (data.type=="UpdateLaptopComment"){
//     return UpdateLaptopComment(data);
//   } else if (data.type=="drivepdf"){
//     return DataPdf(data);
//   } else if (data.type=="ActivityPdf"){
//     return ActivityPdf(data);
//   } else if(data.type == "Pickup"){
//     return PickUp(data);
//   } else if (data.type == "activity"){
//     return activityTracker(data);
//   } else if (data.type == "updatepickupstatus") {
//     return UpdatePickupStatus(data);
//   } else if (data.type == "inspections") {
//     return NewLaptopInspections(data);
//   } else {
//     Logger.log("Unknown type: " + data.type);
//     return ContentService.createTextOutput(JSON.stringify({ 
//       status: "error", 
//       message: 'Invalid type provided: ' + data.type 
//     })).setMimeType(ContentService.MimeType.JSON);
//   }
// }

// Fixed DataPdf function with step-by-step error handling
function DataPdf(data) {
  try {
    Logger.log("=== DataPdf START ===");
    Logger.log("DataPdf called with: " + JSON.stringify(data));
    
    // Step 1: Validate input data
    if (!data) {
      throw new Error("No data received in DataPdf function");
    }
    
    const laptopId = data.laptopId || "UnknownLaptop";
    const summaryText = data.summary || "No summary provided.";
    
    Logger.log("Step 1: Data validation passed. Laptop ID: " + laptopId);
    
    // Step 2: Create timestamp and filename
    const timestamp = new Date();
    const formattedTime = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");
    const fileName = `Inspection_Report_${laptopId}_${formattedTime}.pdf`;
    
    Logger.log("Step 2: Timestamp created. File name: " + fileName);
    
    // Step 3: Access Drive folder
    Logger.log("Step 3: Attempting to access root folder...");
    const rootFolder = DriveApp.getFolderById("1vE3fnhl9DGPTIfKcvUmbZCdbFbE0vl9T");
    Logger.log("Step 3: Root folder accessed successfully");
    
    // Step 4: Create or find laptop folder
    Logger.log("Step 4: Creating/finding laptop folder for: " + laptopId);
    let subFolders = rootFolder.getFoldersByName(laptopId);
    let laptopFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder(laptopId);
    Logger.log("Step 4: Laptop folder ready: " + laptopFolder.getName());
    
    // Step 5: Create Google Doc
    Logger.log("Step 5: Creating Google Doc...");
    const doc = DocumentApp.create(fileName);
    const body = doc.getBody();
    
    // Add header
    body.appendParagraph(`🛠️ Hardware Inspection Report - ${laptopId}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    body.appendParagraph(`Generated on: ${timestamp.toLocaleString()}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING3);
    
    // Add summary content
    body.appendParagraph("Inspection Results:")
        .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    body.appendParagraph(summaryText);
    
    doc.saveAndClose();
    Logger.log("Step 5: Google Doc created and saved. ID: " + doc.getId());
    
    // Step 6: Convert to PDF
    Logger.log("Step 6: Converting to PDF...");
    const docFile = DriveApp.getFileById(doc.getId());
    const pdfBlob = docFile.getAs("application/pdf");
    const pdfFile = laptopFolder.createFile(pdfBlob);
    pdfFile.setName(fileName);
    docFile.setTrashed(true); // Delete original Google Doc
    
    // Make PDF public
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const pdfUrl = pdfFile.getUrl();
    
    Logger.log("Step 6: PDF created successfully. URL: " + pdfUrl);
    
    // Step 7: Access the sheet
    Logger.log("Step 7: Accessing Google Sheet...");
    const spreadsheet = SpreadsheetApp.openById("16t_EqujkDWTDtVNKZvyHGuUsFt1tGqnTvmMCgz49d2Q");
    Logger.log("Step 7: Spreadsheet opened successfully");
    
    const sheet = spreadsheet.getSheetByName("Laptop Labeling");
    if (!sheet) {
      throw new Error("Sheet 'Laptop Labeling' not found");
    }
    Logger.log("Step 7: Sheet 'Laptop Labeling' found successfully");
    
    // Step 8: Get sheet data and headers
    Logger.log("Step 8: Getting sheet data...");
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    
    Logger.log("Step 8: Sheet headers: " + JSON.stringify(headers));
    Logger.log("Step 8: Total rows in sheet: " + dataRange.length);
    
    // Step 9: Find column indexes
    const idColIndex = headers.indexOf("ID");
    const inspectionFilesIndex = headers.indexOf("Inspection Files");
    
    Logger.log("Step 9: ID column index: " + idColIndex);
    Logger.log("Step 9: Inspection Files column index: " + inspectionFilesIndex);
    
    if (idColIndex === -1) {
      throw new Error("ID column not found in sheet headers: " + JSON.stringify(headers));
    }
    
    if (inspectionFilesIndex === -1) {
      throw new Error("Inspection Files column not found in sheet headers: " + JSON.stringify(headers));
    }
    
    // Step 10: Search for laptop ID and update
    Logger.log("Step 10: Searching for laptop ID...");
    let updated = false;
    const laptopIdLower = laptopId.toString().toLowerCase().trim();
    
    Logger.log("Step 10: Searching for laptop ID: '" + laptopIdLower + "'");
    
    // Log first few rows for debugging
    for (let i = 1; i < Math.min(6, dataRange.length); i++) {
      const sheetId = dataRange[i][idColIndex];
      Logger.log("Row " + i + " ID: '" + sheetId + "'");
    }
    
    for (let i = 1; i < dataRange.length; i++) {
      const sheetIdRaw = dataRange[i][idColIndex];
      const sheetIdLower = sheetIdRaw.toString().toLowerCase().trim();
      
      if (sheetIdLower === laptopIdLower) {
        Logger.log("Step 10: MATCH FOUND at row " + (i + 1) + "! Updating...");
        
        const currentCell = sheet.getRange(i + 1, inspectionFilesIndex + 1);
        const existingValue = currentCell.getValue();
        const newValue = existingValue ? `${existingValue} , ${pdfUrl}` : pdfUrl;
        
        currentCell.setValue(newValue);
        
        Logger.log("Step 10: Updated cell with value: " + newValue);
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      // Log all available IDs for debugging
      const availableIds = [];
      for (let i = 1; i < Math.min(11, dataRange.length); i++) {
        availableIds.push("'" + dataRange[i][idColIndex].toString().toLowerCase().trim() + "'");
      }
      Logger.log("Available laptop IDs (first 10): " + availableIds.join(", "));
      
      throw new Error(`Laptop ID '${laptopId}' not found in sheet. First 10 available IDs: ${availableIds.join(', ')}`);
    }
    
    Logger.log("=== DataPdf SUCCESS ===");
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Inspection report generated and stored successfully",
      fileName: fileName,
      url: pdfUrl,
      laptopId: laptopId
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
    
  } catch (err) {
    Logger.log("=== DataPdf ERROR ===");
    Logger.log("Error message: " + err.message);
    Logger.log("Error stack: " + err.stack);
    Logger.log("Error occurred at step indicated in logs above");
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "DataPdf Error: " + err.message,
      laptopId: data?.laptopId || "Unknown",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

// Test function to debug your specific case
// function testDataPdfDebug() {
//   const testData = {
//     laptopId: "testaman",
//     summary: "🛠️ Hardware Inspection Report\n✅ Display Test: Passed\n✅ SSD Health: PASSED | Temp: 35°C\n✅ RAM Test: No errors detected",
//     type: "drivepdf"
//   };
  
//   Logger.log("=== MANUAL TEST START ===");
//   const result = DataPdf(testData);
//   Logger.log("=== MANUAL TEST RESULT ===");
//   Logger.log(result.getContent());
//   return result;
// }