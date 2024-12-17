import React from "react";
import { Container, Typography, Box } from "@mui/material";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Data Collection and Usage",
      content:
        "We collect personal information such as names, email addresses, and contact details only when voluntarily submitted through forms or email. This information is used to respond to inquiries, provide updates, and facilitate partnerships.",
    },
    {
      title: "Data Sharing",
      content:
        "Sama does not sell, rent, or share your personal data with third parties without your consent, except when required by law or for fulfilling the specific purposes of our mission (e.g., reporting impact to donors).",
    },
    {
      title: "Cookies and Analytics",
      content:
        "Our website may use cookies and analytics tools to understand user behavior, improve functionality, and enhance user experience. By using our site, you agree to the collection of anonymized data for these purposes.",
    },
    {
      title: "Data Security",
      content:
        "We implement industry-standard security measures to protect your data against unauthorized access, disclosure, or misuse. However, no method of transmission over the internet or electronic storage is completely secure.",
    },
    {
      title: "Transparency and Consent",
      content:
        "We are committed to transparency regarding how we use your data. By interacting with our website, you consent to our privacy practices. You can opt out of email communications or request data deletion at any time.",
    },
    {
      title: "Policy Updates",
      content:
        "This privacy policy may be updated periodically to reflect changes in regulations or our practices. The updated policy will be posted on our website with the revision date.",
    },
    {
      title: "Contact Us",
      content:
        "For questions regarding our privacy policy or to exercise your rights, please reach out to us at",
    },
  ];

  return (
    <Container maxWidth="md" sx={{ mb: 5 }}>
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Privacy Policy
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {sections.map((section, index) => (
          <Box key={index}>
            <Typography variant="h6" gutterBottom>
              {section.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {section.content}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
