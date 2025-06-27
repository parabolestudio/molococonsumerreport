import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis13() {
  const [data, setData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz12_time_spent_during_day.csv"
    ).then((data) => {
      //   data.forEach((d) => {
      //     d["Value"] = +d["Value"];
      //     d["Year"] = +d["Year"];
      //   });

      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  const width = 100;
  const height = 15;
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return html`<div class="vis-container-inner">
    <p>Vis13</p>
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border: 1px solid black;"
    >
      <g transform="translate(${margin.left}, ${margin.top})"></g>
    </svg>
  </div>`;
}
