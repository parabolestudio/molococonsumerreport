import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis4(props) {
  const [data, setData] = useState([]);
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz4_category_growth.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["Growth Text"] = "+" + Math.round(d["Growth (%)"] * 100) + "%";
      });
      data.forEach((d) => {
        d["Growth (%)"] = +d["Growth (%)"] + 1.0;
      });
      data.push({
        Category: "Google & Meta",
        "Growth (%)": 1,
        "Growth Text": "",
      });

      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // variation & data
  const variation = props.variation || "a";
  const categoriesA = ["Google & Meta", "Gaming", "Non Gaming"];
  const categoriesB = [
    "Google & Meta",
    "E-Commerce",
    "On-Demand",
    "Entertainment",
  ];
  const categories = variation === "a" ? categoriesA : categoriesB;
  const dataFiltered = data.filter((d) => categories.includes(d["Category"]));
  // sort by order in categories
  dataFiltered.sort((a, b) => {
    return (
      categories.indexOf(a["Category"]) - categories.indexOf(b["Category"])
    );
  });

  // layout dimensions
  // width
  const vis4Container = document.querySelector("#vis4a"); // same as vis4b
  const width =
    vis4Container && vis4Container.offsetWidth
      ? vis4Container.offsetWidth
      : 633;

  // height
  const barHeight = 60;
  const barPadding = 65;
  const margin = { top: 40, right: 160, bottom: 62, left: 2 };
  const height =
    dataFiltered.length * (barHeight + barPadding) -
    barPadding +
    margin.bottom +
    margin.top;
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const barScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d["Growth (%)"])])
    .range([0, innerWidth]);

  const barColors = {
    "Google & Meta": "var(--white)",
    Gaming: "#5CDEFF",
  };

  const rows = dataFiltered.map((d, index) => {
    return html`<g
      transform="translate(0, ${index * (barHeight + barPadding)})"
    >
      <text
        y="-23"
        dominant-baseline="middle"
        class="charts-text-body charts-text-white"
      >
        ${d["Category"]}
      </text>
      <rect
        width="${barScale(d["Growth (%)"]) / 2}"
        height="${barHeight}"
        fill="${barColors[d.Category]
          ? barColors[d.Category]
          : "var(--blue-medium)"}"
      />
      <rect
        width="${barScale(d["Growth (%)"])}"
        height="${barHeight}"
        fill="${barColors[d.Category]
          ? barColors[d.Category]
          : "var(--blue-medium)"}"
        rx="10"
        ry="10"
      />
      <text
        x="${barScale(d["Growth (%)"]) + 10}"
        y="${barHeight / 2}"
        dominant-baseline="middle"
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
      <g transform="translate(${margin.left}, ${margin.top})">
        ${rows}
        <g>
          <line
            x1="${barScale(1.0)}"
            y1="0"
            x2="${barScale(1.0)}"
            y2="${innerHeight + 40}"
            stroke="white"
            stroke-width="1"
            stroke-dasharray="2,2"
          />
          <g transform="translate(${barScale(1.0)}, ${innerHeight + 40})">
            <rect
              x="-40"
              y="0"
              width="80"
              height="20"
              fill="white"
              rx="10"
              ry="10"
            />
            <text
              x="${0}"
              y="4"
              dominant-baseline="hanging"
              text-anchor="middle"
              class="charts-text-body"
              fill="#040078"
            >
              Baseline
            </text>
          </g>
        </g>
      </g>
    </svg>
  </div>`;
}
