import { border, height, maxWidth, textAlign, width } from "@mui/system";

const ourteam = {
    container: {
        textAlign: "center", 
        py: 4, 
        marginTop: "80px",
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
        marginTop: { xs: "50px", md: "0px" },
        marginBottom : {xs : "300px", md: "0px"}
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
        justifyContent: "center",
        marginBottom: { xs: "100px", md: "50px" },
        marginTop: { xs: "50px", md: "0px" },
    },
    image: {
        width: "100%",
        maxWidth: "278px",
        height: "auto",
        borderRadius: "8px",
    },

    //OurGoverment
    GovBox: {
        width: "750px",
        height: "1050px",
        marginLeft: "200px",
    },
    Para: {
        marginTop: "32px",
    },
    secondhead: {
        color: "#4A4A4A",
        marginTop: "80px",
        textAlign : "left",
    },
    Form: {
        marginTop: "32px",
    },
    InputLabel: {
        marginBottom: "5px", 
        color: "#4A4A4A", 
        textAlign: "left" 
    },

    //CommunityPartners
    GreenBox: {
        border: "1px solid black",
        height: "1121px",
        width: "1470px", 
        backgroundColor: "#5C785A",
        marginLeft: "calc(-50vw + 50%)",  // Aligns it to full width
        padding: "50px 0",  // Adjust padding
        marginTop: "50px",
    }

};

export default ourteam;
