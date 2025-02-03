import { maxWidth, textAlign } from "@mui/system";

const ourteam = {
    container: {
        textAlign: "center", 
        py: 4, 
        marginTop: "80px"
    },
    gridContainer: {
        marginTop: "40px"
    },
    gridItem: {
        display: "flex", 
        justifyContent: "center"
    },
    card: {
        width: "450px", 
        height: "280px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        overflow: "hidden", 
        borderRadius: "0px"
    },
    cardMedia: {
        width: "100%", 
        height: "100%", 
        objectFit: "cover"
    },
    box: {
        width: { xs: "100%", md: "726px" },
        minHeight: "423px",
        padding: { xs: "0px", md: "32px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px"
    },
    typographyBody: {
        textAlign: "left"
    },
    button: {
        marginTop: "0px",
        height: "48px",
        width: { xs: "75%", md: "287px" },
        fontSize: { xs: "14px", md: "17px" }
    },
    mainGrid: {
        height: "456px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    leftGrid: {
        width: "1121px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    headingText: {
        color: "#4A4A4A",
        textAlign: "left"
    },
    paragraphText: {
        color: "#666",
        textAlign: "left"
    },
    inputField: {
        width: "100%",
        maxWidth: "360px",
        height :"55px",
        borderRadius: "8px",
        textAlign :"left",
    },
    subscribeButton: {
        width: "150px",
        height: "48px",
        fontSize: "16px",
    },
    rightGrid: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "50px",
    },
    image: {
        width: "100%",
        maxWidth: "278px",
        height: "auto",
        borderRadius: "8px",
    },
};

export default ourteam;
