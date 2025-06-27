import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis12() {
  const [data, setData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz12_time_spent_during_day.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["Value"] = +d["Value"];
        d["hour_of_day"] = +d["hour_of_day"];
      });

      console.log("Vis12 data", data);

      const groupedData = d3.group(data, (d) => d["Category"]);

      // convert grouped data to an array of objects
      const groupedArray = Array.from(groupedData, ([key, values]) => {
        return {
          category: key,
          values: values.map((v) => ({
            hour_of_day: v.hour_of_day,
            value: v.Value,
          })),
        };
      });

      // filter out categories where all values are 0
      const filteredArray = groupedArray.filter(
        (item) =>
          !(item.values.reduce((acc, curr) => acc + curr.value, 0) === 0)
      );

      setData(filteredArray);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }
  console.log("Vis12 data", data);

  const vis12Container = document.querySelector("#vis12_test");
  const width =
    vis12Container && vis12Container.offsetWidth
      ? vis12Container.offsetWidth
      : 600;
  const heightPerCategory = 50;
  const categoryPadding = 10;
  const height =
    (heightPerCategory + categoryPadding) * data.length + categoryPadding;

  const margin = { top: 5, right: 5, bottom: 20, left: 170 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const minValue = d3.min(data, (d) => d3.min(d.values, (v) => v.value));
  const maxValue = d3.max(data, (d) => d3.max(d.values, (v) => v.value));
  console.log("Vis12 minValue", minValue);
  console.log("Vis12 maxValue", maxValue);
  const valueScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([0, heightPerCategory + 40]);
  const areaGenerator = d3
    .area()
    .x((d) => hourScale(d.hour_of_day))
    .y0(heightPerCategory)
    .y1((d) => heightPerCategory - valueScale(d.value))
    .curve(d3.curveCatmullRom);

  const hourScale = d3.scaleLinear().domain([0, 23]).range([0, innerWidth]);

  const rows = data.map((d, index) => {
    return html`<g
      transform="translate(0, ${index * (heightPerCategory + categoryPadding)})"
      class="vis12-row"
    >
      <text
        x="${-10}"
        y="${heightPerCategory}"
        dominant-baseline="no-change"
        text-anchor="end"
        class="charts-text-body"
        >${d.category}</text
      >
      <path d=${areaGenerator(d.values)} fill-opacity="0.99" />
    </g>`;
  });

  const tickHours = [3, 6, 9, 12, 15, 18, 21];
  const xTicks = tickHours.map((d) => {
    // Format hour to am/pm
    const hour = d % 24;
    const ampm =
      hour === 0
        ? "12am"
        : hour < 12
        ? `${hour}am`
        : hour === 12
        ? "12pm"
        : `${hour - 12}pm`;

    return html` <g
      transform="translate(${hourScale(d)}, ${0})"
      class="charts-text-body"
    >
      <text
        x="0"
        y="${innerHeight}"
        dy="0.5rem"
        dominant-baseline="hanging"
        text-anchor="middle"
        >${ampm}</text
      >
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="${innerHeight}"
        stroke="#D3D6DF"
        stroke-width="0.5"
      />
    </g>`;
  });

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border: 1px solid black;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        ${xTicks}${rows}
      </g>
    </svg>
  </div>`;
}
