function PickUp(payload) {
  try {
    // Parse the JSON data received from the POST request
    const data = payload;

    // Open the active Google Sheet
    const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Pickup');

      // Generate Pickup ID = "PU" + current timestamp
    var pickupId = "PU" + new Date().getTime();

    // Append the row with Pickup ID
    sheet.appendRow([
      pickupId,
      data.donorCompany,
      data.pocName,
      data.pocContact,
      data.email,
      data.numberOfLaptops,
      data.pickupLocation,
      data.pickupBy,
      data.currentDate
     
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Data saved successfully",
        pickupId: pickupId 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Handle any errors
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// this is to get the data from the pickup data sheet.

function PickupGet(e) {
  try {

  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Pickup');
    var data = sheet.getDataRange().getValues();

    var headers = data[0]; // first row = headers
    var rows = data.slice(1); // remaining rows

    var totalLaptops = 0;
    var records = rows.map(row => {
      var record = {};
      headers.forEach((h, i) => {
        record[h] = row[i];
      });
      // Add to total laptop count (make sure value is number)
      totalLaptops += Number(record["Number of Laptops"]) || 0;
      return record;
    });

    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "success", 
        totalLaptops: totalLaptops,
        data: records 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// Update Pickup Status function
function UpdatePickupStatus(payload) {
  try {
    const data = payload;
    const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Pickup');
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];

    const pickupIdIndex = headers.indexOf("Pickup ID");
    const statusIndex = headers.indexOf("Status");
    const confirmPickupDateIndex = headers.indexOf("Confirm Pickup Date");
    const updatedOnIndex = headers.indexOf("Updated On");
    const updatedByIndex = headers.indexOf("Updated By");

    let updated = false;

    for (let i = 1; i < dataRange.length; i++) {
      if (String(dataRange[i][pickupIdIndex]) === String(data.pickupId)) {
        sheet.getRange(i + 1, statusIndex + 1).setValue(data.status);
        sheet.getRange(i + 1, updatedOnIndex + 1).setValue(new Date());
        sheet.getRange(i + 1, updatedByIndex + 1).setValue(data.updatedBy);
        sheet.getRange(i + 1, confirmPickupDateIndex + 1).setValue(data.confirmPickupDate);

        updated = true;   
        break;           
      }
    }

    if (updated) {
      return ContentService.createTextOutput(
        JSON.stringify({ message: "Status and role updated, email sent." })
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Email not found or no update made" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}


  