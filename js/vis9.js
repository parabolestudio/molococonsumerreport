import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis9() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("U.S.");
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz9_daily_active_users.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["DAU"] = parseFloat(d["DAU"].replaceAll(",", ""));
        d["Hours"] = parseFloat(d["Hours"].replaceAll(",", ""));
      });

      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // set values for country code dropdown
  // const countries = data.map((d) => d.countryCode);
  const countries = data.map((d) => d.Country);
  const uniqueCountries = Array.from(new Set(countries)).sort();
  let countryDropdown = document.querySelector("#vis9_dropdown_countries");
  if (countryDropdown) {
    if (countryDropdown) countryDropdown.innerHTML = "";
    uniqueCountries.forEach((country) => {
      let option = document.createElement("option");
      option.text = country;
      countryDropdown.add(option);
    });
    countryDropdown.value = selectedCountry;
    countryDropdown.addEventListener("change", (e) => {
      setSelectedCountry(e.target.value);
    });
  }

  // layout dimensions
  const vis9Container = document.querySelector("#vis9");
  const width =
    vis9Container && vis9Container.offsetWidth
      ? vis9Container.offsetWidth
      : 600;

  const height = 400;
  const margin = { top: 65, right: 5, bottom: 55, left: 90 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const dataFiltered = data.filter((d) => d.Country === selectedCountry);

  const hourScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataFiltered, (d) => d.Hours)])
    .range([0, innerWidth])
    .nice();

  const appList = [
    "Independent App Ecosystem",
    "Instagram",
    "Facebook",
    "TikTok",
    "YouTube",
    "Reddit",
    "Threads",
  ];
  const appScale = d3
    .scalePoint()
    .domain(appList)
    .range([0, innerWidth])
    .padding(0.5);

  const [minDau, maxDau] = d3.extent(dataFiltered, (d) => d.DAU);
  const dauScale = d3
    .scaleLinear()
    .domain([0, maxDau])
    .range([innerHeight, 0]);
  
  const circleRadius = 8;

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <rect
          x="0"
          y="0"
          width="${innerWidth}"
          height="${innerHeight}"
          fill="transparent"
        />
        <g class="x-axis">
          <line
            x1="${0}"
            x2="${innerWidth}"
            y1="${innerHeight}"
            y2="${innerHeight}"
            stroke="#D9D9D9"
          />
          <text
            class="charts-text-body-bold"
            dominant-baseline="hanging"
            dx="12"
            text-anchor="middle"
            x="${innerWidth/2}"
            y="${innerHeight + 22}"
          >
            Hours spent
          </text>
          <g class="dau-ticks">
            ${dauScale.ticks(5).map((tick) => {
              const y = dauScale(tick);
              const formattedTick = d3.format(".2s")(tick).replace("G", "B");
              return html`
                <text
                  x="${- 50}"
                  y="${y + 4}"
                  text-anchor="start"
                  class="charts-text-body"
                  >${tick !== 0 ? formattedTick : ""}</text
                >`;
            })}
          </g>
        </g>
        <g class="y-axis">
          <line
            x1="${0}"
            x2="${0}"
            y1="${0}"
            y2="${innerHeight}"
            stroke="#D9D9D9"
          />
          <text
            class="charts-text-body-bold"
            dominant-baseline="hanging"
            dx="12"
            text-anchor="middle"
            x="${-75}"
            y="${innerHeight/2}"
            transform="rotate(-90 ${-75} ${innerHeight/2})"
          >
            DAU
          </text>
          <g class="hour-ticks">
            ${hourScale.ticks(5).map((tick) => {
              const x = hourScale(tick);
              const formattedTick = d3.format(".2s")(tick).replace("G", "B");
              return html`
                <text
                  x="${x}"
                  y="${innerHeight + 12}"
                  text-anchor="middle"
                  class="charts-text-body"
                  >${tick !== 0 ? formattedTick : ""}</text
                >`;
            })}
          </g>
        </g>
        <g class="lollipops">
          ${dataFiltered
            .map((d, index) => {
              const color =
                d.App === "Independent App Ecosystem" ? "#60E2B7" : "#040078";
              return html`
                <g transform="translate(0, 0)">
                  <circle
                    class="lollipop-circle"
                    cx="${hourScale(d.Hours)}"
                    cy="${dauScale(d.DAU)}"
                    r="${circleRadius}"
                    fill="${color}"
                    style="transition: all 0.3s ease; cursor: pointer;"
                    onmouseover="${() => {
                      setHoveredItem({
                        dau: d.DAU,
                        hours: d.Hours,
                        country: d.Country,
                        app: d.App,
                        x: hourScale(d.Hours),
                        y: dauScale(d.DAU),
                        r: circleRadius,
                      });
                    }}"
                    onmouseout="${() => {
                      setHoveredItem(null);
                    }}"
                  />
                  <text
                    x="${hourScale(d.Hours) + 12}"
                    y="${dauScale(d.DAU) + 4}"
                    dy="0"
                    text-anchor="left"
                    class="charts-text-body"
                  >
                    ${d.App === "Independent App Ecosystem" ? "IAE" : d.App}
                  </text>
                </g>
              `;
            })}
        </g>
      </g>
    </svg>
    <${Tooltip} hoveredItem=${hoveredItem} />
  </div>`;
}

function Tooltip({ hoveredItem }) {
  if (!hoveredItem) return null;

  return html`<div
    class="tooltip"
    style="left: ${hoveredItem.x}px; top: ${hoveredItem.y}px;"
  >
    <div>
      <p class="tooltip-label">Country</p>
      <p class="tooltip-value">${hoveredItem.country}</p>
    </div>
    <div>
      <p class="tooltip-label">App</p>
      <p class="tooltip-value">${hoveredItem.app}</p>
    </div>
    <div>
      <p class="tooltip-label">Daily Active Users (DAU)</p>
      <p class="tooltip-value">
        ${d3.format(".2s")(hoveredItem.dau).replace("G", "B")}
      </p>
    </div>
    <div>
      <p class="tooltip-label">Hours</p>
      <p class="tooltip-value">
        ${d3.format(".2s")(hoveredItem.hours).replace("G", "B")}
      </p>
    </div>
  </div>`;
}
