// import React from 'react';
// import "./style.css";
// import img1 from "./assets/img1.svg";
// import img2 from "./assets/img2.svg";
// import img3 from "./assets/img3.svg";
import img4 from "./assets/img4.svg";
import img5 from "./assets/img5.svg";
import img6 from "./assets/img6.svg";
import img7 from "./assets/img7.svg";
import img8 from "./assets/img8.svg";
// function TimeLine() {
//   const articles = [
//     {
//       id: 1,
//       img: img1,
//       text: "We collect end-of-life laptops from corporate partners like you",
//       date: "",
//       month: ""
//     },
//     {
//       id: 2,
//       img: img2,
//       text: "When I orbited the Earth in a spaceship, I saw for the first time how beautiful our planet is. When I orbited the Earth in a spaceship, I saw for the first time how beautiful our planet is.",
//       date: "",
//       month: ""
//     },
//     {
//       id: 3,
//       img: img3,
//       text: "When I orbited the Earth in a spaceship, I saw for the first time how beautiful our planet is. Mankind, let us preserve and increase this beauty, and not destroy it!",
//       date: "",
//       month: ""
//     }
//   ];

//   return (
//     <section id="conference-timeline">
//       <div className="timeline-start">Digital Resource Recovery</div>
//       <div className="conference-center-line" ></div>
//       <div className="conference-timeline-content">
//         {articles.map((article, index) => (
//           <div key={article.id} className="timeline-article">
//             <div className="content-left-container">
//               <div className="content-left">
//                 {article.img && <img src={article.img} alt={`Article ${index + 1}`} />}
//               </div>
//               {article.author && <span className="timeline-author">{article.author}</span>}
//             </div>
//             <div className="content-right-container">
//               <div className="content-right">
//                 <p>
//                   {article.text} <span className="article-number">0{index + 1}</span>
//                 </p>
//               </div>
//               {article.author && <span className="timeline-author">{article.author}</span>}
//             </div>
//             <div className="meta-date">
//               {article.date && <span className="date">{article.date}</span>}
//               {article.month && <span className="month">{article.month}</span>}
//               {article.author && <span className="timeline-author">{article.author}</span>}
//             </div>
//           </div>
//         ))}

//       </div>
//       <div className="timeline-start">Digital Inclusion Pipeline</div>
//       <div className="conference-center-line"></div>
//       <div className="conference-timeline-content">
//         {articles.map((article, index) => (
//           <div key={index} className="timeline-article">
//             <div className="content-left-container">
//               <div className="content-left">
//                 <p>
//                   {article.text} <span className="article-number">0{index + 1}</span>
//                 </p>
//               </div>
//               <span className="timeline-author">{article.author}</span>
//             </div>
//             <div className="content-right-container">
//               <div className="content-right">
//                 <p>
//                   {article.text} <span className="article-number">0{index + 1}</span>
//                 </p>
//               </div>
//               <span className="timeline-author">{article.author}</span>
//             </div>
//             <div className="meta-date">
//               <span className="date">{article.date}</span>
//               <span className="month">{article.month}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="timeline-start">Digital Tracking and Reporting</div>
//       <div className="conference-center-line"></div>
//       <div className="conference-timeline-content">
//         {articles.map((article, index) => (
//           <div key={index} className="timeline-article">
//             <div className="content-left-container">
//               <div className="content-left">
//                 <p>
//                   {article.text} <span className="article-number">0{index + 1}</span>
//                 </p>
//               </div>
//               <span className="timeline-author">{article.author}</span>
//             </div>
//             <div className="content-right-container">
//               <div className="content-right">
//                 <p>
//                   {article.text} <span className="article-number">0{index + 1}</span>
//                 </p>
//               </div>
//             </div>
//             <div className="meta-date">
//               <span className="date">{article.date}</span>
//               <span className="month">{article.month}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="timeline-point"></div>
//     </section>
//   );
// }

// export default TimeLine;




import React from 'react';
import "./style.css";
import img1 from "./assets/img1.svg";
import img2 from "./assets/img2.svg";
import img3 from "./assets/img3.svg";

