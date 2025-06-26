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
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const minROAS = d3.min(data, (d) => d["ROAS"]);
  const maxROAS = d3.max(data, (d) => d["ROAS"]);
  const minSpend = d3.min(data, (d) => d["Spend"]);
  const maxSpend = d3.max(data, (d) => d["Spend"]);
  const testPadding = 50; // padding for the scales for testing purposes
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
    "Majority of spend on Google & Meta": "##03004C",
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
      style="width:100%; height:100%; border:1px solid black;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <line
          x1="0"
          y1="${innerHeight / 2}"
          x2="${innerWidth}"
          y2="${innerHeight / 2}"
          stroke="#000"
          stroke-width="1"
        />
        <line
          x1="${innerWidth / 2}"
          y1="0"
          x2="${innerWidth / 2}"
          y2="${innerHeight}"
          stroke="black"
          stroke-width="1"
        />
        <g>${dots}</g>
        <g>
          <text
            x="${innerWidth / 2}"
            y="${innerHeight + margin.bottom / 2}"
            text-anchor="middle"
            dominant-baseline="middle"
            class="charts-text-body-bold"
          >
            ROAS
          </text>

          <text
            x="${innerWidth / 2 - legendLineDistance2}"
            y="${innerHeight - legendLineDistance1}"
            text-anchor="end"
            dominant-baseline="middle"
            class="charts-text-body"
          >
            ← Worse
          </text>
          <text
            x="${innerWidth / 2 + legendLineDistance2}"
            y="${innerHeight - legendLineDistance1}"
            text-anchor="start"
            dominant-baseline="middle"
            class="charts-text-body"
          >
            Better →
          </text>

          <g transform="rotate(-90, ${-margin.left / 2}, ${innerHeight / 2})">
            <text
              x="${-margin.left / 2}"
              y="${innerHeight / 2}"
              text-anchor="middle"
              dominant-baseline="middle"
              class="charts-text-body-bold"
            >
              Spend
            </text>
            <text
              x="${-margin.left / 2 + legendLineDistance2}"
              y="${innerHeight / 2 + legendLineDistance1 * 2}"
              text-anchor="start"
              dominant-baseline="middle"
              class="charts-text-body"
            >
              Worse →
            </text>
            <text
              x="${-margin.left / 2 - legendLineDistance2}"
              y="${innerHeight / 2 + legendLineDistance1 * 2}"
              text-anchor="end"
              dominant-baseline="middle"
              class="charts-text-body"
            >
              ← Better
            </text>
          </g>
        </g>
      </g>
    </svg>
  </div>`;
}
