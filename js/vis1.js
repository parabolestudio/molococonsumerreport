import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis1() {
  const [timelineData, setTimelineData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      d3.csv(
        "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz1_1_growth_overview.csv"
      ),
      d3.csv(
        "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz1_2_growth_categories.csv"
      ),
    ]).then(function (files) {
      const timelineData = files[0];

      timelineData.forEach((d) => {
        d["revenue"] = +d["Yearly Worldwide IAP and Subscription Revenue ($B)"];
        d["year"] = +d["Year"];
        d["category"] = d["Category"];
        d["country"] = d["Country"];
        delete d["Yearly Worldwide IAP and Subscription Revenue ($B)"];
        delete d["Year"];
        delete d["Category"];
        delete d["Country"];
      });
      console.log("Data in Vis1 1:", timelineData);

      setTimelineData(timelineData);

      const categoryData = files[1];
      categoryData.forEach((d) => {
        d["categoryGrowth"] = +d["Growth ($B)"];
        d["category"] = d["Category"];
        d["country"] = d["Country"];
        delete d["Share of Total Revenue (%)"];
        delete d["Growth ($B)"];
        delete d["Category"];
        delete d["Country"];
      });

      setCategoryData(categoryData);
      console.log("Data in Vis1 2:", categoryData);
    });
  }, []);

  if (timelineData.length === 0) {
    return html`<div>Loading...</div>`;
  }

  const vis1Container = document.querySelector("#vis1_test");
  const width =
    vis1Container && vis1Container.offsetWidth
      ? vis1Container.offsetWidth
      : 600;
  const height = 400;

  const widthTimeline = width * 0.6;
  const widthCategories = width * 0.4;

  const marginTimeline = { top: 5, right: 25, bottom: 25, left: 25 };
  const innerHeightTimeline =
    height - marginTimeline.top - marginTimeline.bottom;
  const innerWidthTimeline =
    widthTimeline - marginTimeline.left - marginTimeline.right;

  const marginCategories = { top: 5, right: 5, bottom: 5, left: 5 };
  const innerHeightCategories =
    height - marginCategories.top - marginCategories.bottom;
  const innerWidthCategories =
    widthCategories - marginCategories.left - marginCategories.right;

  // timeline scale

  const xScaleTimeline = d3
    .scaleLinear()
    .domain([
      d3.min(timelineData, (d) => d.year) - 0.5,
      d3.max(timelineData, (d) => d.year) + 0.5,
    ])
    .range([0, innerWidthTimeline]);
  const yScaleTimeline = d3
    .scaleLinear()
    .domain([
      0, // d3.min(timelineData, (d) => d.revenue),
      d3.max(timelineData, (d) => d.revenue),
    ])
    .range([innerHeightTimeline, 0])
    .nice();
  const lineGenerator = d3
    .line()
    .x((d) => xScaleTimeline(d.year))
    .y((d) => yScaleTimeline(d.revenue))
    .curve(d3.curveCatmullRom);

  const gamingTimelineData = timelineData.filter(
    (d) => d.category === "Gaming Apps" && d.country === "All Countries"
  );
  const nonGamingTimelineData = timelineData.filter(
    (d) => d.category !== "Gaming Apps" && d.country === "All Countries"
  );

  const timelineGamingLatestItem =
    gamingTimelineData[gamingTimelineData.length - 1];
  const timelineNonGamingLatestItem =
    nonGamingTimelineData[nonGamingTimelineData.length - 1];

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border: 1px solid black;"
    >
      <g transform="translate(${marginTimeline.left}, ${marginTimeline.top})">
        <rect
          x="0"
          y="0"
          width="${innerWidthTimeline}"
          height="${innerHeightTimeline}"
          fill="transparent"
        />
        <line
          x1="${0}"
          y1="0"
          x2="${0}"
          y2="${innerHeightTimeline}"
          stroke="#000"
        />
        <line
          x1="${0}"
          y1="${innerHeightTimeline}"
          x2="${innerWidthTimeline}"
          y2="${innerHeightTimeline}"
          stroke="#000"
        />
        <text
          transform="rotate(-90)"
          x="${0}"
          y="${-marginTimeline.left + 15}"
          text-anchor="end"
          class="charts-text-body-bold"
        >
          Revenue
        </text>
        <path
          d="${lineGenerator(gamingTimelineData)}"
          fill="none"
          stroke="#16D2FF"
          stroke-width="4"
        />
        <path
          d="${lineGenerator(nonGamingTimelineData)}"
          fill="none"
          stroke="#0280FB"
          stroke-width="4"
        />
        <text
          x="${xScaleTimeline(timelineGamingLatestItem.year) + 15}"
          y="${yScaleTimeline(timelineGamingLatestItem.revenue)}"
          dominant-baseline="middle"
          class="charts-text-value-small"
        >
          $${timelineGamingLatestItem.revenue.toFixed(1)}B
        </text>
        <text
          x="${xScaleTimeline(timelineNonGamingLatestItem.year) + 15}"
          y="${yScaleTimeline(timelineNonGamingLatestItem.revenue)}"
          dominant-baseline="middle"
          class="charts-text-value-small"
        >
          $${timelineNonGamingLatestItem.revenue.toFixed(1)}B
        </text>
        <g>
          ${xScaleTimeline.ticks(6).map((tick) => {
            const x = xScaleTimeline(tick);
            return html`<g transform="translate(${x}, 0)">
              <line
                y1="0"
                y2="${innerHeightTimeline}"
                stroke="#000"
                stroke-opacity="0.5"
              />
              <text
                x="0"
                y="${innerHeightTimeline + 20}"
                text-anchor="middle"
                class="charts-text-body"
              >
                ${tick}
              </text>
            </g>`;
          })}
        </g>
      </g>

      <g
        transform="translate(${widthTimeline +
        marginCategories.left}, ${marginCategories.top})"
      >
        <rect
          x="${0}"
          y="0"
          width="${innerWidthCategories}"
          height="${innerHeightCategories}"
          fill="orange"
          fill-opacity="0.9"
        />
      </g>
    </svg>
  </div>`;
}
