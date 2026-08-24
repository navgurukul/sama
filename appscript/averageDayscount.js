function calculateAverageDays() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const auditSheet = ss.getSheetByName("Audit for Laptops");
  const resultSheet = ss.getSheetByName("Average Days Count") || ss.insertSheet("Average Days Count");

  // Clear old data
  resultSheet.clear();
  resultSheet.appendRow(["ID", "Pickup Requested Date", "Distributed Date", "Days Difference", "Calculated On"]);

  const data = auditSheet.getDataRange().getValues();
  const header = data.shift(); // remove header row

  const result = {};

  data.forEach(row => {
    const [id, field, from, to, updatedBy, updatedOn] = row;
    if (field === "Status") {
      if (!result[id]) result[id] = { id };

      // Convert string date to Date object safely
      const dateObj = parseDate(updatedOn);

      if (to === "Pickup Requested") {
        result[id].pickupRequested = dateObj;
      } else if (to === "Distributed") {
        result[id].distributed = dateObj;
      }
    }
  });

  const today = new Date();

  Object.values(result).forEach(entry => {
    const pickupDate = entry.pickupRequested ? formatDate(entry.pickupRequested) : "";
    const distributedDate = entry.distributed ? formatDate(entry.distributed) : "";
    let diffDays = "";

    if (entry.pickupRequested && entry.distributed) {
      const diff = (entry.distributed - entry.pickupRequested) / (1000 * 60 * 60 * 24);
      diffDays = Math.round(diff);
    }

    resultSheet.appendRow([
      entry.id,
      pickupDate,
      distributedDate,
      diffDays,
      formatDate(today)
    ]);
  });

  Logger.log("✅ Average Days Count updated successfully!");
}

// Helper to parse dd-mm-yyyy hh:mm:ss
function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const parts = dateStr.split(" ")[0].split("-");
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  return new Date(year, month, day);
}

// Format date nicely
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd-MM-yyyy");
}


function createDailyTrigger() {
  // Delete old triggers (to avoid duplicates)
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === "calculateAverageDays") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create a new trigger to run every day at 6 AM
  ScriptApp.newTrigger("calculateAverageDays")
    .timeBased()
    .everyDays(1)
    .atHour(00) // You can change this (0–23 hours)
    .nearMinute(30) 
    .create();

  Logger.log("✅ Daily trigger created! Will run at 6 AM every day.");
}

// 📊 Return Average Days only
function getAverageDaysAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Average Days Count");
  const data = sheet.getDataRange().getValues();

  const dayValues = data
    .slice(1)
    .map(r => r[3])
    .filter(v => typeof v === "number" && !isNaN(v));

  if (dayValues.length === 0) {
    return ContentService.createTextOutput(
      JSON.stringify({ averageDays: 0 })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const sum = dayValues.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / dayValues.length);

  const response = {
    averageDays: avg,
    calculatedOn: new Date().toISOString(),
  };

  return ContentService.createTextOutput(
    JSON.stringify(response)
  ).setMimeType(ContentService.MimeType.JSON);
}