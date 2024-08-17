import digital_literacy_icon from "./assets/megaphone marketing.png";
import data_entry_icon from "./assets/reshot-icon-line-guide-QMNCS4ZPL2.png";
import graphic_design_icon from "./assets/reshot-icon-world-data-GMCNH7W92L.png";
import customer_service_icon from "./assets/Group (2).png";
import deepLearning from "./assets/reshot-icon-deep-learning.png";

export const data = {
    wasteReduction: 1956,
    wasteBreakup: {
        Plastic: 1222.5,
        Aluminium: 489,
        Copper: 244.5,
        Gold: 0.0203,
        Silver: 0.203,
    },
    toxicWasteReduction: 7009,
    toxicWasteBreakup: {
        Lead: 5705,
        Mercury: 407.5,
        Cadmium: 81.5,
        Chromium: 815,
    },
};
export const skills = [
    { name: 'Digital Literacy', icon: deepLearning },
    { name: 'Online Marketing', icon: digital_literacy_icon },
    { name: 'Data Entry', icon: graphic_design_icon },
    { name: 'Basic Graphic Design', icon: data_entry_icon },
    { name: 'Customer Service', icon: customer_service_icon }
];


export const JobData = [
    { title: 'Digital Inclusion', number: '914', description: 'Beneficiaries received refurbished laptops' },
    { title: 'Job Creation', number: '314', description: 'Students started working in their first job' },
    { title: 'Careers Enabled', number: '394', description: 'Students being trained currently' },
    { title: 'Trainers Enabled', number: '102', description: 'People trained in teaching students' },
    { title: 'Learning Hours', number: '3940', description: 'Hours of daily learning across campuses' },
];
