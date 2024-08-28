import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import bgImage from "./assets/Group.svg";
export const StepTitle = styled(Typography)({
    fontSize: "24px",
    fontWeight: 'bold',
    fontFamily: "Montserrat",
    lineHeight: "31.6px",
    color: "var(--primary, #5C785A)",
});

export const Item = {
    padding: 16,
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
};


export const container = {
    background: "var(--Primary-Medium, #CED7CE)",
};

export const lgContainer = {
    padding: '16px',
};

export const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    padding: { xs: '20px', sm: '40px' },
    background: "#CED7CE"
}
export const boxStyle = {
    position: 'relative',
    width: { md: '900%', lg: '100%' },
    height: { xs: 'auto', sm: '900px', md: '1000px', lg: '1000px' },
    backgroundSize: 'cover',
    backgroundPosition: 'right',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'left',
    alignItems: 'left',
    padding: { xs: '10px', sm: '20px', md: '30px' },
    boxSizing: 'border-box',
};

export const gridItemStyle = {
    position: 'relative',
    zIndex: 1,
    padding: { xs: '10px', sm: '20px', md: '30px' },
    width: '100%',
    maxWidth: '800px',
    boxSizing: 'border-box',
    margin: 'auto',
};

export const innerBoxStyle = {
    p: { xs: 2, sm: 3, md: 4, lg: 2 },
    width: '100%',
    margin: 'auto',
    marginTop: "30px",
    position: "relative",
    right: "30px"
};

export const typographyTitleStyle = {
    fontFamily: 'Montserrat',
    fontSize: { xs: '20px', sm: '22px', md: '24px' },
    fontWeight: 700,
    lineHeight: '1.3',
    color: "#5C785A",
    mb: 2,

};

export const h6 = {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontSize: "24px",
    lineHeight: "31.6px"
}

export const styles = {
    h5: {
        fontFamily: "Montserrat",
        fontSize: "32px",
        fontWeight: 700,
        lineHeight: "41.6px",
        color: "rgba(92, 120, 90, 1)",

    },
    body1: {
        background: "Raleway",
        fontSize: "18px",
        fontWeight: 400,
        color: "rgba(74, 74, 74, 1)",
        lineHeight: "30.6px",
    }

}




const classes = {
    container: {
        paddingBottom: "80px"
    },
    lgContainer: {
        padding: '16px',
    },
    gridItem: {
        // Styles for grid item
    },
    innerBox: {
        // Styles for inner box
    },
    h6: {
        // Styles for h6
    },
    bgImageBox: {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'left',
    },
    stepNumberBox: {
        display: 'flex',
        marginLeft: { md: 5 },
        justifyContent: {
            xs: 'center',
            sm: 'center',
            md: 'flex-start'
        },
        alignItems: 'center',
    },
    typographyBold: {
        fontWeight: 700,
        color: "var(--text, #4A4A4A)"
    },
    listItem: {
        marginTop: "40px"
    },
    stepContainer: {
        position: "relative",
        top: "70px"
    },
    boxStyle: {
        width: { lg: "531px", sm: "431px", xs: "280px" },
        height: { lg: "60px", sm: "50px", xs: "40px" },
        borderRadius: "32px",
        background: "rgba(206, 215, 206, 1)",
        position: "relative",
        bottom: { lg: "30px", sm: "25px", xs: "20px" },
        padding: { lg: "12px", sm: "9px", xs: "6px" },
    },
    typographyStyle: {
        position: "relative",
        bottom: "45px",
        left: { lg: "35px", sm: "20px", xs: "15px" },
        fontSize: { lg: "1.25rem", sm: "1rem", xs: "0.875rem" },
    },
    boxStyle: {
        width: { lg: "531px", sm: "431px", xs: "280px" },
        height: { lg: "60px", sm: "50px", xs: "40px" },
        borderRadius: "32px",
        background: "rgba(206, 215, 206, 1)",
        position: "relative",
        bottom: { lg: "30px", sm: "25px", xs: "20px" },
        padding: { lg: "12px", sm: "9px", xs: "6px" },
    },
    typographyStyle: {
        position: "relative",
        bottom: "45px",
        left: { lg: "35px", sm: "20px", xs: "15px" },
        fontSize: { lg: "1.25rem", sm: "1rem", xs: "0.875rem" },
    },
    responsiveTypographyStyle: {
        fontSize: {
            lg: "1.25rem",
            md: "1rem",
            sm: "0.875rem",
            xs: "0.75rem",
        },
        textAlign: {
            xs: "center",
            sm: "left",
        },
    },
};

export default classes;
