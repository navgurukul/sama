function Preliminary(payload) {
  try {
    // Parse the JSON data received from the POST request
    const data = payload;
    // Open the Preliminary sheet
    const prelimSheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM')
      .getSheetByName('Preliminary');

    // Open the Registered NGO sheet
    const regSheet = SpreadsheetApp.openById('1kzVjIU7ChPWV01gY3b7-4fsk9pO-_WXnWdg7VMjg4k4')
      .getSheetByName('Registerd NGO');

    // Get Registered NGO data
    const regData = regSheet.getDataRange().getValues();
    const regHeaders = regData[0];
    const idIndex = regHeaders.indexOf("Id");
    const donerIndex = regHeaders.indexOf("Doner");

    // Build a lookup map { Id -> Doner }
    const donorMap = {};
    regData.slice(1).forEach(row => {
      donorMap[row[idIndex]] = row[donerIndex];
    });

    // Generate a unique 3 or 4 digit ID
    const uniqueID = Math.floor(100 + Math.random() * 9000);  // Generates a number between 100 and 9999

    // Extract and prepare the fields to be stored
    const {
      ngoId,
      numberOfSchools,
      numberOfTeachers,
      numberOfStudents,
      numberOfFemaleStudents,
      states,
      courses,
    } = data;


    // Find Doner from Registered NGO sheet using ngoId
    const donorName = donorMap[ngoId] || "";
    // Convert states into a comma-separated string
    const statesString = states.join(", ");

    // Convert courses into a single string format
    const coursesString = courses
      .map((course, index) => `Course${index + 1}: ${course}`)
      .join(", ");

    // Format the current date and time consistently
    const formattedDate = getFormattedDate();

    // Prepare the row data for appending to the sheet
    const rowData = [
      uniqueID, // Auto-generated 3 or 4 digit ID
      ngoId,
      numberOfSchools,
      numberOfTeachers,
      numberOfStudents,
      numberOfFemaleStudents,
      statesString,
      coursesString, // Save all courses in a single column
      formattedDate,
      donorName,

      // new Date().toLocaleString(), // Timestamp
    ];


    // Append row into Preliminary sheet
    prelimSheet.appendRow(rowData);


    // Prepare the response JSON
    const responseData = {
      ngoId,
      numberOfSchools,
      numberOfTeachers,
      numberOfStudents,
      numberOfFemaleStudents,
      states,
      numberOfCourses: courses.length, // Number of courses
      courses: courses.map((course, index) => `course${index + 1}: ${course}`), // Structured courses data
      donor: donorName,
      type: "preliminary",
    };

    // Return a success response
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Data saved successfully!", data: responseData })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Handle any errors
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function testPreliminary() { 
  const testPayload = { 
    ngoId: "SAM-71", 
    numberOfSchools: 5, 
    numberOfTeachers: 10, 
    numberOfStudents: 200, 
    numberOfFemaleStudents: 120, 
    states: ["Maharashtra", "Goa"], 
    courses: ["Math", "Science"] 
    }; 
  const result = Preliminary(testPayload);
Logger.log(result.getContent()); 
}

// Helper function to format the date consistently
function getFormattedDate() {
  const now = new Date();
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  };
  return Utilities.formatDate(now, Session.getScriptTimeZone(), "M/d/yyyy, h:mm:ss a");
}
