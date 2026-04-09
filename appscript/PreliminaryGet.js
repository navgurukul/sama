function PreliminaryGet(e) {
  try {
    // Open the Google Sheet and get the required sheet
    const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM').getSheetByName('Preliminary');

    // Get all data from the sheet
    const rawData = sheet.getDataRange().getValues();
    const headers = rawData[0]; // Assume the first row contains headers
    const data = rawData.slice(1).map((row) =>
      headers.reduce((acc, header, i) => {
        acc[header] = row[i];
        return acc;
      }, {})
    );

    // Process and format the data
    const formattedData = data.map((item) => {
      const states = item.States ? item.States.split(", ").map((state) => state.trim()) : [];
      const courses = item.Course
        ? item.Course.split(", ").map((course) => {
            const [name, duration] = course.split(":").map((c) => c.trim());
            return { name, duration };
          })
        : [];

      // Format date to ISO 8601
      const dateValue = item.Unit;
      let formattedDate;

      if (dateValue instanceof Date) {
        // If the value is already a Date object
        formattedDate = dateValue.toISOString();
      } else if (typeof dateValue === 'string') {
        // If the value is a string (e.g., "07/01/2025, 18:10:52")
        const [datePart, timePart] = dateValue.split(", ");
        if (datePart && timePart) {
          const [day, month, year] = datePart.split("/");
          const [hours, minutes, seconds] = timePart.split(":");
          const parsedDate = new Date(
            parseInt(year),
            parseInt(day),
            parseInt(month) - 1, // JavaScript months are 0-based
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds)
          );
          formattedDate = parsedDate.toISOString();
        } else {
          formattedDate = null; // Invalid format fallback
        }
      } else {
        formattedDate = null; // Fallback for unexpected formats
      }
   
      return {
        Id: item.Id,
        NgoId: item.NgoId,
        "Number of school": item["Number of school"],
        "Number of teacher": item["Number of teacher"],
        "Number of student": item["Number of student"],
        "Number of Female student": item["Number of Female student"],
        States: states,
        Unit: formattedDate, // ISO-formatted date
        Courses: courses,
        Doner: item.Doner,
      };
    });


    const idParam = e.parameter.id; // Get the 'id' parameter
    let responseData;

    // If 'id' is provided, filter data; otherwise, return all data
    if (idParam) {
      const id = parseInt(idParam, 10); // Convert 'id' to an integer
      responseData = formattedData.filter((item) => parseInt(item.Id, 10) === id);
    } else {
      responseData = formattedData; // Return all data
      console.log(responseData)
    }

    // Return the JSON response
    return ContentService.createTextOutput(JSON.stringify(responseData)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Handle errors and log them
    return ContentService.createTextOutput(JSON.stringify({ error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
