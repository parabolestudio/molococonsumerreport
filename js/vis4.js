import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis4(props) {
  const [data, setData] = useState([]);
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz4_category_growth.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["Growth (%)"] = +d["Growth (%)"];
        d["Growth Text"] = "+" + Math.round(d["Growth (%)"] * 100) + "%";
      });
      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // variation & data
  const variation = props.variation || "a";
  const categoriesA = ["Gaming", "Non Gaming"];
  const categoriesB = ["Gaming", "E-Commerce", "On-Demand", "Entertainment"];
  const categories = variation === "a" ? categoriesA : categoriesB;
  const dataFiltered = data.filter((d) => categories.includes(d["Category"]));

  // layout dimensions
  // width
  const groupLabelWidth = 2 / 10;
  const barWidth = 6 / 10;
  //   const valueLabelWidth = 2 / 10;
  const width = 633;
  const maxBarWidth = width * barWidth;

  // height
  const barHeight = 195;
  const barPadding = 28;
  const numRows = dataFiltered.length;
  const height = numRows * (barHeight + barPadding) - barPadding;

  const maxValue = d3.max(data, (d) => d["Growth (%)"]);
  const barScale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([0, maxBarWidth]);

  const rows = dataFiltered.map((d, index) => {
    return html`<g
      transform="translate(0, ${index * (barHeight + barPadding)})"
    >
      <text
        x="0"
        y="${barHeight / 2}"
        dominant-baseline="central"
        class="charts-text-body charts-text-white"
      >
        ${d["Category"]}
      </text>

      <rect
        x="${width * groupLabelWidth}"
        y="0"
        width="${barScale(d["Growth (%)"])}"
        height="${barHeight}"
        fill="${d.Category === "Gaming"
          ? "var(--white)"
          : "var(--blue-medium)"}"
        rx="10"
        ry="10"
      />
      <text
        x="${width * groupLabelWidth + barScale(d["Growth (%)"]) + 10}"
        y="${barHeight / 2}"
        dominant-baseline="central"
        class="charts-text-value charts-text-white"
      >
        ${d["Growth Text"]}
      </text>
    </g>`;
  });

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; background-color:#040078"
    >
      ${rows}
    </svg>
  </div>`;
}
