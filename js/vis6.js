import { html } from "./utils/preact-htm.js";

function parseData() {
  return d3
    .csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz6_time_on_mobile.csv"
    )
    .then((data) => {
      data.forEach((d) => {
        d["Value"] = +d["Value"];
        d["Year"] = +d["Year"];
      });

      // group data by Country
      const groupedData = d3.group(data, (d) => d["Country"]);

      // convert grouped data to an array of objects
      const groupedArray = Array.from(groupedData, ([key, values]) => {
        const value2023 = values.find((v) => v.Year === 2023)?.Value || 0;
        const value2024 = values.find((v) => v.Year === 2024)?.Value || 0;
        const percentageChange = Math.round(
          ((value2023 - value2024) / value2023) * 100
        );

        return {
          country: key,
          region: values[0]["Region"],
          value2023,
          value2024,
          percentageChange,
          percentageChangeFormatted: `${
            percentageChange > 0 ? "+" : ""
          }${percentageChange}%`,
        };
      });

      return groupedArray;
    });
}

export async function Vis6() {
  const data = await parseData();
  const filterData = data
    .filter((d) => d.region === "Europe")
    .sort((a, b) => a.value2024 - b.value2024);

  console.log("Data for Vis6:", data, filterData);

  // layout dimensions
  const width = 600;
  const heightPerCountry = 40;
  const countryPadding = 30;
  const height =
    (heightPerCountry + countryPadding) * filterData.length + countryPadding;
  const margin = { top: 20, right: 120, bottom: 20, left: 140 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const minValue = d3.min(data, (d) => Math.min(d.value2023, d.value2024));
  const maxValue = d3.max(data, (d) => Math.max(d.value2023, d.value2024));

  const valueScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([0, innerWidth]);

  const circleRadius = 14;

  const elements = filterData.map((d, index) => {
    const x2023 = valueScale(d.value2023);
    const x2024 = valueScale(d.value2024);
    const barStart = Math.min(x2023, x2024);
    const barEnd = Math.max(x2023, x2024);
    const barWidth = Math.abs(x2023 - x2024);

    return html`<g
      transform="translate(0, ${index * (heightPerCountry + countryPadding) +
      countryPadding})"
    >
      <text x="${-120}" y="5" class="charts-text-body"> ${d.country} </text>
      <rect
        x="${barStart}"
        y="${-circleRadius}"
        width="${barWidth}"
        height="${circleRadius * 2}"
        fill="#EFEFEF"
      />
      <circle cx="${x2023}" r="${circleRadius}" fill="#03004C" />
      <circle cx="${x2024}" r="${circleRadius}" fill="#C368F9" />
      <text
        x="${barEnd + 20}"
        y="${0}"
        class="charts-text-value"
        dominant-baseline="middle"
        fill="#03004C"
      >
        ${d.percentageChangeFormatted}
      </text>
    </g>`;
  });

  const xTicks = valueScale.ticks().map((tick) => {
    const x = valueScale(tick);
    return html`<g transform="translate(${x}, 0)">
      <line y1="0" y2="${innerHeight}" stroke="#000" stroke-width="0.5" />
      <text
        x="0"
        y="${innerHeight + 15}"
        text-anchor="middle"
        class="charts-text-body"
        style="font-size: 12px;"
        fill="red"
      >
        ${tick}
      </text>
    </g>`;
  });

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border:1px solid black;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <g class="tick-lines">${xTicks}</g>
        <g class="country-rows">${elements}</g>
      </g>
    </svg>
  </div>`;
}
