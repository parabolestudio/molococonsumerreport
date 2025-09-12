import { html, useEffect, useState } from "./utils/preact-htm.js";
import { getDataURL } from "./utils/helper.js";
import { getLabel as l } from "../localisation/labels.js";

const getBarsColor = (loc) => {
  return {
    "Google & Meta": "var(--white)",
    [l(4, loc, "Gaming")]: "#5CDEFF",
  };
};

export function Vis4Combined({ locale: loc }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    d3.csv(getDataURL("Viz4", loc)).then((data) => {
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
        l(4, loc, "Google & Meta"),
        l(4, loc, "Gaming"),
        l(4, loc, "Consumer"),
        l(4, loc, "Health & Fitness"),
        l(4, loc, "Education"),
        l(4, loc, "Shopping"),
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

  const barColors = getBarsColor(loc);

  // data and scales
  const columnHeightScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d["Growth (%)"])])
    .range([innerHeight, 0]);

  // Calculate rectangle for columns 4-7 (index 3 to 6)
  const rectPadding = loc === "ja" ? 15 : 15;
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
    const baselineWidth = loc === "ja" ? 90 : 80;
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
          x="-${baselineWidth / 2}"
          y="0"
          width="${baselineWidth}"
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
          ${l(4, loc, "Baseline")}
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
                dx=${d["Category"] === "健康・フィットネス" && !isMobile
                  ? "8"
                  : "0"}
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
