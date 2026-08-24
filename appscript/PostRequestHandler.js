function doPost(e) {
  var data = JSON.parse(e.postData.contents);
 

  if (data.type == "laptopLabeling") {
    LabelHandler(data);
  } else if (data.type == "bulkupload") {
    // Call your bulk upload handler function here
    BulkUploadHandler(data.data);
  } else if (data.type == "userdetails") {
    HandleUserDetailsUpload(data);
  }
  else if ((data.type == "userdetailsbulkupload")) {
    HandleUserDetailsBulkUpload(data.data);
  }
  else if (data.type == "laptopusermap") {
    LaptopUserMap(data.data);
  }
  else if (data.type == "editUser") {
    EditUserStatus(data)
  }
  else if (data.type == "assign") {

    StoreIdInSheetC(data); // Store the Laptop ID and User ID in Sheet C
    UpdateStatusInSheetA(data); // Update status in Sheet A
    UpdateStatusInSheetB(data);
    LabelHandler(data)
  }
  else if (data.type == "deleteUser") {
    DeleteUserDetail(data)
  }
  else if (data.type == "preliminary") {
    Preliminary(data)
  }
  else if (data.type == "monthly") {
    MonthlyReport(data)
  }
  else if (data.type == "UpdateLaptopComment") {
    UpdateLaptopComment(data)
  }
  else if (data.type == "drivepdf") {
    DataPdf(data)
  }
  else if (data.type == "ActivityPdf") {
    return ActivityPdf(data)
  }
  else if (data.type == "Pickup") {
    return PickUp(data);
  }
  else if (data.type == "updatepickupstatus") {
    return UpdatePickupStatus(data);
  }
  else {
    // Handle other types or errors if needed
    Logger.log("Unknown type: " + data.type);
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid type provided.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Check if parameters are provided
  // if (!e.parameter) {
  //   return ContentService.createTextOutput(JSON.stringify({ error: 'No parameters provided' }))
  //                        .setMimeType(ContentService.MimeType.JSON);
  // }
  if (!e || !e.parameter) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: "No parameters provided" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  
  const type = e.parameter.type;
  const id_number = e.parameter.id; 

  if (type === 'getLaptopData') {
    return LaptopGetRequest(e);
  }
  if (type === 'getUserData') {
    return UserDetailsGetRequest(e);
  }
  if (type === "getpre") {
    return PreliminaryGet(e)
  }
  if (type === "audit") {
    return Audit(e);
  }
  if (type === "pickupget") {
    return PickupGet(e);
  }
  if (type === "getAverageDays") {
    return getAverageDaysAPI();
  }

  if (id_number) {
    return findLaptop(id_number);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}



