// import * as React from 'react';
// import Timeline from '@mui/lab/Timeline';
// import TimelineItem from '@mui/lab/TimelineItem';
// import TimelineSeparator from '@mui/lab/TimelineSeparator';
// import TimelineConnector from '@mui/lab/TimelineConnector';
// import TimelineContent from '@mui/lab/TimelineContent';
// import TimelineDot from '@mui/lab/TimelineDot';
// import Typography from '@mui/material/Typography'; 

// export default function TimeLine() {
//   const timelineData = [
//     'We collect end-of-life laptops from corporate partners like you',
//     'Our team securely wipes all data from the laptops',
//     'We refurbish the laptops to extend their lifespan',
//     'The laptops are then loaded with educational software',
//     'We distribute the laptops to schools and communities in need',
//     'Teachers receive training on how to use the laptops effectively',
//     'Students gain access to a world of knowledge and learning resources',
//     'Communities benefit from increased digital literacy',
//     'Our program reduces electronic waste and its environmental impact',
//   ];

//   return (
//     <div style={{ backgroundColor: '#F0ECE7', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
//       <Typography variant="h5" component="h2" style={{ color: '#555555', fontWeight: 'bold', padding: '10px 20px', backgroundColor: '#E0E0E0', borderRadius: '16px', display: 'inline-block' }}>
//         Digital Resource Recovery
//       </Typography>
//       <Timeline position="alternate-reverse">
//         {timelineData.map((text, index) => (
//           <TimelineItem key={index} style={{ height: "204px" }}>
//             <TimelineSeparator>
//               <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
//               {index < timelineData.length - 1 && (
//                 <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
//               )}
//             </TimelineSeparator>
//             <TimelineContent sx={{ fontWeight: 'bold' }}>{text}</TimelineContent>
//           </TimelineItem>
//         ))}
//       </Timeline>
//     </div>
//   );
// }



import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';

export default function TimeLine() {
  return (
    <div style={{ backgroundColor: '#F0ECE7', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
      <Typography variant="h5" component="h2" style={{ color: '#555555', fontWeight: 'bold', padding: '10px 20px', backgroundColor: '#E0E0E0', borderRadius: '16px', display: 'inline-block' }}>
        Digital Resource Recovery
      </Typography>
      <Timeline position="alternate-reverse">

        {/* Timeline Item 1 */}
        <TimelineItem style={{ height: "204px" }}>
          <TimelineSeparator>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
            We collect end-of-life laptops from corporate partners like you
          </TimelineContent>
        </TimelineItem>

        {/* Timeline Item 2 */}
        <TimelineItem style={{ height: "204px" }}>
          <TimelineSeparator>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
            Our team securely wipes all data from the laptops
          </TimelineContent>
        </TimelineItem>
        {/* Timeline Item 3 */}
        <TimelineItem style={{ height: "204px" }}>
          <TimelineSeparator>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
            We refurbish the laptops to extend their lifespan
          </TimelineContent>
        </TimelineItem>


        <TimelineItem
          style={{
            height: "2px",
            border: "1px solid red",
            position: "relative",
            width: "500px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography align="center">Digital Inclusion Pipeline</Typography>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
        </TimelineItem>
        <TimelineItem style={{ height: "204px", position: "relative", bottom: "70px" }}>
          <TimelineSeparator>
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
          </TimelineContent>
        </TimelineItem>


        <TimelineItem style={{ height: "204px", position: "relative", bottom: "70px" }}>
          <TimelineSeparator>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
            Communities benefit from increased digital literacy
          </TimelineContent>
        </TimelineItem>

        <TimelineItem style={{ height: "204px", position: "relative", bottom: "70px" }}>
          <TimelineSeparator>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
            Our team securely wipes all data from the laptops
          </TimelineContent>
        </TimelineItem>


        <TimelineItem style={{ height: "204px", position: "relative", bottom: "70px" }}>
          <TimelineSeparator>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
            Our team securely wipes all data from the laptops
          </TimelineContent>
        </TimelineItem>

        <TimelineItem style={{ height: "204px", position: "relative", bottom: "70px" }}>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
            <TimelineConnector style={{ backgroundColor: "#E0E0E0", position: "relative", bottom: "1px", height: "8px", width: "14px" }} />
        

            <TimelineItem
              style={{
                height: "2px",
                border: "1px solid red",
                position: "relative",
                width: "500px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography align="center">Digital Inclusion Pipeline</Typography>
            </TimelineItem>

            {/* Our team securely wipes all data from the laptops */}
          {/* </TimelineContent> */}
        </TimelineItem>

        {/* Timeline Item 9 */}
        <TimelineItem style={{ height: "204px", position: "relative", bottom: "70px" }}>
          <TimelineSeparator>
            <TimelineDot sx={{ margin: 0, padding: 0 }} style={{ width: "22px", height: "22px", border: "10px solid #E0E0E0", position: "relative", bottom: "1px" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ fontWeight: 'bold' }}>
            Our program reduces electronic waste and its environmental impact
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}
