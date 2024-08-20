
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
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


export const TypographyButton = styled(Typography)({
    color: 'var(--white, #FFF)',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '1.7',
});

export const styles = {
    h6: {
        fontSize: "24px",
        color: "var(--text, #4A4A4A)",
        fontStyle: "normal",
        fontWeight: 700
    },
    socialImpactCard: {
        position: "relative",
        bottom: "14px"
    },
    subtitle1:{
        fontSize:"18px",
        fontWeight:700
    }
};
