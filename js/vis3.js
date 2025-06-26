import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis3() {
  const [data, setData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz3_roas_spend.csv"
    ).then((data) => {
      // parse ROAS and Spend as numbers, e.g. '382,378,781' to 382378781
      data.forEach((d) => {
        d["ROAS"] = +d["ROAS"].replace(/,/g, "");
        d["Spend"] = +d["Spend"].replace(/,/g, "");
      });

      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // layout dimensions
  const width = 600;
  const height = 600;
  const margin = { top: 5, right: 5, bottom: 20, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const minROAS = d3.min(data, (d) => d["ROAS"]);
  const maxROAS = d3.max(data, (d) => d["ROAS"]);
  const minSpend = d3.min(data, (d) => d["Spend"]);
  const maxSpend = d3.max(data, (d) => d["Spend"]);
  const testPadding = 20; // padding for the scales for testing purposes
  const spendScale = d3
    .scaleLinear()
    .domain([minSpend, maxSpend])
    .range([0 + testPadding, innerWidth - testPadding]);
  const roasScale = d3
    .scaleLinear()
    .domain([minROAS, maxROAS])
    .range([innerHeight - testPadding, 0 + testPadding]);

  const dotSize = 10;
  const legendLineDistance1 = 15;
  const legendLineDistance2 = 15;

  const categoryColors = {
    "Majority of spend on Google & Meta": "#03004C",
    "Diversified spend": "var(--blue-medium)",
  };

  const dots = data.map((d) => {
    const x = spendScale(d["Spend"]);
    const y = roasScale(d["ROAS"]);
    return html`<circle
      cx="${x}"
      cy="${y}"
      r="${dotSize}"
      fill="${categoryColors[d["Category (colour)"]]}"
      title="Spend: ${d["Spend"]}, ROAS: ${d["ROAS"]}"
    />`;
  });

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <line
          x1="${0}"
          y1="${innerHeight}"
          x2="${innerWidth}"
          y2="${0}"
          stroke="#efefef"
        />
        <line
          x1="${0}"
          y1="${innerHeight}"
          x2="${innerWidth}"
          y2="${innerHeight}"
          stroke="#000"
        />
        <line x1="${0}" y1="0" x2="${0}" y2="${innerHeight}" stroke="#000" />
        <g>${dots}</g>
        <g>
          <text
            x="${innerWidth - legendLineDistance1}"
            y="${innerHeight + margin.bottom / 2}"
            text-anchor="end"
            dominant-baseline="middle"
            class="charts-text-body-bold"
          >
            ROAS
          </text>
          <text
            x="${-margin.left / 2 - legendLineDistance1}"
            y="${0}"
            text-anchor="end"
            dominant-baseline="middle"
            transform="rotate(-90, ${-margin.left / 2}, ${0})"
            class="charts-text-body-bold"
          >
            Spend
          </text>
        </g>
      </g>
    </svg>
  </div>`;
}
