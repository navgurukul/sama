import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { styles } from "./style";
import { Container, styled } from '@mui/system';
import { skills, JobData } from './data.js';
import Avatar from '@mui/material/Avatar';

import { useEffect, useState, useRef, useMemo } from 'react';
import { IndiaMap } from './IndiaMap';

const fallbackStateImpacts = [
    { svgId: "IN-MH", name: "Maharashtra", peopleReached: 25300, ngoPartners: 4, devicesDonated: 2000 },
    { svgId: "IN-MP", name: "Madhya Pradesh", peopleReached: 21600, ngoPartners: 4, devicesDonated: 1700 },
    { svgId: "IN-UP", name: "Uttar Pradesh", peopleReached: 20400, ngoPartners: 4, devicesDonated: 1600 },
    { svgId: "IN-KA", name: "Karnataka", peopleReached: 15300, ngoPartners: 3, devicesDonated: 1200 },
    { svgId: "IN-RJ", name: "Rajasthan", peopleReached: 14000, ngoPartners: 3, devicesDonated: 1100 },
    { svgId: "IN-TN", name: "Tamil Nadu", peopleReached: 12700, ngoPartners: 3, devicesDonated: 1000 },
    { svgId: "IN-GJ", name: "Gujarat", peopleReached: 11500, ngoPartners: 3, devicesDonated: 900 },
    { svgId: "IN-WB", name: "West Bengal", peopleReached: 10200, ngoPartners: 3, devicesDonated: 800 },
    { svgId: "IN-TG", name: "Telangana", peopleReached: 8900, ngoPartners: 2, devicesDonated: 700 },
    { svgId: "IN-BR", name: "Bihar", peopleReached: 8300, ngoPartners: 2, devicesDonated: 650 },
    { svgId: "IN-CT", name: "Chhattisgarh", peopleReached: 5700, ngoPartners: 1, devicesDonated: 450 },
    { svgId: "IN-OR", name: "Odisha", peopleReached: 5100, ngoPartners: 2, devicesDonated: 400 },
    { svgId: "IN-AP", name: "Andhra Pradesh", peopleReached: 8900, ngoPartners: 3, devicesDonated: 700 },
    { svgId: "IN-AS", name: "Assam", peopleReached: 7000, ngoPartners: 2, devicesDonated: 550 },
    { svgId: "IN-HR", name: "Haryana", peopleReached: 6400, ngoPartners: 2, devicesDonated: 500 },
    { svgId: "IN-JH", name: "Jharkhand", peopleReached: 5700, ngoPartners: 2, devicesDonated: 450 },
    { svgId: "IN-KL", name: "Kerala", peopleReached: 5700, ngoPartners: 2, devicesDonated: 450 },
    { svgId: "IN-PB", name: "Punjab", peopleReached: 5100, ngoPartners: 2, devicesDonated: 400 },
    { svgId: "IN-UT", name: "Uttarakhand", peopleReached: 4500, ngoPartners: 2, devicesDonated: 350 },
    { svgId: "IN-HP", name: "Himachal Pradesh", peopleReached: 4500, ngoPartners: 1, devicesDonated: 350 },
    { svgId: "IN-AR", name: "Arunachal Pradesh", peopleReached: 3200, ngoPartners: 1, devicesDonated: 250 },
];

const fallbackNationalImpact = {
    name: "All India",
    peopleReached: 396176,
    ngoPartners: 88,
    devicesDonated: 16302,
};

const StyledCard = styled(Card)({
    height: '100%',
    borderRadius: '8px',
    background: '#FFF',
    boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
});
const students = [
    {
        src: require('./assets/Komal.png'),
        name: "Komal Chaudhary (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it",
    },
    {
        src: require('./assets/ZiyaImg .png'),
        name: "Ziya Afreen (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "This laptop isn't just a tool. It is my bridge from being a novice to a full-fledged future software developer",
    },
    {
        src: require('./assets/shahnaaz.jpg'),
        name: "shahnaaz (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
        src: require('./assets/riya.png'),
        name: "Riya kumari (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "From not knowing how to use a laptop to S&P Global employee: NavGurukul's tech-enabled training launched my career in just one year."
    },
    {
        src: require('./assets/anjali.jpg'),
        name: "anjali Singh (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "With a laptop as my tool, I've transitioned from a NavGurukul " +
            "student to an academic intern, connecting with diverse learners across India and fostering personal growth."
    },



];

