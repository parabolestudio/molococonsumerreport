import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis11() {
  const [genreData, setGenreData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [demographicsData, setDemographicsData] = useState([]);
  const [appData, setAppData] = useState([]);

  const URL =
    "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/";
  const fileName1 = "Viz11_1_genre_overview.csv";
  const fileName2 = "Viz11_2_gender.csv";
  const fileName3 = "Viz11_3_demographics.csv";
  const fileName4 = "Viz11_4_top_apps.csv";

  useEffect(() => {
    Promise.all([
      d3.csv(URL + fileName1),
      d3.csv(URL + fileName2),
      d3.csv(URL + fileName3),
      d3.csv(URL + fileName4),
    ]).then(function (files) {
      console.log("Files loaded:", files);
      const [file1, file2, file3, file4] = files;
    });
  }, []);

  // // Fetch data on mount
  // useEffect(() => {
  //   d3.csv(
  //     "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz12_time_spent_during_day.csv"
  //   ).then((data) => {
  //     //   data.forEach((d) => {
  //     //     d["Value"] = +d["Value"];
  //     //     d["Year"] = +d["Year"];
  //     //   });

  //     setData(data);
  //   });
  // }, []);

  // if (data.length === 0) {
  //   return html`<div>Loading...</div>`;
  // }

  const vis11Container = document.querySelector("#vis11");
  const width =
    vis11Container && vis11Container.offsetWidth
      ? vis11Container.offsetWidth
      : 600;

  return html`<div class="vis-container-inner">
    <${Vis11Top} />
    <${Vis11Bottom} />
  </div>`;
}

const Vis11Top = (props) => {
  const pillList = ["Gaming", "RMG", "Content"];

  const dotCount1 = 27;
  const dotCount2 = 15;

  return html`<div class="vis-11-part vis-11-top">
    <p class="title">Category Name</p>
    <div class="vis-11-top-grid">
      <div class="element1">
        <p class="number">88</p>
        <p class="label">IAE apps used</p>
        <p class="sublabel">in the past 30 days</p>
      </div>
      <div class="element2"><${DotSection} dotCount="${dotCount1}" /></div>
      <div class="element3">
        <p class="number">27</p>
        <p class="label">Ad opportunities</p>
        <p class="sublabel">in the past 24 hours</p>
      </div>
      <div class="element4"><${DotSection} dotCount="${dotCount2}" /></div>
      <div class="element5">
        <p class="label">Top ad opportunities</p>
      </div>
      <div class="element6">
        ${pillList.map((pill) => html`<div class="pill label">${pill}</div>`)}
      </div>
    </div>
  </div>`;
};

const DotSection = ({ dotCount }) => {
  return html`<div class="dots">
    ${Array.from(
      { length: dotCount },
      (_, i) => html`<div class="dot" key=${i}></div>`
    )}
  </div>`;
};

const Vis11Bottom = () => {
  const genderData = [
    {
      group: "Women",
      value: 19,
    },
    {
      group: "Men",
      value: 81,
    },
  ];

  const ageData = [
    {
      group: "18-34",
      value: 50,
    },
    {
      group: "35-54",
      value: 41,
    },
    {
      group: "55+",
      value: 9,
    },
  ];

  const genderTemplateColumns = genderData.map((d) => `${d.value}%`).join(" ");
  const genderGridElements = genderData.map(
    (d, i) => html`<div style="grid-area: 1 / ${i + 1} / 2 / ${i + 1};">
        <p class="sublabel">${d.group}</p>
      </div>
      <div style="grid-area: 2 / ${i + 1} / 3 / ${i + 1};" class="bar">
        <p class="number">${d.value}%</p>
      </div>`
  );
  const ageTemplateColumns = ageData.map((d) => `${d.value}%`).join(" ");
  const ageGridElements = ageData.map(
    (d, i) => html`<div style="grid-area: 1 / ${i + 1} / 2 / ${i + 1};">
        <p class="sublabel">${d.group}</p>
      </div>
      <div style="grid-area: 2 / ${i + 1} / 3 / ${i + 1};" class="bar">
        <p class="number">${d.value}%</p>
      </div>`
  );

  return html`<div class="vis-11-part vis-11-bottom">
    <div class="vis-11-bottom-top-grid">
      <div class="left">
        <p class="label">Where people spend their time</p>
        <p class="sublabel">Time spent vs general population</p>
      </div>
      <div class="right">
        <p class="label">Which apps are trending</p>
        <p class="sublabel">Top 3 ad supported apps</p>
      </div>
    </div>
    <div>
      <p class="label">Who uses the apps</p>
      <div
        class="vis-11-grid-gender"
        style="grid-template-columns: ${genderTemplateColumns};"
      >
        ${genderGridElements}
      </div>
      <div
        class="vis-11-grid-age"
        style="grid-template-columns: ${ageTemplateColumns};"
      >
        ${ageGridElements}
      </div>
    </div>
  </div>`;
};
