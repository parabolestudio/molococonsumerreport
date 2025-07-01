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

  console.log("Data for Viz 4:", dataFiltered);

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
  const margin = { top: 2, right: 0, bottom: 62, left: 2 };
  const height =
    numRows * (barHeight + barPadding) -
    barPadding +
    margin.bottom +
    margin.top;
  const innerHeight = height - margin.top - margin.bottom;

  const maxValue = d3.max(data, (d) => d["Growth (%)"]);
  const barScale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([0, maxBarWidth]);

  const barColors = {
    Gaming: "var(--white)",
    "Google & Meta": "#5CDEFF",
  };

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
        fill="${barColors[d.Category]
          ? barColors[d.Category]
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
      <g transform="translate(${margin.left}, ${margin.top})">
        ${rows}
        ${variation === "a"
          ? html` <g>
              <line
                x1="${width * groupLabelWidth + barScale(1.0)}"
                y1="0"
                x2="${width * groupLabelWidth + barScale(1.0)}"
                y2="${innerHeight + 40}"
                stroke="#5CDEFF"
                stroke-width="1"
                stroke-dasharray="2,2"
              />
              <g
                transform="translate(${width * groupLabelWidth +
                barScale(1.0)}, ${innerHeight + 40})"
              >
                <rect
                  x="-40"
                  y="0"
                  width="80"
                  height="20"
                  fill="#5CDEFF"
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
            </g>`
          : ""}
      </g>
    </svg>
  </div>`;
}
