
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Card } from '@mui/material';
export const TypographySubtitle1 = styled(Typography)({
    color: '#4A4A4A',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '27.2px',
});
export const TypographyTitle = styled(Typography)({
    color: '#4A4A4A',
    fontFamily: 'Montserrat',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '24px',
});
export const Typographyh6 = styled(Typography)({
    color: '#4A4A4A',
    fontFamily: 'Montserrat',
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '26px',
});

export const TypographyBody2 = styled(Typography)({
    color: '#828282',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    marginTop: '17px',
});
export const TypographyAmountText = styled(Typography)({
    color: '#453722',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '36px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '46.8px',
});


export const StyledButton = styled(Button)(({ theme }) => ({
    right: '15px',
    height: '48px',
    padding: '8px 24px',
    borderRadius: '100px',
    backgroundColor: '#5C785A',
    color: '#ffffff',
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
        backgroundColor: '#4A6347',
        boxShadow: 'none',
    },
    '&:active': {
        backgroundColor: '#5C785A',
        boxShadow: 'none',
    },
    '&:focus': {
        backgroundColor: '#5C785A',
        boxShadow: 'none',
    },
}));

export default StyledButton;

export const StyledSocialImpact = styled(Typography)({
    color: '#4A4A4A',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '27.2px',
    textTransform: 'none',
    backgroundColor: 'transparent',
});

export const TypographyButton = styled(Typography)({
    color: 'var(--white, #FFF)',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '1.7',
});
export const DigitalHardwareText = styled(Typography)({
    color: 'var(--text, #4A4A4A)',
    fontFamily: 'Montserrat',
    fontSize: '32px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '41.6px',
    position: "relative",
    bottom: "5px"
});

export const Typographyh5 = styled(Typography)({
    color: 'var(--text, #4A4A4A)',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '130%',
});
export const StyledCard = styled(Card)({
    height: '100%',
});

export const styles = {
    subtitle1: {
        fontFamily: "Raleway",
        fontSize: "18px",
        fontWeight: 700,
        lineHeight: "30.6px",
        color: "var(--text, #4A4A4A)",
    },
    h5: {
        color: "var(--secondary, #453722)",
        fontSize: "32px",
        fontWeight: 700,
        lineHeight: "41.6px"
    },
    body2: {
        fontSize: "14px",
        fontFamily: "Raleway",
        fontWeight: 400,
        lineHeight: "30.6px"

    },
    body1: {
        fontFamily: " Raleway",
        fontWeight: 400,
        fontSize: "18px",
        lineHeight: "30.6px",
        color: "var(--text, #4A4A4A)"
    },doublequotation:{
        color: "var(--gray-light, #E0E0E0)",
        fontFamily:" Montserrat",
        fontSize:"64px"
    }
};
