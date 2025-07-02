import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis1() {
  const [data, setData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz1_growth.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["revenue"] = +d["Yearly Worldwide IAP and Subscription Revenue ($B)"];
        d["year"] = +d["Year"];
        delete d["Yearly Worldwide IAP and Subscription Revenue ($B)"];
        delete d["Year"];
      });

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
    <p>Vis1</p>
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border: 1px solid black;"
    >
      <g transform="translate(${margin.left}, ${margin.top})"></g>
    </svg>
  </div>`;
}
