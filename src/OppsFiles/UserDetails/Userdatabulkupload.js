// import React, { useState } from "react";
// import {
//   Button,
//   Typography,
//   Card,
//   CardContent,
//   CardActions,
//   Snackbar,
//   Alert,
//   CircularProgress,
//   Link,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   FormControl,
//   Box
// } from "@mui/material";
// import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
// import * as XLSX from "xlsx";

// function Userdatabulkupload() {
//   const [file, setFile] = useState(null);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//   const [loading, setLoading] = useState(false);
//   const [uploadMode, setUploadMode] = useState("bulk");

//   const expectedHeaders = [
//     "name",
//     "email",
//     "contact number",
//     "Address",
//     "Address State",
//     "ID Proof type",
//     "ID Proof number",
//     "Qualification",
//     "Occupation",
//     "Date Of Birth",
//     "Use case",
//     "Number of Family members(who might use the laptop)",
//     "status",
//     "Laptop Assigned",
//     "ID Link"
//   ];

//   const handleFileChange = (e) => {
//     const uploadedFile = e.target.files[0];
//     if (
//       uploadedFile &&
//       uploadedFile.type ===
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       setFile(uploadedFile);
//     } else {
//       alert("Please upload an Excel file (.xlsx format).");
//     }
//   };

//   const handleSnackbarClose = () => {
//     setSnackbarOpen(false);
//   };

//   const validateHeaders = (sheetData) => {
//     const fileHeaders = Object.keys(sheetData[0]);
//     return expectedHeaders.every((header) => fileHeaders.includes(header));
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       alert("No file selected!");
//       return;
//     }
//     setLoading(true);

//     const reader = new FileReader();
//     reader.onload = async (event) => {
//       const binaryStr = event.target.result;
//       const workbook = XLSX.read(binaryStr, { type: "binary" });

//       const sheetName = workbook.SheetNames[0];
//       const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//       console.log(sheetData);
      
//       if (!validateHeaders(sheetData)) {
//         setSnackbarMessage(
//           "The uploaded file does not match the expected format. Please upload a valid file."
//         );
//         setSnackbarSeverity("error");
//         setSnackbarOpen(true);
//         setLoading(false);
//         return;
//       }

//       const dataToSend = {
//         type: "userdetailsbulkupload",
//         data: sheetData,
//       };

//       try {
//         await fetch(
//           "https://script.google.com/macros/s/AKfycbxamFLfoY7ME3D6xCQ9f9z5UrhG2Nui5gq06bR1g4aiidMj3djQ082dM56oYnuPFb2PuA/exec",
//           {
//             method: "POST",
//             body: JSON.stringify(dataToSend),
//             mode: "no-cors",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         setSnackbarMessage("Data stored successfully!");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//         setFile(null);  
//       } catch (error) {
//         setSnackbarMessage("Failed to upload data. Please try again.");
//         setSnackbarSeverity("error");
//         setSnackbarOpen(true);
//       } finally {
//         setLoading(false);
//       }
//     };
//     reader.readAsBinaryString(file);
//   };

//   return (
//     <>
   
          
//          <Box mt={3} align="center">
//           <Alert backgroundColor="#F8F3F0" style={{ margin: "20px 0" }} >
//             Please upload an Excel file (.xlsx format). You can download the
//             sample file to understand the required format.
//           </Alert>
//           <Box
//             sx={{
//               border: "2px dashed",
//               borderRadius: 1,
//               padding: 6,
//               textAlign: "center",
//               backgroundColor: "#f9f9f9",
//               cursor: "pointer",

//             }}
//             onClick={() => document.getElementById("upload-file").click()}
//           >
//             <CloudUploadIcon sx={{ fontSize: 40, color: "#5C785A" }} />
//             <Typography variant="subtitle1" color="primary" sx={{fontWeight:"700"}}>
//               Upload or Drag File
//             </Typography>
//             {file && (
//               <Typography variant="body2" mt={1} >
//                 Selected file: {file.name}
//               </Typography>
//             )}
//           </Box>
//           <input
//             type="file"
//             accept=".xlsx"
//             onChange={handleFileChange}
//             style={{ display: "none" }}
//             id="upload-file"
//           />
//           <Link
//             href="/Example-Sheet.xlsx"
//             download="Sample_Beneficiary_Data.xlsx"
//             target="_blank"
//             style={{ display: "block", marginTop: "10px", textAlign: "center" }}
//           >
//             Format for learner data: Sample_Beneficiary_Data.xlsx
//           </Link>
       
       
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleUpload}
//             disabled={!file || loading}
//             style={{ marginTop: "32px" }}
//           >
//             {loading ? <CircularProgress size={24} /> : "Upload"}
//           </Button>
//         </Box>
     
//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={6000}
//         onClose={handleSnackbarClose}
//       >
//         <Alert
//           onClose={handleSnackbarClose}
//           severity={snackbarSeverity}
//           sx={{ width: "100%" }}
//         >
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// }

// export default Userdatabulkupload;



import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Link,
  LinearProgress,
  Card,
  CardContent
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";

