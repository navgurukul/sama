function HandleUserDetailsUpload(payload) {
  var jsonOutput;

  try {
    var folderId = '1i_x08VV2JWzpOLyNBONHHGIg0VECUAKv'; // Main folder ID
    var sheetId = '1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM'; // Sheet ID
    var mainFolder = DriveApp.getFolderById(folderId);
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName('UserDetails');

    if (!sheet) {
      throw new Error('Sheet not found');
    }

    var data = payload;
    var fileUrls = {}; // To store file URLs for each file
    var userId = data.userId ? parseInt(data.userId) : null;
    var row;

    if (userId) {
      // Search for existing row with the given userId
      var values = sheet.getDataRange().getValues();
      row = values.findIndex(function(row) { return row[0] === userId; }) + 1;

      if (row === 0) {
        throw new Error('User ID not found');
      }else{
        fileUrls.idProofFileUrl = values[row - 1][18]; // ID Proof file URL column
        fileUrls.incomeCertificateFileUrl = values[row - 1][19];
      }
    } else {
      // Generate a new ID if userId is not provided
      userId = sheet.getLastRow() + 1;
      row = null; // Indicates a new row needs to be added
    }

    // Create a new subfolder with the userId inside the main folder
    var userFolder = mainFolder.createFolder("User_" + userId);
    // var userFolder = mainFolder.createFolder("i am folder");
    // Upload the files if provided and get their URLs
    if (data.idProofFile) {
      var idProofBlob = Utilities.newBlob(Utilities.base64Decode(data.idProofFile), data.idProofMimeType, data.idProofFileName);
      var idProofFile = userFolder.createFile(idProofBlob);
      fileUrls.idProofFileUrl = idProofFile.getUrl();
    }

    if (data.incomeCertificateFile) {
      var incomeBlob = Utilities.newBlob(Utilities.base64Decode(data.incomeCertificateFile), data.incomeCertificateMimeType, data.incomeCertificateFileName);
      var incomeFile = userFolder.createFile(incomeBlob);
      fileUrls.incomeCertificateFileUrl = incomeFile.getUrl();
    }

    var rowData = [
      userId,
      data.ngoId || '',
      data.name || '',
      data.email || '',
      data.contactNumber || '',
      data.address || '',
      data.addressState || '',
      data.idProofType || '',
      data.idNumber || '',
      data.qualification || '',
      data.occupation || '',
      data.dateOfBirth || '',
      data.useCase || '',
      data.familyMembers || '',
      data.guardian || '',
      data.familyAnnualIncome || '',
      data.status || '',
      data.laptopAssigned || '',
      fileUrls.idProofFileUrl || '', // File URL for ID Proof
      fileUrls.incomeCertificateFileUrl || '' // File URL for Income Certificate
    ];

    if (row) {
      // Update existing row if userId is provided and found
      sheet.getRange(row, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Append new row if userId is not provided
      sheet.appendRow(rowData);
    }
    jsonOutput = { status: 'success', id: userId };

  } catch (error) {
    jsonOutput = { status: 'error', message: 'No data received' };
    
  }
  return jsonOutput
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
