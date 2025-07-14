import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Update from "../AdminNgo/assets/upload.png";

const Document = ({ngoData, id}) => {
  const [documents, setDocuments] = useState(null);
//   const { id } = useParams();




  // Fetch documents
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_NgoInformationApi}?type=MultipleDocsGet&&userId=${id}`
      )
      .then((response) => setDocuments(response.data))
      .catch((error) => console.error("Error fetching documents:", error));
  }, [id]);

  if (!documents) {
    return <Typography sx={{mt: 20, textAlign: "center"}}>Loading...</Typography>;
  }

  if (!documents.isDataAvailable) {
    return (
      <Grid
        container
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={Update}
          alt="Centered Update"
          style={{ marginTop: "100px", marginBottom: "50px", maxWidth: "100%", height: "auto" }}
        />
      </Grid>
    );
  }

  const documentKeys = Object.keys(documents)
    .filter(
      (key) =>
        !["isDataAvailable", "User-Id", "NGO Name", "subfolderId"].includes(key) &&
        documents[key].link // Only include documents that have a link
    );

  return (
    <Container maxWidth="sm" sx={{ padding: "24px" }}>
      <Grid container spacing={2}>
        <Typography
          variant="h6"
          color="#4A4A4A"
          paddingLeft="18px"
          gutterBottom
        >
          NGO Documents
        </Typography>
        {documentKeys.map((key, index) => {
          const doc = documents[key];
          
          return (
            <Grid item xs={12} key={index}>
              <Card sx={{ padding: "16px" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                    {key}
                  </Typography>
                  <Button
                    variant="text"
                    href={doc.link}
                    target="_blank"
                    startIcon={<RemoveRedEyeIcon />}
                    sx={{
                      paddingLeft: "5px",
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                        color: "#5C785A",
                      },
                    }}
                  >
                    Preview
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Document;