const SocialImpactPage = ({data}) => {
    const [isScrolling, setIsScrolling] = useState(true);
    const [currentY, setCurrentY] = useState(0);
    const containerRef = useRef(null);

    const [selectedStateId, setSelectedStateId] = useState(null);
    const [liveStateImpacts, setLiveStateImpacts] = useState(fallbackStateImpacts);
    const [liveNationalImpact, setLiveNationalImpact] = useState(fallbackNationalImpact);

    useEffect(() => {
        let baseUrl = 'http://localhost:8000';
        if (process.env.REACT_APP_NgoInformationApi && !process.env.REACT_APP_NgoInformationApi.includes('script.google.com')) {
            baseUrl = process.env.REACT_APP_NgoInformationApi.replace('/ngo-exec', '');
        }
        fetch(`${baseUrl}/api/public/live-map-stats`)
            .then((res) => res.json())
            .then((json) => {
                if (json.status === "success" && json.data) {
                    const fetchedData = json.data;
                    let totalDevices = 0;
                    let totalPeople = 0;
                    let totalNGOs = 0;

                    const updatedStateImpacts = fallbackStateImpacts.map((fallbackState) => {
                        const liveMatch = fetchedData.find(
                            (d) => d.state?.toLowerCase() === fallbackState.name.toLowerCase()
                        );
                        
                        if (liveMatch) {
                            totalDevices += liveMatch.devices_donated;
                            totalPeople += liveMatch.people_reached;
                            totalNGOs += liveMatch.ngo_partners;
                            
                            return {
                                ...fallbackState,
                                devicesDonated: liveMatch.devices_donated,
                                peopleReached: liveMatch.people_reached,
                                ngoPartners: liveMatch.ngo_partners
                            };
                        }
                        return fallbackState;
                    });

                    setLiveStateImpacts(updatedStateImpacts);
                    setLiveNationalImpact({
                        name: "All India",
                        devicesDonated: json.national?.devices_donated ?? totalDevices,
                        peopleReached: json.national?.people_reached ?? totalPeople,
                        ngoPartners: json.national?.ngo_partners ?? totalNGOs,
                    });
                }
            })
            .catch((err) => console.error("Failed to fetch live stats:", err));
    }, []);

    const selectedState = useMemo(
        () => liveStateImpacts.find((state) => state.svgId === selectedStateId) ?? null,
        [selectedStateId, liveStateImpacts]
    );

    const detail = selectedState ?? liveNationalImpact;

    useEffect(() => {
        let animationFrame;
        const step = () => {
            if (isScrolling) {
                setCurrentY(prevY => {
                    const nextY = prevY - 1;
                    const contentHeight = containerRef.current ? containerRef.current.scrollHeight / 2 : 0;
                    if (contentHeight && Math.abs(nextY) >= contentHeight) {
                        return 0;
                    }
                    if (containerRef.current) {
                        containerRef.current.style.transform = `translateY(${nextY}px)`;
                    }
                    return nextY;
                });
            }
            animationFrame = requestAnimationFrame(step);
        };
        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
    }, [isScrolling]);

    const handleMouseEnter = () => {
        setIsScrolling(false);
    };

    const handleMouseLeave = () => {
        setIsScrolling(true);
    };
    const stats = {
        laptopsDistributed: data?.laptopsDistributed || 16302,
        beneficiariesImpacted: data?.beneficiariesImpacted || 396176,
        femalesReached: data?.femalesReached || 204932,
        schoolsReached: data?.schoolsReached || 3124
    };

    const dynamicCards = [
        { title: "LAPTOPS DISTRIBUTED", number: stats.laptopsDistributed.toLocaleString() },
        { title: "BENEFICIARIES IMPACTED", number: stats.beneficiariesImpacted.toLocaleString() },
        { title: "FEMALES REACHED", number: stats.femalesReached.toLocaleString() },
        { title: "SCHOOLS REACHED", number: stats.schoolsReached.toLocaleString() }
    ];

    return (
        <>
            <Container maxWidth="xl">
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {dynamicCards.map((item, index) => (
                        <Grid item xs={12} md={3} key={index}>
                            <StyledCard sx={{ p: 0.5 }}>
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography variant="subtitle2" style={{...styles.subtitle1, fontSize: '11px', textTransform: 'uppercase'}}>{item.title}</Typography>
                                    <Typography style={styles.h5} variant="h6" color="primary" sx={{ mt: 0.5, fontWeight: 700 }}>{item.number}</Typography>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={2} mt={2}>
                    <Grid item xs={12}>
                        <StyledCard>
                            <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} md={7}>
                                        <Box>
                                            <Typography variant="subtitle2" style={{...styles.subtitle1, fontSize: "16px"}}>See where Sama is already building</Typography>
                                            <Typography variant="h4" style={{...styles.h5, fontSize: "28px", marginTop: "4px"}} color="primary">India, mapped.</Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5, mb: 1.5 }} style={styles.body2}>
                                                Explore the states where retired devices are already creating access, opportunity, and local partnerships.
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <IndiaMap
                                                variant="light-interactive"
                                                activeStates={liveStateImpacts}
                                                selectedStateId={selectedStateId}
                                                onSelectState={setSelectedStateId}
                                            />
                                        </Box>
                                        <Box className="map-legend" sx={{ mt: 2 }}>
                                            <span><i className="map-legend__swatch map-legend__swatch--active" />Active state</span>
                                            <span><i className="map-legend__swatch map-legend__swatch--inactive" />Not yet active</span>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Box sx={{ 
                                            backgroundColor: '#453722', 
                                            borderRadius: '24px', 
                                            color: '#FFF', 
                                            p: 3,
                                            pb: 4,
                                            m: '4px',
                                            height: 'calc(100% - 8px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            boxSizing: 'border-box'
                                        }}>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    Choose a State
                                                </Typography>
                                                <Box sx={{ position: 'relative', width: '100%', marginTop: '8px' }}>
                                                    <select
                                                        value={selectedStateId || "all-india"}
                                                        onChange={(event) => setSelectedStateId(
                                                            event.target.value === "all-india" ? null : event.target.value,
                                                        )}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 40px 12px 16px',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                                            backgroundColor: 'transparent',
                                                            color: '#FFF',
                                                            fontSize: '16px',
                                                            outline: 'none',
                                                            cursor: 'pointer',
                                                            appearance: 'none',
                                                            WebkitAppearance: 'none',
                                                            MozAppearance: 'none'
                                                        }}
                                                    >
                                                        <option value="all-india" style={{ color: '#000' }}>All India</option>
                                                        {liveStateImpacts.map((state) => (
                                                            <option value={state.svgId} key={state.svgId} style={{ color: '#000' }}>{state.name}</option>
                                                        ))}
                                                    </select>
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            right: '16px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            pointerEvents: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box sx={{ mt: 22 }}>
                                                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.8)' }}>
                                                    {selectedState ? "Active State" : "Nationwide Impact"}
                                                </Typography>
                                                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, fontFamily: 'Raleway', color: '#FFF' }}>
                                                    {detail.name}
                                                </Typography>
                                                <Box sx={{ mt: 4 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', py: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#FFF' }}>People reached</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFF' }}>{detail.peopleReached.toLocaleString("en-IN")}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', py: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#FFF' }}>NGO partners</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFF' }}>{detail.ngoPartners.toLocaleString("en-IN")}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#FFF' }}>Devices donated</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFF' }}>{detail.devicesDonated.toLocaleString("en-IN")}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="" sx={{ mt: 2, ml: 2 }} style={styles.subtitle1}>SKILLS IMPARTED</Typography>
                        <Grid container spacing={3} style={{ padding: "16px" }}>
                            {skills.map((skill, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Box display="flex" alignItems="center">
                                        <img src={skill.icon} alt={skill.name} style={{ marginRight: '12px' }} />
                                        <Typography style={styles.body2} variant="body2">{skill.name}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Grid container style={{ padding: "16px" }}>
                            <Typography variant="h6" style={styles.subtitle1}>
                                STUDENT SPEAKS
                            </Typography>
                            <Grid item xs={12} md={12} sx={{ mt: 4 }}>
                                <Box
                                    sx={{
                                        overflow: 'hidden',
                                        position: 'relative',
                                        height: '220px',
                                    }}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Box
                                        ref={containerRef}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            transform: `translateY(${currentY}px)`,
                                        }}
                                    >
                                        {[...students, ...students].map((student, index) => (
                                            <Box key={index}>
                                                <Box display="flex" alignItems="center">
                                                    <Box
                                                    >
                                                        <Avatar
                                                            alt="Remy Sharp"
                                                            src={student.src}
                                                            style={{
                                                                width: student.width,
                                                                height: student.height,
                                                                marginRight: '8px',
                                                            }}
                                                        >
                                                            B
                                                        </Avatar>
                                                    </Box>
                                                    <Box sx={{ ml: 3, mt: 3 }}>
                                                        <Typography variant="subtitle1" style={styles.subtitle1}>
                                                            {`"${student.text}"`}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            style={styles.body2}
                                                            sx={{ mt: 2 }}
                                                        >
                                                            {student.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default SocialImpactPage;