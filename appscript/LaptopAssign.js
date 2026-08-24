// Function to store the Laptop ID and User ID in Sheet C
function StoreIdInSheetC(data) {
  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('LaptopUserMap');

  Logger.log(data)
  console.log(data)
  // Append Laptop ID, User ID, and Issued Date to Sheet C
  sheet.appendRow([data.laptopId, data.userId, data.issuedDate]);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success',}))
      .setMimeType(ContentService.MimeType.JSON)
}

// Function to update the status in Sheet A
function UpdateStatusInSheetA(data) {
  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Laptop Labeling');
  const dataA = sheet.getDataRange().getValues();

  // Loop through Sheet A to find the matching Laptop ID and update the status
  for (let i = 1; i < dataA.length; i++) { // Assuming the first row has headers
    if (dataA[i][0] == data.laptopId) {  // Assuming Laptop ID is in column A
      sheet.getRange(i + 1, 16).setValue('Laptop Assigned'); // Update status in column 15 (Status column in Sheet A)
      break;
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success',}))
      .setMimeType(ContentService.MimeType.JSON)
}

// Function to update the status and date in Sheet B
function UpdateStatusInSheetB(data) {
  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('UserDetails');
  const dataB = sheet.getDataRange().getValues();
  const today = new Date(); // Get today's date
console.log(dataB)
  // Loop through Sheet B to find the matching User ID and update the status and date
  for (let i = 1; i < dataB.length; i++) { // Assuming the first row has headers
    if (dataB[i][0] == data.userId) {  // Assuming User ID is in column A
      sheet.getRange(i + 1, 14).setValue('Laptop Assigned'); // Update status in column 16 (Status column in Sheet B)
      sheet.getRange(i + 1, 17).setValue(today); // Update date in column 17 (Date column in Sheet B)
      break;
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'success',}))
      .setMimeType(ContentService.MimeType.JSON)
}

// function testFunc(){
//   const a = {"laptopId":"SAMA-COM-12","userId":"4","issuedDate":"13/09/2024","type":"assign","status":"assign"}
//   const result = UpdateStatusInSheetB(a)
//   console.log(result);
// }

