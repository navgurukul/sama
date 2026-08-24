
function ActivityPdf(data) {
  try {
    // 1. Input validation and processing
    const laptopId = data.laptopId || "UnknownLaptop";
    const summaryText = data.summary || "No summary provided.";

    // Ensure activityLog is always an array
    let activityLog = [];
    if (Array.isArray(data.activity)) {
      activityLog = data.activity;
    } else if (typeof data.activity === 'string') {
      try {
        activityLog = JSON.parse(data.activity);
      } catch (e) {
        console.warn("Could not parse activity data:", e);
      }
    }

    // 2. Create PDF filename
    const timestamp = new Date();
    const formattedTime = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");
    const fileName = `ActivityReport_${laptopId}_${formattedTime}.pdf`;

    // 3. Get or create laptop folder
    const rootFolder = DriveApp.getFolderById("1RGsdZWG4KqQFjOyLD8E3ivkMvvBK4vBb");
    let subFolders = rootFolder.getFoldersByName(laptopId);
    let laptopFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder(laptopId);

    // 4. Create PDF using HTML template
    const htmlTemplate = HtmlService.createTemplateFromFile('pdfTemplate');
    htmlTemplate.data = {
      laptopId: laptopId,
      summary: summaryText,
      activityLog: activityLog
    };

    const htmlContent = htmlTemplate.evaluate().getContent();
    const pdfBlob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html')
      .getAs('application/pdf')
      .setName(fileName);

    // 5. Save PDF directly (no intermediate Doc)
    const pdfFile = laptopFolder.createFile(pdfBlob);
    // (Keep your existing spreadsheet update code)

    // 6. Set sharing permissions
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const pdfUrl = pdfFile.getUrl();

    // 7. Update spreadsheet (your existing code here)
    // 7. Update spreadsheet - Modified to maintain single link
    const sheet = SpreadsheetApp.openById("1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM")
      .getSheetByName("Laptop Labeling");

    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const idColIndex = headers.indexOf("ID");
    const urlColumn = 25; // Column Y for URL
    const timestampColumn = 26; // Column Z for timestamp
    const afkColIndex = headers.indexOf("AFK Time");
    const usageColIndex = headers.indexOf("Usage Hours"); 
    const offtimeColIndex = headers.indexOf("Off Times"); 


    let rowUpdated = false;

    // Search for existing entry
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][idColIndex] === laptopId) {
        // Update existing row
        sheet.getRange(i + 1, urlColumn).setValue(pdfUrl);
        sheet.getRange(i + 1, timestampColumn).setValue(new Date());
        rowUpdated = true;
        sheet.getRange(i + 1, afkColIndex + 1).setValue(data.afk || "0 min");
        sheet.getRange(i + 1, usageColIndex + 1).setValue(data.total_usage || "0 min"); 
        sheet.getRange(i + 1, offtimeColIndex + 1).setValue(data.off_times || "0 min");


        // Delete previous PDF file if exists
        const previousUrl = dataRange[i][urlColumn - 1]; // -1 because arrays are 0-indexed
        // if (previousUrl) {
        //   try {
        //     const previousFile = DriveApp.getFileById(extractFileIdFromUrl(previousUrl));
        //     previousFile.setTrashed(true);
        //   } catch (e) {
        //     console.warn("Could not delete previous PDF:", e);
        //   }
        // }
        break;
      }
    }

    // If no existing entry found, add new row
    // if (!rowUpdated) {
    //   const newRow = Array(headers.length).fill("");
    //   newRow[idColIndex] = laptopId;
    //   newRow[urlColumn - 1] = pdfUrl; // -1 because arrays are 0-indexed
    //   newRow[timestampColumn - 1] = new Date();
    //   sheet.appendRow(newRow);
    // }
    if (!rowUpdated) {
      const newRow = Array(headers.length).fill("");
      newRow[idColIndex] = laptopId;
      newRow[urlColumn - 1] = pdfUrl;
      newRow[timestampColumn - 1] = new Date();
      newRow[afkColIndex] = data.afk || "0 min";
      newRow[usageColIndex] = data.total_usage || "0 min";
      newRow[offtimeColIndex] = data.off_times || "0 min";
      sheet.appendRow(newRow);
    }


    // Helper function to extract file ID from URL
    function extractFileIdFromUrl(url) {
      const match = url.match(/[-\w]{25,}/);
      return match ? match[0] : null;
    }

    // ... [keep your existing spreadsheet update code] ...

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      url: pdfUrl,
      message: "PDF generated successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message,
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ✅ Duration Formatter Function
function formatDurationInMinutes(duration) {
  // duration might be '45 min', '1 hr', or just a number like 90
  if (!duration) return "-";

  let minutes = 0;

  // If already a number (e.g., from frontend as 90), convert directly
  if (typeof duration === "number") {
    minutes = duration;
  } else if (typeof duration === "string") {
    if (duration.includes("hr") || duration.includes("min")) {
      return duration; // already formatted
    }

    const num = parseInt(duration);
    if (!isNaN(num)) {
      minutes = num;
    }
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  let result = "";
  if (hrs > 0) result += `${hrs} hr${hrs > 1 ? "s" : ""} `;
  if (mins > 0) result += `${mins} min`;

  return result.trim() || "0 min";
}


// // ✅ For Testing

function testActivityPdf() {
  const mockData = {
    laptopId: "test-laptop",
    summary: "Browsing: 2 hrs\nProgramming: 3 hrs",
    activity: [
      { time: "10:00", app: "Chrome", title: "Google", duration: "30 min", category: "browsing" }
    ]
  };
  const result = ActivityPdf(mockData);
  Logger.log(result.getContent());
}