function TimeLine() {
  const articles = [
    {
      id: 1,
      img: img1,
      text: "We collect end-of-life laptops from corporate partners like you",
      date: "",
      month: ""
    },
    {
      id: 2,
      img: img2,
      text: "When I orbited the Earth in a spaceship, I saw for the first time how beautiful our planet is. When I orbited the Earth in a spaceship, I saw for the first time how beautiful our planet is.",
      date: "",
      month: ""
    },
    {
      id: 3,
      img: img3,
      text: "When I orbited the Earth in a spaceship, I saw for the first time how beautiful our planet is. Mankind, let us preserve and increase this beauty, and not destroy it!",
      date: "",
      month: ""
    }
  ];

  return (
    <section id="conference-timeline">
      <div className="timeline-start">Digital Resource Recovery</div>
      <div className="conference-center-line" ></div>

      <div className="conference-timeline-content">
        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <img src={articles[0].img} alt="Article 1" />
              <p>We collect end-of-life laptops from corporate partners like you</p>
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[0].date}</span>
            <span className="month">{articles[0].month}</span>
          </div>
        </div>

        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <img src={articles[1].img} alt="Article 2" />
            </div>
          </div>
          <div className="content-right-container">
            <div className="content-right">
              <img src={img2}></img>
              <p>We ensure complete data erasure and privacy protection</p>
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[1].date}</span>
            <span className="month">{articles[1].month}</span>
          </div>
        </div>

        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <img src={articles[2].img} alt="Article 3" />
              <p>We restore and upgrade these laptops for educational use</p>
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[2].date}</span>
            <span className="month">{articles[2].month}</span>
          </div>
        </div>
      </div>

      <div className="timeline-start">Digital Inclusion Pipeline</div>
      <div className="conference-center-line"></div>
      <div className="conference-timeline-content">
        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <img src={img4}></img>
              <p>We create livelihood opportunities through our interventions</p>
            </div>
          </div>
          <div className="content-right-container">
            <div className="content-right">
              <img src={img5}></img>
              <p>We provide an ecosystem of pre-installed online and offline learning resources</p>
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[0].date}</span>
            <span className="month">{articles[0].month}</span>
          </div>
        </div>

        <div className="timeline-article">
          <div className="content-left-container">
            {/* <div className="content-left">
              <img src={img5}></img>
              <p></p>
            </div> */}
          </div>
          <div className="content-right-container">
            <div className="content-right">
              <img src={img5}></img>
              <p>We provide an ecosystem of pre-installed online and offline learning resources</p>
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[1].date}</span>
            <span className="month">{articles[1].month}</span>
          </div>
        </div>

        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <img src={img6}></img>
              <p>We connect with underserved communities through 200+ verified NGOs/Government Institutions</p>
            </div>
          </div>
          <div className="content-right-container">
            {/* <div className="content-right">
              <img src={img7}></img>
              <p>We capture data on laptop’s lifecycle and community impact</p>
            </div> */}
          </div>
          <div className="meta-date">
            <span className="date">{articles[2].date}</span>
            <span className="month">{articles[2].month}</span>
          </div>
        </div>
      </div>

      <div className="timeline-start">Digital Tracking and Reporting</div>
      <div className="conference-center-line"></div>
      <div className="conference-timeline-content">
        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <img src={img7}></img>
              <p>We capture data on laptop’s lifecycle and community impact</p>
              {/* <p>{articles[0].text} <span className="article-number">01</span></p> */}
            </div>
          </div>
          <div className="content-right-container">
            <div className="content-right">
              {/* <img src={8}></img>
              <p>We generate transparent, real-time analytics on ESG outcomes</p> */}
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[0].date}</span>
            <span className="month">{articles[0].month}</span>
          </div>
        </div>

        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <img src={img8}></img>
              <p>We generate transparent, real-time analytics on ESG outcomes</p>
              {/* <p>{articles[1].text} <span className="article-number">02</span></p> */}
            </div>
          </div>
          <div className="content-right-container">
            <div className="content-right">
              <img src={8}></img>
              <p>We generate transparent, real-time analytics on ESG outcomes</p>
              {/* <p>{articles[1].text} <span className="article-number">02</span></p> */}
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[1].date}</span>
            <span className="month">{articles[1].month}</span>
          </div>
        </div>

        <div className="timeline-article">
          <div className="content-left-container">
            <div className="content-left">
              <p>{articles[2].text} <span className="article-number">03</span></p>
            </div>
          </div>
          <div className="content-right-container">
            <div className="content-right">
              <p>{articles[2].text} <span className="article-number">03</span></p>
            </div>
          </div>
          <div className="meta-date">
            <span className="date">{articles[2].date}</span>
            <span className="month">{articles[2].month}</span>
          </div>
        </div>
      </div>

      <div className="timeline-point"></div>
    </section>
  );
}

export default TimeLine;
