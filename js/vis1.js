import { html, useEffect, useState } from "./utils/preact-htm.js";

function CategoryIcon({ category, heightBar }) {
  // Map your categories to SVG filenames (update as needed)
  const categoryToSvg = {
    "Social Networking": "social media.svg",
    Social: "social.svg",
    Utilities: "utility.svg",
    Entertainment: "entertainment.svg",
    "Photo & Video": "photo and video.svg",
    Productivity: "utility.svg",
    Lifestyle: "lifestyle.svg",
    Education: "education.svg",
    "Health & Fitness": "health and fitness.svg",
    Other: "data.svg",
    Dating: "dating.svg",
    "Music & Audio": "music.svg",
    Music: "music.svg",
    Business: "business.svg",
    Sports: "sports.svg",
    Shopping: "shopping.svg",
    "Books & Reference": "books.svg",
    Books: "books.svg",
    "Video Players & Editors": "video players.svg",
    Communication: "communication.svg",
    Tools: "tools.svg",
    Comics: "comics.svg",
    News: "news.svg",
    Games: "gaming.svg",
    Strategy: "gaming.svg",
    Puzzle: "gaming.svg",
    Board: "gaming.svg",
  };

  const [svgContent, setSvgContent] = useState(null);
  const iconHeight = 35;
  const iconOffsetX = iconHeight / -2;
  const iconOffsetY = (iconHeight - heightBar) / -2;

  useEffect(() => {
    const svgFile = categoryToSvg[category];
    if (!svgFile) {
      setSvgContent(null);
      return;
    }
    fetch(`assets/viz1-icons/${svgFile}`)
      .then((res) => res.text())
      .then((svg) => setSvgContent(svg))
      .catch(() => setSvgContent(null));
  }, [category]);

  if (!svgContent) return null;
  // Inline the SVG and apply transform for positioning
  return html`<g transform="translate(${iconOffsetX}, ${iconOffsetY})">
    <foreignObject width="${iconHeight}" height="${iconHeight}">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style="width:${iconHeight}px;height:${iconHeight}px;display:flex;align-items:center;justify-content:center;"
      >
        <span dangerouslySetInnerHTML=${{ __html: svgContent }} />
      </div>
    </foreignObject>
  </g>`;
}

const quarterMap = {
  Q1: "1",
  Q2: "4",
  Q3: "7",
  Q4: "10",
};

// const formatRevenue = (value) => `$${(value/1e9).toFixed(1)}B`;
const formatRevenue = (value) => {
  return value > 1e9
    ? `$${d3.format(".3s")(value).replace("G", "B")}`
    : `$${d3.format(".4s")(value)}`;
};

