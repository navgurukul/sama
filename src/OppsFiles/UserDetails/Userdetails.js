import React, { useState } from "react";
import {
  Button,
  TextField,
  Container,
  FormControl,
  Snackbar,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  FormLabel,
} from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { breakpoints } from "../../theme/constant";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const FormComponent = ({ user }) => {
  const statesOptions = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Delhi",
    "Lakshadweep",
    "Puducherry",
  ];

  const idProofOptions = [
    // "Ration card",
    "Aadhar Card",
    "Voter ID card",
    "Driving License",
    "PAN Card",
    "Passport",
    // "Domicile/Secondary/Senior Secondary Marksheet"
  ];
  const useCaseOptions = [
    "Income Increase/Job",
    "Entrepreneurship",
    "Internships",
    "Skilling/Vocations",
  ];
  const statusOptions = ["Data Uploaded", "Laptop Assigned"];
  const qualification = [
    "Elementary School",
    "Middle School",
    "High School",
    "Higher Secondary Education",
    "Undergraduate Degree pursuing",
    "Undergraduate Degree completed",
    "Diploma Courses",
    "Postgraduate Degree",
  ];
  const occupation = ["Students", "Trainer", "Employed"];
  const familyAnnualIncome = [
    "0 to 50K",
    "50 to 1Lakh",
    "1 to 2lakh",
    "2 to 3lakh",
    "3 to 5lakh",
    "5+ lakh",
  ];
  const fields = [
    { label: "Name", name: "name" },
    { label: "Email", name: "email" },
    { label: "Contact Number", name: "contactNumber" },
    { label: "Date Of Birth", name: "dateOfBirth" },
    { label: "Address (Number, Street, Locality etc.)", name: "address" },
    { label: "State", name: "addressState" },
    { label: "ID Proof Type", name: "idProofType" },
    { label: "ID Number", name: "idNumber" },
    { label: "Qualification", name: "qualification" },
    { label: "Occupation Status", name: "occupation" },
    { label: "Use Case", name: "useCase" },
    { label: "Number of Family Members", name: "familyMembers" },
    { label: "Father/Mother/Guardian’s Occupation", name: "guardian" },
    { label: "Family Annual Income", name: "familyAnnualIncome" },
    { label: "Status", name: "status" },
    { label: "Laptop Assigned", name: "laptopAssigned" },
    // { label: "Income Certificate", name: "incomeCertificate" },
  ];

  const [formData, setFormData] = useState({
    idProofType: "",
    useCase: "",
    addressState: "",
    status: "",
    qualification: "",
    occupation: "",
    familyAnnualIncome: "",
    idProofFile: null,
    incomeCertificateFile: null,
  });

  const [errors, setErrors] = useState({});

  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // To store custom message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Success or Error
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const isActive = useMediaQuery("(max-width:" + breakpoints.values.sm + "px)");

  const handleFileChange = (event, fileType) => {
    setFormData({
      ...formData,
      [fileType]: event.target.files[0],
    });
  };
  // const handleFileChange = (event) => {
  //   setFile(event.target.files[0]);
  // };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validate = () => {
    let tempErrors = {};

    tempErrors.email = formData.email
      ? /\S+@\S+\.\S+/.test(formData.email)
        ? ""
        : "Email is not valid"
      : "Email is required";

    tempErrors.contactNumber = formData.contactNumber
      ? /^\d{10}$/.test(formData.contactNumber)
        ? ""
        : "Contact number should be 10 digits Number only"
      : "Contact number is required";

    if (formData.idProofType === "Aadhar Card") {
      tempErrors.idNumber = formData.idNumber
        ? /^\d{12}$/.test(formData.idNumber)
          ? ""
          : "Aadhar Card number should be 12 digits and only contain numbers"
        : "Aadhar Card number is required";
    }

    // tempErrors.file = file ? "" : "Please upload a valid ID proof image";

    setErrors(tempErrors);

    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setLoading(true);
      const readFileAsBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });

      try {
        const [idProofBase64, incomeCertificateBase64] = await Promise.all([
          formData.idProofFile ? readFileAsBase64(formData.idProofFile) : null,
          formData.incomeCertificateFile
            ? readFileAsBase64(formData.incomeCertificateFile)
            : null,
        ]);

        const finalData = {
          ...formData,
          idProofFile: idProofBase64,
          idProofFileName: formData.idProofFile?.name,
          idProofMimeType: formData.idProofFile?.type,
          incomeCertificateFile: incomeCertificateBase64,
          incomeCertificateFileName: formData.incomeCertificateFile?.name,
          incomeCertificateMimeType: formData.incomeCertificateFile?.type,
          type: "userdetails",
          ngoId: user || id,
        };

        const response = await fetch(
          //test "https://script.google.com/macros/s/AKfycbxX4RHRWdYMxaW2uYB5rTgoGh3GDV3e8AudBWXj4027IzCwlsAC3QmqgJY-s7u9Je9V/exec",
          "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors",
            body: JSON.stringify(finalData),
          }
        );

        setFormData({
          idProofType: "",
          useCase: "",
          addressState: "",
          status: "",
          qualification: "",
          occupation: "",
          familyAnnualIncome: "",
          idProofFile: null,
          incomeCertificateFile: null,
        });
        setLoading(false);
        setSnackbarMessage("Data updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error uploading files:", error);
        setSnackbarMessage("Something went wrong!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage("Please correct the fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
    if (!loading) {
      // Navigate to /beneficiarydata after form submission
      navigate("/beneficiarydata");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mb: 2, pb: 2 }}>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => {
          if (field.name === "idProofType") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                {/* <InputLabel>{field.label}</InputLabel> */}
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  // label={field.label}
                  sx={{ textAlign: "left" }}
                  required
                >
                  {idProofOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {formData[field.name] && (
                  <FormControl fullWidth margin="normal">
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        border: "1px solid #5C785A",
                        borderRadius: "100px",
                      }}
                    >
                      Upload ID Proof Image
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileChange(e, "idProofFile")}
                      />
                    </Button>
                    {formData.idProofFile ? (
                      <Typography sx={{ mt: 1 }}>
                        Selected file: {formData.idProofFile.name}
                      </Typography>
                    ) : (
                      errors.idProofFile && (
                        <Typography color="error">
                          {errors.idProofFile}
                        </Typography>
                      )
                    )}
                  </FormControl>
                )}
              </FormControl>
            );
          } else if (field.name === "useCase") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                {/* <InputLabel>{field.label}</InputLabel> */}
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {useCaseOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "status") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                {/* <InputLabel>{field.label}</InputLabel> */}
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {statusOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "dateOfBirth") {
            return (
              <>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                <TextField
                  fullWidth
                  key={field.name}
                  // label={field.label}
                  name={field.name}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </>
            );
          } else if (field.name === "addressState") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                {/* <InputLabel>{field.label}</InputLabel> */}
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  sx={{ textAlign: "left" }}
                >
                  {statesOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "qualification") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                {/* <InputLabel>{field.label}</InputLabel> */}
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {qualification.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "occupation") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                {/* <InputLabel>{field.label}</InputLabel> */}
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {occupation.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "familyAnnualIncome") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                {/* <InputLabel>{field.label}</InputLabel> */}
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {familyAnnualIncome.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else {
            return (
              <>
                <Typography variant="subtitle1" key={field.name}>
                  {field.label}
                </Typography>
                <TextField
                  fullWidth
                  required
                  key={field.name}
                  // label={field.label}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                  error={!!errors[field.name]} // MUI will show a red border if error is true
                  helperText={errors[field.name]}
                />
              </>
            );
          }
        })}
        <FormControl fullWidth margin="normal">
          <Typography variant="subtitle1">Income Certificate</Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{ border: "1px solid #5C785A", borderRadius: "100px" }}
          >
            Upload Income Certificate
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange(e, "incomeCertificateFile")}
              // onChange={handleFileChange}
            />
          </Button>
          {formData.incomeCertificateFile ? (
            <Typography sx={{ mt: 1 }}>
              Selected file: {formData.incomeCertificateFile.name}
            </Typography>
          ) : (
            errors.incomeCertificateFile && (
              <Typography color="error">
                {errors.incomeCertificateFile}
              </Typography>
            )
          )}
        </FormControl>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            mt: 4,
            width: "201px",
            borderRadius: "100px",
            marginLeft: "150px",
            fontSize: "17.7px",
          }}
          type="submit"
          // disabled={loading}
        >
          {loading ? (
            <CircularProgress
              size={24}
              // color="white"
              color="inherit"
              //  sx={{ color: "white" }}
            />
          ) : (
            "Add Benificiary"
          )}
        </Button>
      </form>

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
    </Container>
  );
};

export default FormComponent;
