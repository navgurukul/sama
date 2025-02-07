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
        textAlign:{sx:"center", md: "left" }
    },
    paragraphText: {
        color: "#666",
        textAlign:{sx:"center", md: "left" }    },
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
        width: { xs: "100%", md:  "750px" },
        height: { xs: "100%", md:  "1050px" },
        marginLeft: { xs: "0px", md:  "200px" },
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
        height:"100%",
        width:{ xs: "100%", md:  "1470px" }, 
        backgroundColor: "#5C785A",
        marginLeft: "calc(-50vw + 50%)",  // Aligns it to full width
        padding: { xs: "30px 16px", md: "50px 0" },
        marginTop: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center content on smaller screens

    },

    Box1: {
        width: { xs: "90%", sm: "80%", md: "496px" }, // Responsive width
        height: { xs: "auto", md: "237px" },
        padding: { xs: "20px", md: "24px" },
        borderRadius: "8px",
        backgroundColor: "#F7F7F7",
        marginLeft:{xs: "0px", md:  "160px" },
        marginRight: { xs: "auto", md: "0px" },
        marginTop: "32px",
    },
    Box2: {
        width: { xs: "90%", sm: "80%", md: "496px" }, // Responsive width
        height: { xs: "auto", md: "392px" }, // Auto height on small screens
        padding: { xs: "20px", md: "24px" },
        borderRadius: "8px",
        backgroundColor: "#F7F7F7",        
        marginTop: { xs: "auto", md: "32px" },
        marginRight: { xs: "auto", md: "0px" },
        marginLeft: {xs: "0px", md: "-17px" },
    },
    Box3: {
        width: { xs: "90%", sm: "80%", md: "496px" }, // Responsive width
        height: { xs: "auto", md: "516px" }, // Auto height on small screens
        padding: { xs: "20px", md: "24px" },
        borderRadius: "8px",
        backgroundColor: "#F7F7F7",        
        marginLeft: {xs: "0px", md: "160px" },
        marginRight: { xs: "auto", md: "0px" },
        marginTop: { xs: "auto", md: "-155px" },
    },
    Box4: {
        width: { xs: "90%", sm: "80%", md: "496px" }, // Responsive width
        height: { xs: "auto", md: "206px" }, // Auto height on small screens
        padding: { xs: "20px", md: "24px" },
        borderRadius: "8px",
        backgroundColor: "#F7F7F7",
        marginRight: { xs: "auto", md: "0px" },
        marginLeft: {xs: "0px", md: "-17px" },
    },
    ComForm : {
        width: { xs: "100%", md:  "750px" },
        height: { xs: "100%", md:  "1050px" },
        marginLeft: { xs: "0px", md:  "200px" },
        marginBottom:{xs: "0px", md: "160px"},
    },

    //ImgBox

    Main : {
        width: "100%", 
        padding: "20px", 
        marginTop: "32px", 
    },
    Image1 : {
        width: "94.4", 
        height: "88px",
        padding: "16px"   ,    
    },
    Image2 : {
        width: "88px", 
        height: "88px",
        padding: "16px"
    },
    Image3 : {
        width: "306px", 
        height: "88px",
        padding: "16px"
    },
    Image4 : {
        width: "85.3px", 
        height: "88px",
        padding: "16px"
    },
    Image5 : {
        width: "97.3px", 
        height: "88px",
        padding: "16px"
    },
    Image6 : {
        width: "91.4px", 
        height: "88px",
        padding: "16px"
    },
    Image7 : {
        width: "417px", 
        height: "88px",
        padding: "16px"
    },
    Image8 : {
        width: "143", 
        height: "88px",
        padding: "16px"
    },


    //About Us
    FullBox:{
        height:{ xs: "100%", md:  "237px" },
        width:{ xs: "100%", md:  "1470px" }, 
        backgroundColor: " #F0F4EF",
        marginLeft: "calc(-50vw + 50%)",  // Aligns it to full width
        padding: { xs: "30px 16px", md: "80px 0" },
        marginTop: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center content on smaller screens

    },
};

export default ourteam;
