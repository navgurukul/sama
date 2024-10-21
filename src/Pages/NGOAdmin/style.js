
export const classes = {
    TextField: {
        borderRadius: "8px 8px 8px 8px",
        border: "1px solid var(--gray- med, #BDBDBD)",
        width: {
            xs: '100%',
            sm: '80%',
            md: '60%',
            lg: '480px',
            marginTop: "32px",
        },
    },
    dropdown: {
        m: 1,
        minWidth: 248,
        borderRadius: "8px"
    },
    span: {
        marginLeft: '8px',
        position: "relative",
        bottom: "6px"
    },
    containerBox: {
        width: '100%', overflow: 'hidden', mt: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100px'
    },
    NGODetails: {
        borderRadius: "30px",
        marginTop: "32px",
        padding: "32px"

    },
    NGODetailsBtn: {
        borderRadius: "30px",
        width: "280px",
        height: "48px",
        padding: "8px 24px",
        color: "white",
        background: "var(--primary, #5C785A)",
    },
    Uploaded: {
        borderRadius: "30px",
        width: "280px",
        height: "48px",
        padding: "8px 24px",
        border: "1px solid #5C785A",
        color: "var(--primary, #5C785A)",
    },
    title: {
        color: "#5C785A",
        marginTop: "4px",
        fontWeight: "bold",
    },
    mainContainer: {
        marginTop: "48px"
    },
    selectDropdown: {
        marginRight: "8px",
        color: "#4A4A4A"
    },
    FormControl: {
        m: 1,
        minWidth: 248
    },
    InputLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    arrowicon: {
        width: '24px',
        height: '24px',
        marginLeft: "40px"
    },
    tablePadination: {
        mt: "24px",
        height: "88px"
    },
    buttonContainer: {
        display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: '16px'
    },
    list: {
        width: '100%',
        bgcolor: 'background.paper',
        p: 3,
        background: "#F0F4EF",
        borderRadius: "8px"
    },
    subtitle1 : {
        color: 'var(--text, #4A4A4A)', // CSS variable with fallback color
        fontVariantNumeric: 'lining-nums proportional-nums',
        fontFamily: 'Raleway',
        fontSize: '18px',
        fontStyle: 'normal',
        fontWeight: 700,
        marginTop:"16px",
        lineHeight: '170%', // or '30.6px', depending on your preference
    }

}
