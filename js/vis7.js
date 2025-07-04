import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis7() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("U.S.");

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz7_time_spent_change.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["Value"] = +d["Value"];
      });

      const groupedData = d3.group(data, (d) => d["Country"]);

      // convert grouped data to an array of objects
      const groupedArray = Array.from(groupedData, ([key, values]) => {
        return {
          country: key,
          values: values.map((v) => ({
            category: v.Category,
            value: v.Value,
          })),
        };
      });

      setData(groupedArray);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // set values for country dropdown
  const countries = data.map((d) => d.country);
  let countryDropdown = document.querySelector("#viz7_dropdown_countries");
  if (countryDropdown) {
    if (countryDropdown) countryDropdown.innerHTML = "";
    countries.forEach((country) => {
      let option = document.createElement("option");
      option.text = country;
      countryDropdown.add(option);
    });
    countryDropdown.value = selectedCountry;
    countryDropdown.addEventListener("change", (e) => {
      setSelectedCountry(e.target.value);
    });
  }

  // data and scales
  const countryValues = data
    .filter((d) => d.country === selectedCountry)
    .flatMap((d) =>
      d.values.map((v) => ({
        value: v.value,
        category: v.category,
      }))
    );

  // layout dimensions
  const vis7Container = document.querySelector("#vis7");
  const width =
    vis7Container && vis7Container.offsetWidth
      ? vis7Container.offsetWidth
      : 600;
  const heightPerCategory = 30;
  const categoryPadding = 8;
  const height =
    (heightPerCategory + categoryPadding) * countryValues.length +
    categoryPadding;

  const margin = { top: 5, right: 150, bottom: 5, left: 150 };
  const innerWidth = width - margin.left - margin.right;
  // const innerHeight = height - margin.top - margin.bottom;

  const minValue = d3.min(countryValues, (d) => d.value);
  const maxValue = d3.max(countryValues, (d) => d.value);
  const absMaxValue = Math.max(Math.abs(minValue), Math.abs(maxValue));
  const valueScaleNegative = d3
    .scaleLinear()
    .domain([-absMaxValue, 0])
    .range([0, innerWidth / 2]);
  const valueScalePositive = d3
    .scaleLinear()
    .domain([0, absMaxValue])
    .range([innerWidth / 2, innerWidth]);

  const rows = countryValues
    .sort((a, b) => b.value - a.value)
    .map((v, index) => {
      // positive and negative values are handled separately
      let barX,
        barWidth = 0;
      if (v.value >= 0) {
        barX = valueScalePositive(0);
        barWidth = valueScalePositive(v.value) - valueScalePositive(0);
      } else {
        barWidth = valueScaleNegative(0) - valueScaleNegative(v.value);
        barX = valueScaleNegative(0) - barWidth;
      }

      const y = index * (heightPerCategory + categoryPadding) + categoryPadding;

      const formattedValue = d3.format(".2s")(v.value).replace("G", "B");

      return html`<g data-category="${v.category}" data-value="${v.value}">
        <rect
          x="${barX}"
          y="${y}"
          width="${barWidth}"
          height="${heightPerCategory}"
          fill="${v.value > 0 ? "#c368f9" : "white"}"
          title="${v.category}: ${v.value}"
          rx="10"
          ry="10"
        />
        <text
          x="${v.value > 0 ? barX - 10 : valueScaleNegative(0) + 10}"
          y="${y + heightPerCategory / 2}"
          text-anchor="${v.value > 0 ? "end" : "start"}"
          class="charts-text-body charts-text-white"
          dominant-baseline="middle"
          >${v.category}</text
        >
        <text
          x="${v.value > 0 ? barX + barWidth + 10 : barX - 10}"
          y="${y + heightPerCategory / 2}"
          class="charts-text-value charts-text-white"
          dominant-baseline="middle"
          text-anchor="${v.value > 0 ? "start" : "end"}"
        >
          ${v.value > 0 ? "+" : ""}${formattedValue}
        </text>
      </g>`;
    });

  return html`<div
    class="vis-container-inner"
    style="background-color: #040078;"
  >
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">${rows}</g>
    </svg>
  </div>`;
}
