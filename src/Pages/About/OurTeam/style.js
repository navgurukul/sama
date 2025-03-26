import { Margin } from "@mui/icons-material";
import { border, height, margin, maxHeight, maxWidth, padding, spacing, textAlign, width } from "@mui/system";
import { Radius } from "lucide-react";

const ourteam = {
    container: {
        textAlign: "center", 
        py: 4, 
        marginTop: {xs:"10px", md:"40px"},
    },
    gridContainer: {
        marginTop: "40px",
    },
    gridItem: {
        display: "flex", 
        justifyContent: "center",
        margin: {xs:"2px 10px", md: "0px"},
    },
    card: {
        width: "450px", 
        height: "280px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        overflow: "hidden", 
        borderRadius: "0px",
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
        gap: "16px",
    },
    typographyBody: {
        textAlign: { xs: "center", md: "left" }
    },
    button: {
        marginTop: "0px",
        height: "48px",
        width: { xs: "75%", md: "287px" },
        fontSize: { xs: "14px", md: "17px" }
    },
    StayConnectedGrid:{
        backgroundColor: "#FFFAF8", 
        
    },
    mainGrid: {
        // height: "456px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFAF8",        
        // marginTop: { xs: "50px", md: "0px" },
        // marginBottom : {xs : "300px", md: "0px"}
        padding:"80px 0px",
    },
    leftGrid: {
        // width: "1121px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    headingText: {
        color: "#4A4A4A",
        // textAlign:{sx:"center", md: "left" }
    },
    paragraphText: {
        color: "#666",
        // textAlign:{sx:"center", md: "left" }    
    },
    inputField: {
        width: "100%",
        maxWidth: "360px",
        height :"55px",
        borderRadius: "8px",
        textAlign :"left",
        backgroundColor: "white",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "#E0E0E0",
                borderRadius: "8px",
            },
            "&:hover fieldset": {
                borderColor: "#BDBDBD", 
            },
            "&.Mui-focused fieldset": {
                borderColor: "primary", 
            },
        },
    },
    subscribeButton: {
        width: "150px",
        height: "48px",
        fontSize: "16px",
    },
    rightGrid: {
        marginBottom: { xs: "100px", md: "50px" },
        marginTop: { xs: "50px", md: "0px" },
    },
    image: {
        width: "278px",
        height: "256px",
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
    Communitycontainer: {
        textAlign: "center", 
        py: 4, 
    },
    GreenBox: {
        height:"100%",
        backgroundColor: "#5C785A",
        padding: { xs: "30px 32px", md: "80px 0" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center content on smaller screens

    },

    Box1: {
        backgroundColor: "#F7F7F7",
        borderRadius: "8px",
        padding: "24px",
        
    },

    ComForm : {
        width: { xs: "100%", md:  "750px" },
        marginLeft: { xs: "0px", md:  "200px" },
        marginTop: "80px",
        marginBottom: "40px",
    },
    TextField:{
        backgroundColor: "white",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "#E0E0E0",
                borderRadius: "8px",
            },
            "&:hover fieldset": {
                borderColor: "#BDBDBD", 
            },
            "&.Mui-focused fieldset": {
                borderColor: "primary", 
            },
        },
            
    },
    TextField:{
        backgroundColor: "white",
        borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "#E0E0E0",
                borderRadius: "8px",
            },
            "&:hover fieldset": {
                borderColor: "#BDBDBD", 
            },
            "&.Mui-focused fieldset": {
                borderColor: "primary", 
            },
        },
            
    },

    //ImgBox

    Main : {
        width: "100%", 
        padding: "20px", 
    },
    Image : {
        height: "88px",
        padding: "16px"   ,    
    },
    
    //Coroporate Logo Box
    Logo1: {
        widht:"288px",
        height: "116px",
        padding: "32px",
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "2",
        
    },
    //OurApproach
    ApproachBox:{
        justifyItems:"center",
    },
    //About Us
    FullBox:{
        // height:{ xs: "100%", md:  "237px" },
        backgroundColor: " #F0F4EF",
        padding: "80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", 
        marginTop: "80px",
    },
    AboutCard: {
        height: "420px",
        borderRadius: "8px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",   
          
    },
};

export default ourteam;
