import { styled } from '@mui/material/styles';
import { Typography} from '@mui/material';
import bgImage from "./assets/Group.svg"
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

export const styles = {
    h5: {
        fontFamily: "Montserrat",
        fontSize: "32px",
        fontWeight: 700,
        lineHeight: "41.6px",
        color: "rgba(92, 120, 90, 1)",
        marginTop: "40px"

    },
    body1: {
        background: "Raleway",
        fontSize: "18px",
        fontWeight: 400,
        color: "rgba(74, 74, 74, 1)",
        lineHeight: "30.6px",
    },
    h6: {
        color: 'var(--primary, #5C785A)',
        fontFamily: 'Montserrat',
        fontSize: '24px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '130%'
    },
    gridContainer: {
        position: "relative",
        top: "30px",
        left: "20px"

    },
    gridContainerSecond: {
        position: "relative",
        top: "70px"
    },
    BgImg: {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'left',
    }

}