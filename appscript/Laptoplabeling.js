function LabelHandler(payload) {
  var jsonOutput;
//commenting for checking the duplicates 
  if (payload) {
    const ss = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM');
    const mainSheet = ss.getSheetByName('Laptop Labeling');
    const historySheet = ss.getSheetByName('Audit for Laptops');
    const rows = mainSheet.getDataRange().getValues();
    const data = payload;

    let id = mainSheet.getLastRow();
    let newId = "";
    let rowIndex = -1;

    const fieldNames = [
      "Donor Company Name", "RAM", "ROM", "Manufacturer Model", "Processor", "Manufacturing Date",
      "Condition Status", "Minor Issues", "Major Issues", "Others", "Inventory Location", "Laptop Weight",
      "Mac Address", "Status", "Working", "Battery Capacity", "Allocated To", "Last Updated On",
      "Last Updated By", "Assigned To", "Comment", "Inspection Files", "ActivityWatch PDF",
      "Date", "AFK Time", "Usage Hours", "Off Times", "Last Delivery Date", "Refurbishment Date","Batch"
    ];

    for (let i = 1; i < rows.length; i++) {
      const rowId = rows[i][0];
      if (data.id && rowId.toString() === data.id.toString()) {
        rowIndex = i + 1;
        break;
      }
    }

    const minorIssuesString = data.minorIssues?.join(', ') || "";
    const majorIssuesString = data.majorIssues?.join(', ') || "";

    // Use format with time for ALL date fields
    const currentDateTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss');


    if (rowIndex !== -1) {
      const previousValues = mainSheet.getRange(rowIndex, 3, 1, 30).getValues()[0];

      let lastDeliveryDate = previousValues[25];
      let refurbishmentDate = previousValues[26];
      // if status = Distributed, set delivery date
      if (data.status === "Distributed") {
        lastDeliveryDate = currentDateTime;
      }

      if (data.status === "Laptop Refurbished") { 
        refurbishmentDate = currentDateTime;
      }

      const newValues = [
        data.donorCompanyName,
        data.ram,
        data.rom,
        data.manufacturerModel,
        data.processor,
        data.manufacturingDate,
        data.conditionStatus,
        minorIssuesString,
        majorIssuesString,
        data.others,
        data.inventoryLocation,
        data.laptopWeight,
        data.macAddress,
        data.status,
        data.working,
        data.batteryCapacity,
        data.donatedTo,
        currentDateTime,
        data.lastUpdatedBy,
        data.assignedTo,
        data.comment,
        previousValues[21],
        previousValues[22],
        previousValues[23],
        previousValues[24],
        previousValues[25],
        previousValues[26],
        lastDeliveryDate,
        refurbishmentDate,
        data.batch
      ];

      mainSheet.getRange(rowIndex, 3, 1, 30).setValues([newValues]);

      console.log("i am working")
      for (let i = 0; i < newValues.length; i++) {
        // Skip recording changes for "Last Updated On" and "Last Updated By"
        if (fieldNames[i] === "Last Updated On" || fieldNames[i] === "Last Updated By") continue;

        let fromValue = previousValues[i] ?? "";
        let toValue = newValues[i] ?? "";

        // Normalize date values for Manufacturing Date
        if (fieldNames[i] === "Manufacturing Date" && fromValue && toValue) {
          try {
            // Try to convert both values to Date objects and then to the same format
            const fromDate = new Date(fromValue);
            const toDate = new Date(toValue);

            // Check if dates are valid
            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
              // Format both dates consistently (yyyy-MM-dd)
              fromValue = Utilities.formatDate(fromDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
              toValue = Utilities.formatDate(toDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
            }
          } catch (e) {
            // If there's an error in date conversion, leave values as they are
            Logger.log("Error normalizing dates: " + e);
          }
        }

              console.log("i am working")

        // Normalize percentage values for Battery Capacity
        if (fieldNames[i] === "Battery Capacity") {
          // Convert "80%" to "0.8" and "0.8" to "0.8" for consistent comparison
          fromValue = String(fromValue).replace(/%/g, '').trim();
          toValue = String(toValue).replace(/%/g, '').trim();

          // Try to convert to numbers for comparison
          const fromNum = parseFloat(fromValue);
          const toNum = parseFloat(toValue);

          if (!isNaN(fromNum) && !isNaN(toNum)) {
            // If toValue is between 0-1 and fromValue is between 0-100 or vice versa, normalize them
            if ((toNum <= 1 && fromNum > 1 && fromNum <= 100) || (fromNum <= 1 && toNum > 1 && toNum <= 100)) {
              // Normalize to decimal format (0 to 1)
              fromValue = (fromNum > 1) ? (fromNum / 100).toString() : fromNum.toString();
              toValue = (toNum > 1) ? (toNum / 100).toString() : toNum.toString();
            }
          }
        }

        // Compare the normalized values
        if (fromValue === toValue) continue;
        if (fromValue === "" && toValue === "") continue;
         console.log("i am working")


        historySheet.appendRow([
          data.id,
          fieldNames[i],
          previousValues[i] ?? "", // Keep original values in the audit log
          newValues[i] ?? "",
          data.lastUpdatedBy,
          currentDateTime  // Now includes time with date
        ]);
      }

      jsonOutput = { status: 'success', message: 'Row updated successfully' };
    } else {
      if (!data.id || data.id.trim() === "") {
        const donorCompany = data.donorCompanyName || "XXX";
        const donorCompanyCode = donorCompany.substring(0, 3).toUpperCase();
        newId = `SAMA-${donorCompanyCode}-${id}`;
      } else {
        newId = data.id;
      }

      // Add time to the date in new row records as well
      const newRow = [
        newId,
        currentDateTime, // Now includes time with date in main sheet
        data.donorCompanyName,
        data.ram,
        data.rom,
        data.manufacturerModel,
        data.processor,
        data.manufacturingDate,
        data.conditionStatus,
        minorIssuesString,
        majorIssuesString,
        data.others,
        data.inventoryLocation,
        data.laptopWeight,
        data.macAddress,
        "Pickup Requested",
        // "In Transit",
        "",                    // Working
        data.batteryCapacity,
        data.donatedTo,
        "",
        "",
        data.assignedTo,
        data.comment,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ];

      mainSheet.appendRow(newRow);
      // also log entry in Audit for Laptops
      historySheet.appendRow([
        newId,
        "Status",
        "-",
        "Pickup Requested",
        data.lastUpdatedBy || "system@script",
        currentDateTime
      ]);

      jsonOutput = { status: 'success', id: newId };
      
    }
  } else {
    jsonOutput = { status: 'error', message: 'No data received' };
  }

  // Fixed ContentService response
  let output = ContentService.createTextOutput(JSON.stringify(jsonOutput));
  output = output.setMimeType(ContentService.MimeType.JSON);

  return output;

}
