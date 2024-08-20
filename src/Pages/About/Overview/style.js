import { styled } from '@mui/material/styles';
export const ContainerStyle = {
    marginTop: { md: '80px', xs: "14px" },
    width: "100%",
};

export const PaperStyle = {
    padding: { xs: "23px", md: "24px", sm: "20px",lg:"30px" },
    borderRadius: '16px',
    margin: { xs: '10 auto', md: '0 0 0 0px', lg: '0 0 0 92px' },
    zIndex: 8,
    width: { xs: "auto", md: "100%", lg: "70%" },
    position: 'relative',
    marginTop: { xs: '40px', md: '45px', lg: '40px' },
};

export const TypographyH4Style = {
    marginBottom: '16px',
    color: 'var(--primary, #5C785A)',
    fontFamily: 'Montserrat',
    fontSize: '32px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '130%',
};

export const TypographyBodyStyle = {
    marginBottom: '30px',
    color: 'var(--text, #4A4A4A)',
    fontFamily: 'Raleway',
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '170%',
};

export const BoxStyle = {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: { xs: 'center', md: 'flex-end' },
    background: {
        xs: 'linear-gradient(to right, var(--primary, #5C785A) 100%, transparent 100%)',
        md: 'linear-gradient(to right, var(--primary, #5C785A) 100%, transparent 100%)',
        lg: 'linear-gradient(to right, var(--primary, #5C785A) 90%, transparent 90%)',
    },
    borderRadius: {
        lg: '100 10px 100px 0',
    },
    padding: { xs: '24px', md: '15px', lg: '20px' },
    position: 'relative',
    margin: { xs: '0 auto', md: '0 0 0 -40px', lg: '0 0 0 -380px' },
    borderRadius: '16px',
};

export const ImageStyle = {
    width: '100%',
    height: 'auto',
    maxWidth: "468.23px",
};
