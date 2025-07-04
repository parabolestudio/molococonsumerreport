import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis9() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("U.S.");

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
  let countryDropdown = document.querySelector("#viz9_dropdown_countries");
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
  const margin = { top: 65, right: 55, bottom: 55, left: 55 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const dataFiltered = data.filter((d) => d.Country === selectedCountry);

  const hourScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataFiltered, (d) => d.Hours)])
    .range([innerHeight, 0])
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
    .scaleBand()
    .domain(appList)
    .range([0, innerWidth])
    .paddingInner(0)
    .paddingOuter(0.5);

  const dauScale = d3
    .scaleSqrt()
    .domain([0, d3.max(dataFiltered, (d) => d.DAU)])
    .range([4, appScale.bandwidth() / 2]);

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
        <g class="hour-ticks">
          ${hourScale.ticks(5).map((tick) => {
            const y = hourScale(tick);
            const formattedTick = d3.format(".2s")(tick).replace("G", "B");
            return html`<line
                x1="0"
                y1="${y}"
                x2="${innerWidth}"
                y2="${y}"
                stroke="#D9D9D9"
              />
              <text
                x="-10"
                y="${y + 4}"
                text-anchor="end"
                class="charts-text-body"
                >${tick !== 0 ? formattedTick : ""}</text
              >`;
          })}
        </g>
        <g class="lollipops">
          ${dataFiltered.map((d) => {
            const color =
              d.App === "Independent App Ecosystem" ? "#60E2B7" : "#040078";
            return html`
              <g transform="translate(${appScale(d.App)}, 0)">
                <line
                  x1="0"
                  y1="${hourScale(d.Hours)}"
                  x2="0"
                  y2="${innerHeight}"
                  stroke="${color}"
                  stroke-width="2"
                  style="transition: y1 0.3s ease;"
                />
                <circle
                  cx="0"
                  cy="${hourScale(d.Hours)}"
                  r="${dauScale(d.DAU)}"
                  fill="${color}"
                  style="transition: all 0.3s ease;"
                />
                <text
                  y="${innerHeight + 35}"
                  text-anchor="middle"
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
  </div>`;
}
