import { html, useEffect, useState } from "./utils/preact-htm.js";
import { getDataURL } from "./utils/helper.js";
import { getLabel as l } from "../localisation/labels.js";

export function Vis7({ locale: loc }) {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("USA");

  // Fetch data on mount
  useEffect(() => {
    d3.csv(getDataURL("Viz7", loc)).then((data) => {
      data.forEach((d) => {
        d["Value"] = +d["Value"];
        d["countryCode"] = d["Country code"];
      });

      const groupedData = d3.group(data, (d) => d["Country code"]);

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

      // set values for country dropdown
      const countries = Array.from(new Set(data.map((d) => d.countryCode)));
      let countryDropdown = document.querySelector("#vis7_dropdown_countries");
      if (countryDropdown) {
        if (countryDropdown) countryDropdown.innerHTML = "";
        countries.forEach((country) => {
          let option = document.createElement("option");
          option.text = l(7, loc, country);
          option.value = country;
          countryDropdown.add(option);
        });
        countryDropdown.value = selectedCountry;
        countryDropdown.addEventListener("change", (e) => {
          setSelectedCountry(e.target.value);
        });
      }
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
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

      const formattedValue = d3
        .format(".2s")(v.value)
        .replace("G", "B")
        .replace("k", "K");

      // Create path for selective rounded corners
      const baseRadius = 10;
      const radius = Math.min(baseRadius, barWidth / 2); // Ensure radius doesn't exceed half the bar width
      let pathData = "";

      if (v.value > 0) {
        // Positive: round top-right and bottom-right corners
        pathData = `
          M ${barX} ${y}
          L ${barX + barWidth - radius} ${y}
          Q ${barX + barWidth} ${y} ${barX + barWidth} ${y + radius}
          L ${barX + barWidth} ${y + heightPerCategory - radius}
          Q ${barX + barWidth} ${y + heightPerCategory} ${
          barX + barWidth - radius
        } ${y + heightPerCategory}
          L ${barX} ${y + heightPerCategory}
          Z
        `;
      } else {
        // Negative: round top-left and bottom-left corners
        pathData = `
          M ${barX + radius} ${y}
          L ${barX + barWidth} ${y}
          L ${barX + barWidth} ${y + heightPerCategory}
          L ${barX + radius} ${y + heightPerCategory}
          Q ${barX} ${y + heightPerCategory} ${barX} ${
          y + heightPerCategory - radius
        }
          L ${barX} ${y + radius}
          Q ${barX} ${y} ${barX + radius} ${y}
          Z
        `;
      }

      return html`<g data-category="${v.category}" data-value="${v.value}">
        <path
          d="${pathData}"
          fill="${v.value > 0 ? "#c368f9" : "white"}"
          title="${v.category}: ${v.value}"
        />
        <text
          x="${v.value > 0 ? barX - 10 : valueScaleNegative(0) + 10}"
          y="${y + heightPerCategory / 2}"
          text-anchor="${v.value > 0 ? "end" : "start"}"
          class="charts-text-body charts-text-white"
          dominant-baseline="middle"
          >${l(7, loc, v.category)}</text
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
