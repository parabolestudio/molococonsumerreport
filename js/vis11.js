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

  const width = 100;
  const height = 15;
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return html`<div class="vis-container-inner">
    <p>Vis11</p>
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border: 1px solid black;"
    >
      <g transform="translate(${margin.left}, ${margin.top})"></g>
    </svg>
  </div>`;
}
