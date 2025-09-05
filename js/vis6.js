import { html, useEffect, useState } from "./utils/preact-htm.js";
import { getDataURL } from "./utils/helper.js";
import { getLabel as l } from "../localisation/labels.js";

const CUSTOM_COUNTRY_REGION = [
  "USA",
  "JPN",
  "KOR",
  "DEU",
  "GBR",
  "TWN",
  "CAN",
  "FRA",
  "AUS",
  "BRA",
];

const CIRCLE_RADIUS = 19 / 2;

export function Vis6({ locale: loc }) {
  const [data, setData] = useState([]);
  const [filterData, setFilteredData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(
    l(6, loc, "Top 10 mobile app markets")
  );
  const [axisBreak, setAxisBreak] = useState(null);

  function filterDataByRegion() {
    let filterData = data.sort((a, b) => b.value2024 - a.value2024);
    filterData = filterData.filter((d) => d.region === selectedRegion);
    if (selectedRegion === l(6, loc, "Top 10 mobile app markets")) {
      filterData = data.filter((d) =>
        CUSTOM_COUNTRY_REGION.includes(d.country)
      );
    }
    setFilteredData(filterData);
  }
  // Fetch data on mount
  useEffect(() => {
    d3.csv(getDataURL("Viz6", loc)).then((data) => {
      data.forEach((d) => {
        d["Value"] = +d["Value"];
        d["Year"] = d["Year"] === "CAGR" ? d["Year"] : +d["Year"];
      });

      // group data by Country
      const groupedData = d3.group(data, (d) => d["Country code"]);

      // convert grouped data to an array of objects
      const groupedArray = Array.from(groupedData, ([key, values]) => {
        const value2023 = values.find((v) => v.Year === 2021)?.Value || 0;
        const value2024 = values.find((v) => v.Year === 2024)?.Value || 0;
        const percentageChange =
          values.find((v) => v.Year === "CAGR")?.Value * 100 || 0;

        return {
          country: key,
          region: values[0]["Region"],
          value2023,
          value2024,
          percentageChange,
          percentageChangeFormatted: `${
            percentageChange > 0 ? "+" : ""
          }${percentageChange.toFixed(1)}%`,
        };
      });

      setData(groupedArray);

      // set values for regions dropdown
      const regions = groupedArray.map((d) => d.region);
      const uniqueRegions = Array.from(new Set(regions)).sort();
      uniqueRegions.unshift(l(6, loc, "Top 10 mobile app markets"));

      let regionDropdown = document.querySelector("#vis6_dropdown_regions");
      if (regionDropdown) regionDropdown.innerHTML = "";
      uniqueRegions.forEach((region) => {
        let option = document.createElement("option");
        option.text = region;
        regionDropdown.add(option);
      });
      regionDropdown.value = selectedRegion;
      regionDropdown.addEventListener("change", (e) => {
        setSelectedRegion(e.target.value);
      });
    });
  }, []);

  // filter and sort data based on selected region
  useEffect(() => {
    filterDataByRegion();

    // Set a breakpoint for Asia region
    if (selectedRegion === l(6, loc, "Asia")) {
      setAxisBreak({
        breakPoint: 340 * 1000000000, // 350 billion
        maxPoint: 1000 * 1000000000,
      });
    } else {
      setAxisBreak(null);
    }
  }, [data, selectedRegion]);

  if (data.length === 0 || filterData.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // layout dimensions
  const isMobile = window.innerWidth <= 480;
  const vis6Container = document.querySelector("#vis6");
  const width =
    vis6Container && vis6Container.offsetWidth
      ? vis6Container.offsetWidth
      : 600;
  const heightPerCountry = 20;
  const countryPadding = 20;
  const height =
    (heightPerCountry + countryPadding) * filterData.length + countryPadding;
  const margin = { top: 24, right: 90, bottom: 20, left: 120 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  // normal value scale
  let valueScale = d3
    .scaleLinear()
    .domain([0, d3.max(filterData, (d) => Math.max(d.value2023, d.value2024))])
    .range([0, innerWidth])
    .nice();
  let valueScale2 = null;

  if (axisBreak) {
    // if axisBreakpoint is set, adjust the scale to use the breakpoint
    valueScale = d3
      .scaleLinear()
      .domain([0, axisBreak.breakPoint])
      .range([0, innerWidth * 0.85])
      .nice();

    valueScale2 = d3
      .scaleLinear()
      .domain([axisBreak.breakPoint, axisBreak.maxPoint])
      .range([innerWidth * 0.85, innerWidth]);
  }

  const elements = filterData.map((d, index) => {
    let x2023, x2024;

    if (axisBreak) {
      x2023 =
        d.value2023 < axisBreak.breakPoint
          ? valueScale(d.value2023)
          : valueScale2(d.value2023);
      x2024 =
        d.value2024 < axisBreak.breakPoint
          ? valueScale(d.value2024)
          : valueScale2(d.value2024);
    } else {
      // if no axisBreakpoint, use the normal valueScale
      x2023 = valueScale(d.value2023);
      x2024 = valueScale(d.value2024);
    }

    const barStart = Math.min(x2023, x2024);
    const barEnd = Math.max(x2023, x2024);
    const barWidth = Math.abs(x2023 - x2024);

    return html`<g
      transform="translate(0, ${index * (heightPerCountry + countryPadding) +
      countryPadding})"
    >
      <text x="${-120}" y="5" class="charts-text-body">
        ${l(6, loc, d.country) === "Dominican Republic" && loc === "en"
          ? "Dom. Republic"
          : l(6, loc, d.country)}
      </text>
      <rect
        x="${barStart}"
        y="${-CIRCLE_RADIUS}"
        width="${barWidth}"
        height="${CIRCLE_RADIUS * 2}"
        fill="#EFEFEF"
      />
      <circle
        cx="${x2023}"
        r="${CIRCLE_RADIUS}"
        fill="#03004C"
        data-label="value_2023"
      />
      <circle
        cx="${x2024}"
        r="${CIRCLE_RADIUS}"
        fill="#C368F9"
        data-label="value_2024"
      />
      ${d.percentageChange > 0
        ? html` <text
            x="${barEnd + 20}"
            dy="2"
            class="charts-text-value"
            dominant-baseline="middle"
            fill="#03004C"
          >
            ${d.percentageChangeFormatted}
          </text>`
        : isMobile
        ? null
        : html` <text
            x="${barStart - 20}"
            dy="2"
            class="charts-text-value"
            dominant-baseline="middle"
            text-anchor="end"
            fill="#03004C"
          >
            ${d.percentageChangeFormatted}
          </text>`}
    </g>`;
  });

  const tickValues = isMobile ? valueScale.ticks(4) : valueScale.ticks();

  const xTicks1 = tickValues.map((tick, index) => {
    const x = valueScale(tick);

    // format tick text (big numbers as integers should be formatted in billions.)
    const formattedTick =
      tick === 0 ? "0" : d3.format(".2s")(tick).replace("G", "B");

    return html`<g transform="translate(${x}, 0)">
      <line y1="0" y2="${innerHeight}" stroke="#D9D9D9" />
      ${index % 2 == 0
        ? html`<text
            x="0"
            y="${-5}"
            text-anchor="middle"
            class="charts-text-body"
          >
            ${formattedTick}
          </text>`
        : ""}
    </g>`;
  });

  let xTicks2 = [];
  if (axisBreak) {
    const tick2Value = [
      axisBreak.breakPoint + (axisBreak.maxPoint - axisBreak.breakPoint) / 2,
      axisBreak.maxPoint,
    ];
    xTicks2 = tick2Value.map((tick, index) => {
      const x = valueScale2(tick);

      // format tick text (big numbers as integers should be formatted in billions.)
      const formattedTick = d3.format(".2s")(tick).replace("G", "B");

      if (tick === axisBreak.maxPoint) {
        return html`<g transform="translate(${x}, 0)">
          <line y1="0" y2="${innerHeight}" stroke="#D9D9D9" />
          <text
            x="0"
            y="${-5}"
            text-anchor="middle"
            class="charts-text-body"
            style="font-size: 12px;"
          >
            ${formattedTick}
          </text>
        </g>`;
      } else {
        return html`<g transform="translate(${x}, 0)">
          <line y1="0" y2="${innerHeight}" class="charts-line-dashed" />
          <path
            transform="translate(-11, ${isMobile ? -36 : -23})"
            stroke="#000"
            stroke-width=".75"
            fill="none"
            d="M0 11h5.175l4.316-9 4.005 18 4.316-9H23"
          />
        </g>`;
      }
    });
  }

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <g class="tick-lines">${xTicks1}${xTicks2}</g>
        <g class="country-rows">${elements}</g>
      </g>
    </svg>
  </div>`;
}

export function Vis6LegendGrowth({ locale: loc }) {
  const width = 340;
  const height = 45;

  const endX = 65;
  const lineHorizontalLength = 20;

  return html`
    <svg width="${width}" height="${height}">
      <g transform="translate(${CIRCLE_RADIUS}, ${CIRCLE_RADIUS + 3})">
        <rect
          x="${0}"
          y="${-CIRCLE_RADIUS}"
          width="${endX}"
          height="${CIRCLE_RADIUS * 2}"
          fill="#EFEFEF"
        />
        <circle cx="${0}" cy="${0}" r="${CIRCLE_RADIUS}" fill="#040078" />
        <circle cx="${endX}" cy="${0}" r="${CIRCLE_RADIUS}" fill="#C368F9" />
        <text
          x="${endX + CIRCLE_RADIUS + 6}"
          y="2"
          dominant-baseline="middle"
          fill="#03004C"
          font-size="24"
          font-weight="bold"
          font-family="'Spacegrotesk', 'Space Grotesk', sans-serif"
        >
          ${l(6, loc, "+/-X%")}
        </text>

        <line
          x1="${endX + 90}"
          y1="${0}"
          x2="${endX + 90 + lineHorizontalLength}"
          y2="${0}"
          stroke="#000"
          stroke-linecap="round"
        />
        <text
          x="${endX + 90 + lineHorizontalLength + 10}"
          y="2"
          dominant-baseline="middle"
          text-anchor="left"
          fill="#000"
          font-size="14"
          font-weight="400"
          font-family="'Montserrat', sans-serif"
        >
          ${loc === "en" &&
          html` <tspan x="${endX + 90 + lineHorizontalLength + 10}" dy="0">
            Compound Annual
          </tspan>`}
          ${loc === "en" &&
          html` <tspan x="${endX + 90 + lineHorizontalLength + 10}" dy="20">
            Growth Rate (CAGR)
          </tspan>`}
          ${loc !== "en" &&
          html` <tspan x="${endX + 90 + lineHorizontalLength + 10}" dy="0">
            ${l(6, loc, "Compound Annual Growth Rate (CAGR)")}
          </tspan>`}
        </text>
      </g>
    </svg>
  `;
}
