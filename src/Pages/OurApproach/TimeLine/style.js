import { styled } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';
// import bgImage from "./assets/Group 26.svg";
import { border } from '@mui/system';
export const StepCard = styled(Box)({
    padding: 16,
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

export const StepNumber = styled(Typography)({
    fontSize: "40px",
    fontWeight: 'bold',
    marginBottom: 8,
    color: "white",
    border: "7px solid white",
    borderRadius: "100px",
    width: "60px",
    height: "60px",
    textAlign: "center",
    background: "rgba(92, 120, 90, 1)",
});

export const StepTitle = styled(Typography)({
    fontSize: "24px",
    fontWeight: 'bold',
    fontFamily: "Montserrat",
    lineHeight: "31.6px",
    color: "var(--primary, #5C785A)",
});

export const StepDescription = styled(Typography)({
    marginBottom: 8,
    color: "var(--text, #4A4A4A)",
    fontSize: "18px",
    fontStyle: "normal",
    fontWeight: 400,
    fontFamily: "Raleway",
    lineHeight: "20.6px",
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
    // backgroundImage: `url(${bgImage})`,
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