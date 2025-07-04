import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis1() {
  const [timelineData, setTimelineData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("All Countries");

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
    });
  }, []);

  if (timelineData.length === 0) {
    return html`<div>Loading...</div>`;
  }

  const vis1Container = document.querySelector("#vis1");
  const width =
    vis1Container && vis1Container.offsetWidth
      ? vis1Container.offsetWidth
      : 600;
  const height = 500;

  const widthTimeline = width * 0.6;
  const widthCategories = width * 0.4;

  const marginTimeline = { top: 5, right: 60, bottom: 25, left: 25 };
  const innerHeightTimeline =
    height - marginTimeline.top - marginTimeline.bottom;
  const innerWidthTimeline =
    widthTimeline - marginTimeline.left - marginTimeline.right;

  const marginCategories = { top: 50, right: 5, bottom: 5, left: 35 };
  const innerHeightCategories =
    height - marginCategories.top - marginCategories.bottom;
  const innerWidthCategories =
    widthCategories - marginCategories.left - marginCategories.right;

  /**
   * TIMELINE
   */
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
    (d) => d.category === "Gaming Apps" && d.country === selectedCountry
  );
  const nonGamingTimelineData = timelineData.filter(
    (d) => d.category !== "Gaming Apps" && d.country === selectedCountry
  );
  const timelineGamingLatestItem =
    gamingTimelineData[gamingTimelineData.length - 1];
  const timelineNonGamingLatestItem =
    nonGamingTimelineData[nonGamingTimelineData.length - 1];

  const timelineGamingLegendItem =
    gamingTimelineData[gamingTimelineData.length - 1];
  const timelineNonGamingLegendItem =
    nonGamingTimelineData[nonGamingTimelineData.length - 1];

  /*
    CATEGORY 
  */

  const categoryDataByCountry = categoryData.filter(
    (d) => d.country === selectedCountry
  );

  const xScaleCategories = d3
    .scaleLinear()
    .domain([0, d3.max(categoryDataByCountry, (d) => d.categoryGrowth)])
    .range([0, innerWidthCategories - 170]);

  const yScaleCategories = d3
    .scaleBand()
    .domain(categoryDataByCountry.map((d) => d.category))
    .range([0, innerHeightCategories])
    .padding(0.3);
  const heightBar = yScaleCategories.bandwidth();

  // set values for country code dropdown
  const countries = timelineData.map((d) => d.country);
  const uniqueCountries = Array.from(new Set(countries));
  let countryDropdown = document.querySelector("#viz1_dropdown_countries");
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

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g
        class="timeline"
        transform="translate(${marginTimeline.left}, ${marginTimeline.top})"
      >
        <g class="axis">
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
        </g>
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
        <path
          d="${lineGenerator(gamingTimelineData)}"
          fill="none"
          stroke="#03004C"
          stroke-width="4"
        />
        <path
          d="${lineGenerator(nonGamingTimelineData)}"
          fill="none"
          stroke="#0280FB"
          stroke-width="4"
        />
        <text
          transform="translate(${xScaleTimeline(
            timelineGamingLegendItem.year
          )}, ${yScaleTimeline(timelineGamingLegendItem.revenue) - 20})"
          class="charts-text-body-bold"
          fill="#03004C"
          text-anchor="middle"
        >
          Gaming Apps
        </text>
        <text
          transform="translate(${xScaleTimeline(
            timelineNonGamingLegendItem.year
          )}, ${yScaleTimeline(timelineNonGamingLegendItem.revenue) - 20})"
          class="charts-text-body-bold"
          fill="#0280FB"
          text-anchor="middle"
        >
          Consumer Apps
        </text>
        <text
          transform="translate(${xScaleTimeline(timelineGamingLatestItem.year) +
          15}, ${yScaleTimeline(timelineGamingLatestItem.revenue)})"
          dominant-baseline="middle"
          class="charts-text-value-small timeline-label"
        >
          $${timelineGamingLatestItem.revenue.toFixed(1)}B
        </text>
        <text
          transform="translate(${xScaleTimeline(
            timelineNonGamingLatestItem.year
          ) + 15}, ${yScaleTimeline(timelineNonGamingLatestItem.revenue)})"
          dominant-baseline="middle"
          class="charts-text-value-small timeline-label"
        >
          $${timelineNonGamingLatestItem.revenue.toFixed(1)}B
        </text>
      </g>

      <g
        class="categories"
        transform="translate(${widthTimeline +
        marginCategories.left}, ${marginCategories.top})"
      >
        <rect
          x="${0}"
          y="0"
          width="${innerWidthCategories}"
          height="${innerHeightCategories}"
          fill="transparent"
        />
        <g class="rows">
          ${categoryDataByCountry.map((d) => {
            return html`<g
              transform="translate(0, ${yScaleCategories(d.category)})"
            >
              <rect
                x="0"
                y="0"
                width="${xScaleCategories(d.categoryGrowth)}"
                height="${yScaleCategories.bandwidth()}"
                fill="#0280FB"
                rx="10"
                ry="10"
              />
              <${CategoryIcon}
                category="${d.category}"
                heightBar=${heightBar}
              />
              <text
                transform="translate(${xScaleCategories(d.categoryGrowth) +
                10}, ${yScaleCategories.bandwidth() / 2})"
                dominant-baseline="middle"
              >
                <tspan class="charts-text-body">${d.category}</tspan>
                <tspan dx="10" dy="1" class="charts-text-value-small"
                  >$${d.categoryGrowth.toFixed(1)}B</tspan
                >
              </text>
            </g>`;
          })}
        </g>
        <text x="-20" class="charts-text-body-bold">2024 vs. 2023 growth</text>
      </g>
    </svg>
  </div>`;
}

function CategoryIcon({ category, heightBar }) {
  const categoryMapping = {
    "Social Networking": "social",
    Utilities: "utility",
    Entertainment: "entertainment",
    "Photo & Video": "photo_video",
    Productivity: "utility",
    Music: "music",
    Lifestyle: "lifestyle",
    Education: "education",
    "Health & Fitness": "health_fitness",
    Other: "data",
  };

  const iconHeight = 35;
  const iconOffsetX = iconHeight / -2;
  const iconOffsetY = (iconHeight - heightBar) / -2;
  const iconBackgroundColor = "#5CDEFF";
  const iconForegroundColor = "#0280FB";
  switch (categoryMapping[category]) {
    case "social":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})"
        ><circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <mask
          id="a"
          width="26"
          height="26"
          x="5"
          y="4"
          maskUnits="userSpaceOnUse"
          style="mask-type:alpha"
        >
          <path fill="#D9D9D9" d="M5.526 4.912h24.561v24.561H5.526z" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="${iconForegroundColor}"
            d="M13.714 19.24H21.9v-.512c0-.728-.367-1.3-1.1-1.714-.734-.415-1.732-.623-2.994-.623-1.262 0-2.26.208-2.993.623-.734.415-1.1.986-1.1 1.714v.512Zm4.093-4.316c.54 0 1-.189 1.377-.567.378-.378.568-.837.568-1.377s-.19-1-.568-1.377a1.875 1.875 0 0 0-1.377-.568c-.54 0-1 .19-1.377.568a1.875 1.875 0 0 0-.567 1.377c0 .54.189 1 .567 1.377.378.378.837.567 1.377.567ZM7.573 27.427V8.665c0-.46.17-.86.508-1.199a1.64 1.64 0 0 1 1.198-.507h17.056c.46 0 .86.17 1.199.507.338.339.507.738.507 1.199v12.963c0 .46-.169.86-.507 1.198a1.64 1.64 0 0 1-1.199.507H11.667l-4.094 4.094Z"
          /> </g
      ></g>`;
    case "utility":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})"
        ><circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <mask
          id="a"
          width="26"
          height="26"
          x="5"
          y="4"
          maskUnits="userSpaceOnUse"
          style="mask-type:alpha"
        >
          <path fill="#D9D9D9" d="M5.526 4.912h24.561v24.561H5.526z" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="${iconForegroundColor}"
            d="m25.073 26.404-6.149-6.15 1.69-1.688 6.148 6.15-1.689 1.688Zm-14.617 0-1.689-1.689 7.3-7.3-2.405-2.405-.63.63-1.186-1.184v2.149l-.648.648-3.113-3.113.648-.648h2.166l-1.245-1.245L13.1 8.8c.307-.307.64-.52.997-.64a3.634 3.634 0 0 1 1.152-.178c.41 0 .793.074 1.151.221.358.148.69.376.998.683l-2.61 2.61 1.245 1.244-.648.649 2.354 2.353 2.848-2.848a3.02 3.02 0 0 1-.268-.708 3.357 3.357 0 0 1-.098-.819c0-.938.334-1.74 1.002-2.409a3.285 3.285 0 0 1 2.41-1.002c.255 0 .48.026.677.077.196.051.374.122.533.213l-2.294 2.294 1.893 1.893 2.294-2.294c.097.17.172.36.226.567.054.208.081.44.081.695 0 .939-.334 1.742-1.002 2.41a3.284 3.284 0 0 1-2.409 1.002c-.273 0-.517-.02-.733-.06a2.6 2.6 0 0 1-.606-.188L10.456 26.404Z"
          /> </g
      ></g>`;
    case "entertainment":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})"
        ><circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <mask
          id="a"
          width="26"
          height="26"
          x="5"
          y="4"
          maskUnits="userSpaceOnUse"
          style="mask-type:alpha"
        >
          <path fill="#D9D9D9" d="M5.526 4.912h24.561v24.561H5.526z" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="${iconForegroundColor}"
            d="m15.3 20.604 6.942-4.434-6.942-4.435v8.87Zm-1.416 5.8v-2.047H9.28c-.46 0-.86-.17-1.198-.508a1.64 1.64 0 0 1-.508-1.198V9.688c0-.46.17-.86.508-1.198a1.64 1.64 0 0 1 1.198-.508h17.056c.46 0 .86.17 1.199.508.338.338.507.738.507 1.198v12.963c0 .46-.169.86-.507 1.198a1.639 1.639 0 0 1-1.199.508H21.73v2.047h-7.846Z"
          />
        </g>
      </g>`;
    case "photo_video":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <path
          fill="${iconForegroundColor}"
          d="M17.534 22.447c1.194 0 2.209-.418 3.045-1.254.835-.836 1.253-1.85 1.253-3.045 0-1.194-.418-2.208-1.253-3.044-.836-.836-1.851-1.254-3.045-1.254s-2.209.418-3.044 1.254c-.836.836-1.254 1.85-1.254 3.044s.418 2.21 1.253 3.045c.836.836 1.851 1.254 3.045 1.254Zm0-1.91a2.308 2.308 0 0 1-1.695-.693 2.306 2.306 0 0 1-.693-1.696c0-.668.231-1.233.693-1.695a2.306 2.306 0 0 1 1.695-.693c.669 0 1.234.231 1.696.693.461.462.692 1.027.692 1.695 0 .669-.23 1.234-.692 1.696a2.306 2.306 0 0 1-1.696.692ZM9.893 25.79a1.84 1.84 0 0 1-1.35-.561 1.84 1.84 0 0 1-.56-1.35V12.417c0-.525.186-.975.56-1.349a1.84 1.84 0 0 1 1.35-.561H12.9l1.768-1.91h5.73l1.768 1.91h3.008c.526 0 .976.187 1.35.561.374.374.56.824.56 1.35v11.461c0 .526-.186.975-.56 1.35a1.84 1.84 0 0 1-1.35.56H9.893Z"
        />
      </g>`;
    case "education":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <mask
          id="a"
          width="27"
          height="27"
          x="4"
          y="4"
          maskUnits="userSpaceOnUse"
          style="mask-type:alpha"
        >
          <path fill="#D9D9D9" d="M4.912 4.912h25.79v25.79H4.912z" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="${iconForegroundColor}"
            d="M27.478 23.18v-7.415l-9.671 5.265-11.82-6.447 11.82-6.447 11.82 6.447v8.597h-2.149Zm-9.671 4.298-7.522-4.084v-5.372l7.522 4.083 7.522-4.083v5.373l-7.522 4.083Z"
          />
        </g>
      </g>`;
    case "health_fitness":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <mask
          id="a"
          width="26"
          height="26"
          x="5"
          y="4"
          maskUnits="userSpaceOnUse"
          style="mask-type:alpha"
        >
          <path fill="#D9D9D9" d="M5.526 4.912h24.561v24.561H5.526z" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="${iconForegroundColor}"
            d="M7.573 16.34v-5.628c0-.46.17-.86.508-1.199a1.64 1.64 0 0 1 1.198-.507h17.056c.46 0 .86.169 1.199.507.338.339.507.738.507 1.199v7.197a4.463 4.463 0 0 0-.883-.294 4.237 4.237 0 0 0-2.102.073 4.6 4.6 0 0 0-1.108.486 3.65 3.65 0 0 0-1.195-.495V16.34h-3.385l-1.817-3.633a.647.647 0 0 0-.324-.316 1.091 1.091 0 0 0-.887 0 .647.647 0 0 0-.324.316l-3.326 6.67-1.279-2.576a.75.75 0 0 0-.324-.346.92.92 0 0 0-.444-.115h-3.07Zm1.706 9.04c-.46 0-.86-.169-1.198-.507a1.64 1.64 0 0 1-.508-1.199v-5.628h2.533l1.817 3.633a.75.75 0 0 0 .324.345.922.922 0 0 0 .887 0 .75.75 0 0 0 .324-.345l3.326-6.67 1.279 2.576a.806.806 0 0 0 .303.329.93.93 0 0 0 .413.132h.904a4.406 4.406 0 0 0-1.85 1.595c-.472.71-.708 1.515-.708 2.413 0 .716.123 1.323.37 1.821.248.497.616 1 1.105 1.505H9.28Zm12.366-6.14c.46 0 .887.102 1.28.307.391.204.733.503 1.023.895.29-.392.63-.69 1.023-.895a2.724 2.724 0 0 1 1.28-.307c.784 0 1.449.273 1.995.819.546.545.819 1.21.819 1.995 0 .614-.222 1.207-.666 1.778-.443.572-1.415 1.497-2.916 2.776l-1.535 1.33-1.536-1.33c-1.5-1.279-2.473-2.204-2.916-2.776-.444-.571-.665-1.164-.665-1.778 0-.784.273-1.45.818-1.995a2.716 2.716 0 0 1 1.996-.82Z"
          />
        </g>
      </g>`;

    case "music":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <mask
          id="a"
          width="24"
          height="24"
          x="6"
          y="6"
          maskUnits="userSpaceOnUse"
          style="mask-type:alpha"
        >
          <path fill="#D9D9D9" d="M6.864 6.864h22.153v22.153H6.864z" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="${iconForegroundColor}"
            d="M18.108 20.379c.635 0 1.173-.22 1.612-.659.439-.439.658-.976.658-1.612v-4.995h2.725v-1.817H19.47v4.995a2.155 2.155 0 0 0-1.362-.454c-.636 0-1.174.22-1.613.659a2.192 2.192 0 0 0-.658 1.612c0 .636.22 1.173.658 1.612.44.44.977.659 1.613.659Zm-4.088 2.724c-.5 0-.927-.177-1.283-.533a1.75 1.75 0 0 1-.533-1.283v-10.9c0-.499.178-.926.533-1.282a1.75 1.75 0 0 1 1.283-.534h10.9c.499 0 .927.178 1.282.534.356.356.534.783.534 1.283v10.899c0 .5-.178.927-.534 1.283a1.75 1.75 0 0 1-1.283.534H14.02Zm-3.633 3.633c-.5 0-.927-.177-1.283-.533a1.75 1.75 0 0 1-.533-1.283V12.204h1.816V24.92h12.716v1.816H10.387Z"
          />
        </g>
      </g>`;
    case "lifestyle":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <mask
          id="a"
          width="24"
          height="24"
          x="6"
          y="6"
          maskUnits="userSpaceOnUse"
          style="mask-type:alpha"
        >
          <path fill="#D9D9D9" d="M6.141 6.141h23.333v23.333H6.141z" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="${iconForegroundColor}"
            d="M17.807 27.53c-.534 0-.992-.191-1.373-.572a1.872 1.872 0 0 1-.571-1.373h3.889c0 .535-.19.992-.571 1.373a1.873 1.873 0 0 1-1.374.571Zm-3.889-2.917v-1.945h7.778v1.945h-7.778Zm.244-2.917a7.45 7.45 0 0 1-2.662-2.674 7.076 7.076 0 0 1-.984-3.645c0-2.026.709-3.748 2.126-5.165 1.418-1.418 3.14-2.127 5.165-2.127 2.026 0 3.747.709 5.165 2.127 1.418 1.418 2.127 3.14 2.127 5.165a7.076 7.076 0 0 1-.984 3.646 7.45 7.45 0 0 1-2.662 2.673h-7.291Z"
          />
        </g>
      </g>`;
    case "data":
      return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="${iconBackgroundColor}" />
        <path
          fill="${iconForegroundColor}"
          d="M7.573 26.233v-1.706h20.468v1.706H7.573Zm1.024-3.07V16.17h2.729v6.993h-2.73Zm5.219 0v-12.11h2.73v12.11h-2.73Zm5.236 0v-9.04h2.73v9.04h-2.73Zm5.237 0V7.983h2.729v15.18h-2.73Z"
        />
      </g>`;
    default:
      return null;
  }
}
