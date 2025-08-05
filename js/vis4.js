import { html, useEffect, useState } from "./utils/preact-htm.js";

const barColors = {
  "Google & Meta": "var(--white)",
  Gaming: "#5CDEFF",
};

export function Vis4Combined() {
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

      const categoryOrder = [
        "Google & Meta",
        "Gaming",
        "Consumer",
        "Health & Fitness",
        "Education",
        "Shopping",
      ];
      data.sort((a, b) => {
        return (
          categoryOrder.indexOf(a["Category"]) -
          categoryOrder.indexOf(b["Category"])
        );
      });

      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // layout dimensions
  const vis4Container = document.querySelector("#vis4");
  const width =
    vis4Container && vis4Container.offsetWidth
      ? vis4Container.offsetWidth
      : 600;
  const isMobile = window.innerWidth <= 480;

  const height = isMobile ? 450 : 600;
  const margin = {
    top: 50,
    right: isMobile ? 105 : 112,
    bottom: 40,
    left: isMobile ? 10 : 30,
  };
  const extraGap = isMobile ? 0 : 80; // spacing between 3rd and 4th column

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right - extraGap;

  // data and scales
  const columnHeightScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d["Growth (%)"])])
    .range([innerHeight, 0]);

  // Calculate rectangle for columns 4-7 (index 3 to 6)
  const rectPadding = 15;
  const firstIdx = 3;
  const lastIdx = 5; // less categories

  const getRectangle = (data, columnXScale) => {
    let rectX1 = columnXScale(data[firstIdx]["Category"]);
    let rectX2 = columnXScale(data[lastIdx]["Category"]);
    // Account for extraGap if present after 3rd column
    if (firstIdx > 2) rectX1 += extraGap;
    if (lastIdx > 2) rectX2 += extraGap;
    const rectWidth =
      rectX2 - rectX1 + columnXScale.bandwidth() + 2 * rectPadding + 110;
    const rectX = rectX1 - rectPadding - 15;
    const rectY = -rectPadding - 30;
    const rectHeight = innerHeight + 2 * rectPadding + 50;

    return html` <rect
        x="${rectX}"
        y="${rectY}"
        width="${rectWidth}"
        height="${rectHeight}"
        fill="none"
        class="charts-line-dashed charts-line-dashed-blue"
        rx="10"
        ry="10"
      />
      <line
        x1="${columnXScale(data[2]["Category"]) + columnXScale.bandwidth()}"
        y1="${columnHeightScale(data[2]["Growth (%)"]) +
        (innerHeight - columnHeightScale(data[2]["Growth (%)"])) * 0.34}"
        x2="${rectX}"
        y2="${columnHeightScale(data[2]["Growth (%)"]) +
        (innerHeight - columnHeightScale(data[2]["Growth (%)"])) * 0.34}"
        class="charts-line-dashed charts-line-dashed-blue"
      />`;
  };

  const getBaseline = (data, columnXScale) => {
    return html` <g>
      <line
        x1="${columnXScale(data[data.length - 1]["Category"]) + extraGap}"
        y1="${columnHeightScale(1.0)}"
        x2="${columnXScale(data[data.length - 1]["Category"]) +
        columnXScale.bandwidth() +
        60 +
        extraGap}"
        y2="${columnHeightScale(1.0)}"
        class="charts-line-dashed charts-line-dashed-white"
      />
      <g
        transform="translate(${columnXScale(data[data.length - 1]["Category"]) +
        columnXScale.bandwidth() +
        60 +
        extraGap}, ${columnHeightScale(1.0) - 10})"
      >
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
    </g>`;
  };

  const getColumns = (data, includeBaseline = true) => {
    const columnXScale = d3
      .scaleBand()
      .domain(data.map((d) => d["Category"]))
      .range([0, innerWidth])
      .paddingInner(0.5)
      .paddingOuter(0);

    return html`
      <g class="columns">
        ${data.map((d, i) => {
          let x = columnXScale(d["Category"]);
          // Add extra gap after the third column (i > 2)
          if (i > 2) x += extraGap;
          const y = columnHeightScale(d["Growth (%)"]);
          const height = innerHeight - y;
          const width = columnXScale.bandwidth();
          return html`<g transform="translate(${x}, ${y})">
              <rect
                width="${width}"
                height="${height}"
                fill="${barColors[d.Category]
                  ? barColors[d.Category]
                  : "var(--blue-medium)"}"
                rx="10"
                ry="10"
              />
              <rect
                y="${height / 2}"
                width="${width}"
                height="${height / 2}"
                fill="${barColors[d.Category]
                  ? barColors[d.Category]
                  : "var(--blue-medium)"}"
              />

              <text
                x="${width / 2}"
                y="${-10}"
                text-anchor="middle"
                class="charts-text-value charts-text-white"
              >
                ${d["Growth Text"]}
              </text>
              <text
                x="${width / 2}"
                y="${height + 20}"
                text-anchor="middle"
                class="charts-text-body charts-text-white"
              >
                ${d["Category"].includes("&") && isMobile
                  ? html`<tspan x="${width / 2}" dy="0"
                        >${d["Category"].split("&")[0].trim()}</tspan
                      ><tspan x="${width / 2}" dy="1.2em"
                        >& ${d["Category"].split("&")[1].trim()}</tspan
                      >`
                  : d["Category"]}
              </text> </g
            ><line
              x1="${x}"
              y1="${columnHeightScale(1.0)}"
              x2="${x + width}"
              y2="${columnHeightScale(1.0)}"
              class="${d.Category === "Google & Meta"
                ? ""
                : "charts-line-dashed charts-line-dashed-white"}"
              stroke="${d.Category === "Google & Meta"
                ? "transparent"
                : "white"}"
            />`;
        })}
      </g>
      ${!isMobile ? getRectangle(data, columnXScale) : null}
      ${includeBaseline ? getBaseline(data, columnXScale) : null}
    `;
  };

  if (isMobile) {
    return html`<div class="vis-container-inner" style="margin-top: -110px;">
      <svg
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="xMidYMid meet"
        style="width:100%; height:100%;"
      >
        <g transform="translate(${margin.left}, ${margin.top})">
          ${getColumns(data.slice(0, firstIdx), false)}
        </g>
      </svg>
      <svg
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="xMidYMid meet"
        style="width:100%; height:100%;"
      >
        <g transform="translate(${margin.left}, ${margin.top})">
          ${getColumns(data.slice(firstIdx, lastIdx + 1))}
        </g>
      </svg>
    </div>`;
  } else {
    return html`<div class="vis-container-inner">
      <svg
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="xMidYMid meet"
        style="width:100%; height:100%;"
      >
        <g transform="translate(${margin.left}, ${margin.top})">
          ${getColumns(data)}
        </g>
      </svg>
    </div>`;
  }
}

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
  const categoriesA = ["Google & Meta", "Gaming", "Consumer"];
  const categoriesB = [
    "Google & Meta",
    "Health & Fitness",
    "Education",
    "Shopping",
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
      <line
        x1="${barScale(1.0)}"
        y1="0"
        x2="${barScale(1.0)}"
        y2="${barHeight}"
        stroke="${d.Category === "Google & Meta" ? "transparent" : "white"}"
        stroke-width="1"
        stroke-dasharray="2,2"
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
            y1="${(dataFiltered.length - 1) * (barHeight + barPadding)}"
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