export function Vis1() {
  const [timelineData, setTimelineData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Australia");

  const parseTime = d3.utcParse("%Y-%m");

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      d3.csv(
        "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz1_1_growth_overview_updated.csv"
      ),
      d3.csv(
        "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz1_2_growth_categories_updated.csv"
      ),
    ]).then(function (files) {
      const timelineData = files[0];

      timelineData.forEach((d) => {
        d["revenue"] = +d["Revenue"].replace(/,/g, "");
        const [year, quarter] = d["Quarter"].split("-");
        d["date"] = parseTime(`${year}-${quarterMap[quarter]}`);
        d["category"] = d["Category"];
        d["country"] = d["Country"];
        delete d["Revenue"];
        delete d["Year"];
        delete d["Category"];
        delete d["Country"];
        delete d["Quarter"];
      });

      setTimelineData(timelineData);

      const categoryData = files[1].filter((d) => d.category !== "");
      categoryData.forEach((d) => {
        d["revenue"] = +d["revenue"];
        d["country"] = d["Country"];
        d["year"] = +d["year"];
        delete d["Share of Total Revenue (%)"];
        delete d["Growth ($B)"];
        delete d["Category"];
        delete d["Country"];
      });

      const countries = Array.from(new Set(categoryData.map((d) => d.country)));

      const processedData = countries.flatMap((country) => {
        const filteredData = categoryData.filter(
          (d) =>
            d.country === country &&
            d.category2 !== "Gaming" &&
            (d.year === 2024 || d.year === 2023)
        );
        const categories = Array.from(
          new Set(filteredData.map((d) => d.category))
        );

        return categories.flatMap((category) => {
          const value2024 = filteredData.filter(
            (d) => d.category === category && d.year === 2024
          );
          const value2023 = filteredData.filter(
            (d) => d.category === category && d.year === 2023
          );

          if (value2023.length === 1 && value2024.length === 1) {
            return {
              country: country,
              category: category,
              categoryGrowth: value2024[0].revenue - value2023[0].revenue,
            };
          }
        });
      });

      setCategoryData(processedData.filter((d) => d !== undefined));
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

  const marginTimeline = { top: 20, right: 60, bottom: 25, left: 25 };
  const innerHeightTimeline =
    height - marginTimeline.top - marginTimeline.bottom;
  const innerWidthTimeline =
    widthTimeline - marginTimeline.left - marginTimeline.right;

  const marginCategories = { top: 50, right: 15, bottom: 5, left: 35 };
  const innerHeightCategories =
    height - marginCategories.top - marginCategories.bottom;
  const innerWidthCategories =
    widthCategories - marginCategories.left - marginCategories.right;

  const gamingTimelineData = timelineData
    .filter((d) => d.category === "Gaming" && d.country === selectedCountry)
    .sort((a, b) => a.date - b.date);
  const nonGamingTimelineData = timelineData
    .filter((d) => d.category !== "Gaming" && d.country === selectedCountry)
    .sort((a, b) => a.date - b.date);
  const timelineGamingLatestItem =
    gamingTimelineData[gamingTimelineData.length - 1];
  const timelineNonGamingLatestItem =
    nonGamingTimelineData[nonGamingTimelineData.length - 1];

  const timelineGamingLegendItem = gamingTimelineData[4];
  const timelineNonGamingLegendItem = nonGamingTimelineData[4];

  /**
   * TIMELINE
   */
  const yMax = Math.max(
    d3.max(gamingTimelineData, (d) => d.revenue),
    d3.max(nonGamingTimelineData, (d) => d.revenue)
  );
  const xScaleTimeline = d3
    .scaleTime()
    .domain(d3.extent(timelineData, (d) => d.date))
    .range([0, innerWidthTimeline]);
  const yScaleTimeline = d3
    .scaleLinear()
    .domain([
      0, // d3.min(timelineData, (d) => d.revenue),
      yMax,
    ])
    .range([innerHeightTimeline, 0])
    .nice();
  const lineGenerator = d3
    .line()
    .x((d) => xScaleTimeline(d.date))
    .y((d) => yScaleTimeline(d.revenue))
    .curve(d3.curveCatmullRom);

  /*
    CATEGORY 
  */

  const categoryDataByCountry = categoryData
    .filter((d) => d.country === selectedCountry)
    .sort((a, b) => b.categoryGrowth - a.categoryGrowth)
    .slice(0, 10);

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
  let countryDropdown = document.querySelector("#vis1_dropdown_countries");
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
          ${xScaleTimeline.ticks(6).map((tick, index) => {
            if (index === 0) return html``;
            const x = xScaleTimeline(tick);
            return html`<g transform="translate(${x}, 0)">
              <line y1="0" y2="${innerHeightTimeline}" stroke=" #D9D9D9" />
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
            timelineGamingLegendItem.date
          )}, ${yScaleTimeline(timelineGamingLegendItem.revenue) - 25})"
          class="charts-text-body-bold"
          fill="#03004C"
          text-anchor="middle"
        >
          Gaming Apps
        </text>
        <text
          transform="translate(${xScaleTimeline(
            timelineNonGamingLegendItem.date
          )}, ${yScaleTimeline(timelineNonGamingLegendItem.revenue) - 25})"
          class="charts-text-body-bold"
          fill="#0280FB"
          text-anchor="middle"
        >
          Consumer Apps
        </text>
        <text
          transform="translate(${xScaleTimeline(
            timelineGamingLatestItem.date
          )}, ${yScaleTimeline(timelineGamingLatestItem.revenue) - 10})"
          text-anchor="middle"
          class="charts-text-value-small timeline-label"
        >
          ${formatRevenue(timelineGamingLatestItem.revenue)}
        </text>
        <text
          transform="translate(${xScaleTimeline(
            timelineNonGamingLatestItem.date
          )}, ${yScaleTimeline(timelineNonGamingLatestItem.revenue) - 10})"
          text-anchor="middle"
          class="charts-text-value-small timeline-label"
        >
          ${formatRevenue(timelineNonGamingLatestItem.revenue)}
        </text>
      </g>

      <g>
        <line
          x1="${marginTimeline.left +
          xScaleTimeline(timelineNonGamingLatestItem.date)}"
          y1="${marginTimeline.top +
          yScaleTimeline(timelineNonGamingLatestItem.revenue)}"
          x2="${marginTimeline.left + widthTimeline - 20}"
          y2="${marginTimeline.top +
          yScaleTimeline(timelineNonGamingLatestItem.revenue)}"
          class="charts-line-dashed charts-line-dashed-blue"
        />
        <line
          x1="${marginTimeline.left + widthTimeline - 20}"
          y1="${marginCategories.top + innerHeightCategories}"
          x2="${marginTimeline.left + widthTimeline - 20}"
          y2="${marginCategories.top}"
          class="charts-line-dashed charts-line-dashed-blue"
        />
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
                  >${formatRevenue(d.categoryGrowth)}</tspan
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