function Userdatabulkupload({ user }) {
  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // New progress state

  const expectedHeaders = [
    "name",
    "email",
    "contact number",
    "Address",
    "Address State",
    "ID Proof type",
    "ID Proof number",
    "Qualification",
    "Occupation",
    "Date Of Birth",
    "Use case",
    "Number of Family members(who might use the laptop)",
    "status",
    "Laptop Assigned",
    "ID Link",
  ];

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (
      uploadedFile &&
      uploadedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFile(uploadedFile);
    } else {
      alert("Please upload an Excel file (.xlsx format).");
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validateHeaders = (sheetData) => {
    const fileHeaders = Object.keys(sheetData[0]);
    return expectedHeaders.every((header) => fileHeaders.includes(header));
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    setLoading(true);
    setProgress(0); // Reset progress at the beginning of each upload

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!validateHeaders(sheetData)) {
        setSnackbarMessage(
          "The uploaded file does not match the expected format. Please upload a valid file."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
    
      const updatedSheetData = sheetData.map((entry) => ({
        ...entry,
        Ngo: "SAM-1"
    }));
    
      const dataToSend = {
        type: "userdetailsbulkupload",
        data: updatedSheetData, 
      };

      // Simulate a progressive upload by updating the progress state
      const simulateUpload = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(simulateUpload);
            return 100;
          }
          return prev + 10; // Increase progress by 10% at each interval
        });
      }, 200); // Update every 200ms for the simulation effect

      try {
        await fetch(
          "https://script.google.com/macros/s/AKfycbxamFLfoY7ME3D6xCQ9f9z5UrhG2Nui5gq06bR1g4aiidMj3djQ082dM56oYnuPFb2PuA/exec",
          {
            method: "POST",
            body: JSON.stringify(dataToSend),
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setSnackbarMessage("Data stored successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setFile(null);
      } catch (error) {
        setSnackbarMessage("Failed to upload data. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Box mt={3} 
      // align="center"
      >
        {/* <Alert backgroundColor="red" style={{ margin: "20px 0" }}>
          Please upload an Excel file (.xlsx format). You can download the
          sample file to understand the required format.
        </Alert> */}
        <Typography variant="body2" align="left" backgroundColor="#F8F3F0" mb = {1} style={{ padding: "10px",}}>
        Please upload an Excel file (.xlsx format). You can download the
        sample file to understand the required format.
        </Typography>
        <Box
          sx={{
            border: "2px dashed",
            borderRadius: 1,
            padding: 6,
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
          }}
          onClick={() => document.getElementById("upload-file").click()}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: "#5C785A" }} />
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "700" }}>
            Upload or Drag File
          </Typography>
          {file && (
            <Typography variant="body2" mt={1}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="upload-file"
        />
        <Box mt={2} align= "left">
        <Typography
          variant="subtitle2"
          color="textPrimary"
          sx={{ display: "inline", textAlign: "left" }}
        >
          Format for learner data:{" "}
        </Typography>
        <Link
          href="https://docs.google.com/spreadsheets/d/1rhsK-Hir7J8HQgDCZHsoFNnpONu14tLP3Jp3d5pGuAs/edit?gid=1579348065#gid=1579348065"
          // href="/Example-Sheet.xlsx"
          // download="Sample_Beneficiary_Data.xlsx"
          download
          target="_blank"
          sx={{ display: "inline", color: "primary.main", textDecoration: "none" }}
        >
          Sample_Beneficiary_Data.xlsx
        </Link>
        </Box>
        {/* <Link
          href="/Example-Sheet.xlsx"
          download="Sample_Beneficiary_Data.xlsx"
          target="_blank"
          style={{ display: "block", marginTop: "10px", textAlign: "left" }}
        >
          Format for learner data: Sample_Beneficiary_Data.xlsx
        </Link> */}

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </Box>

        {/* <Button
          variant="contained"
          color="primary"
          align = "center"
          onClick={handleUpload}
          disabled={!file || loading}
          style={{ marginTop: "32px", align: "center" }}
        >
          {loading ? <CircularProgress size={24} /> : "Upload"}
        </Button> */}

        {loading && (
          <Card sx={{ mt: 2,}}>
            <CardContent>
              <Typography variant="subtile1"  >
                {file ? file.name : ""}
              </Typography>
              <Box
               display="flex"
               alignItems="center"
                my = {2}
               >
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ flexGrow: 1, mr: 2 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {progress}%
                </Typography>
              </Box>
              
            </CardContent>
          </Card>

         )}


        {/* {loading && (
          <Box mt={2} width="80%">
            <Typography variant="body2" align="center">
              Uploading: {file ? file.name : ""}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="textSecondary" align="center">
              {progress}% Complete
            </Typography>
          </Box>
        )} */}
      </Box>
      {loading && 
              <Box display="flex" justifyContent="center" mt={4}>

             <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, }}
                onClick={() => window.location.href = "/ngo-dashboard"}
              >
                Return to Dashboard
              </Button>
          </Box>
    }
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Userdatabulkupload;
