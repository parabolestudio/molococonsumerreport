import { html, useEffect, useState } from "./utils/preact-htm.js";
import { getDataURL } from "./utils/helper.js";
import { getLabel as l } from "../localisation/labels.js";

function CategoryIcon({ category, heightBar, loc }) {
  // console.log("Rendering CategoryIcon with category:", category, loc);
  // Map your categories to SVG filenames (update as needed)
  const categoryToSvg = {
    [l(1, loc, "Social Networking")]: "social media.svg",
    [l(1, loc, "Social")]: "social.svg",
    [l(1, loc, "Utilities")]: "utility.svg",
    [l(1, loc, "Entertainment")]: "entertainment.svg",
    [l(1, loc, "Photo & Video")]: "photo and video.svg",
    [l(1, loc, "Productivity")]: "productivity.svg",
    [l(1, loc, "Lifestyle")]: "lifestyle.svg",
    [l(1, loc, "Education")]: "education.svg",
    [l(1, loc, "Health & Fitness")]: "health and fitness.svg",
    [l(1, loc, "Other")]: "data.svg",
    [l(1, loc, "Dating")]: "dating.svg",
    [l(1, loc, "Music & Audio")]: "music.svg",
    [l(1, loc, "Music")]: "music.svg",
    [l(1, loc, "Business")]: "business.svg",
    [l(1, loc, "Sports")]: "sports.svg",
    [l(1, loc, "Shopping")]: "shopping.svg",
    [l(1, loc, "Books & Reference")]: "books.svg",
    [l(1, loc, "Books")]: "books.svg",
    [l(1, loc, "Video Players & Editors")]: "video players.svg",
    [l(1, loc, "Communication")]: "communication.svg",
    [l(1, loc, "Tools")]: "tools.svg",
    [l(1, loc, "Comics")]: "comics.svg",
    [l(1, loc, "News")]: "news.svg",
    [l(1, loc, "Games")]: "gaming.svg",
    [l(1, loc, "Strategy")]: "gaming.svg",
    [l(1, loc, "Puzzle")]: "gaming.svg",
    [l(1, loc, "Board")]: "gaming.svg",
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
    fetch(
      `https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/assets/viz1-icons/${svgFile}`
    )
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

const formatRevenue = (value) => {
  return value > 1e9
    ? `$${d3.format(".3s")(value).replace("G", "B")}`
    : `$${d3.format(".4s")(value).replace("k", "K")}`;
};

const allValue = "All countries";
const allLabel = "Global";

export function Vis1({ locale: loc }) {
  const [timelineData, setTimelineData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(allValue);

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      d3.csv(getDataURL("Viz1_1", loc)),
      d3.csv(getDataURL("Viz1_2", loc)),
    ]).then(function (files) {
      const timelineData = files[0];

      timelineData.forEach((d) => {
        d["revenue"] = +d["Revenue"];
        d["year"] = +d["Year"];
        d["category"] = d["Category"];
        d["country"] = d["Country"];
        d["countryCode"] = d["Country code"];
      });

      setTimelineData(timelineData);

      const categoryData = files[1].filter((d) => d.category !== "");
      categoryData.forEach((d) => {
        d["revenue"] = +d["revenue"];
        d["year"] = +d["year"];
        d["country"] = d["Country"];
        d["countryCode"] = d["Country code"];
      });

      const countries = Array.from(
        new Set(categoryData.map((d) => d.countryCode))
      );

      const processedData = countries.flatMap((countryCode) => {
        const filteredData = categoryData.filter(
          (d) =>
            d.countryCode === countryCode &&
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
              country: countryCode,
              category: category,
              categoryGrowth: value2024[0].revenue - value2023[0].revenue,
            };
          }
        });
      });

      setCategoryData(processedData.filter((d) => d !== undefined));

      // set values for country code dropdown
      let countryDropdown = document.querySelector("#vis1_dropdown_countries");
      if (countryDropdown) {
        if (countryDropdown) countryDropdown.innerHTML = "";
        countries.forEach((country) => {
          let option = document.createElement("option");
          option.text =
            country === allValue ? l(1, loc, allLabel) : l(1, loc, country);
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

  if (timelineData.length === 0) {
    return html`<div>Loading...</div>`;
  }

  const isMobile = window.innerWidth <= 480;
  const vis1Container = document.querySelector("#vis1");
  const width =
    vis1Container && vis1Container.offsetWidth
      ? vis1Container.offsetWidth
      : 600;
  const heightTimeline = isMobile ? 350 : 500;
  const heightCategories = 500;

  const widthTimeline = isMobile ? width : width * 0.6;
  const widthCategories = isMobile ? width : width * 0.4;

  const marginTimeline = { top: 20, right: 60, bottom: 25, left: 25 };
  const innerHeightTimeline =
    heightTimeline - marginTimeline.top - marginTimeline.bottom;
  const innerWidthTimeline =
    widthTimeline - marginTimeline.left - marginTimeline.right;

  const marginCategories = { top: 50, right: 25, bottom: 5, left: 35 };
  const innerHeightCategories =
    heightCategories - marginCategories.top - marginCategories.bottom;
  const innerWidthCategories =
    widthCategories - marginCategories.left - marginCategories.right;

  const gamingTimelineData = timelineData
    .filter((d) => {
      return (
        d.category === l(1, loc, "Gaming") && d.countryCode === selectedCountry
      );
    })
    .sort((a, b) => a.year - b.year);
  const nonGamingTimelineData = timelineData
    .filter(
      (d) =>
        d.category !== l(1, loc, "Gaming") && d.countryCode === selectedCountry
    )
    .sort((a, b) => a.year - b.year);
  const timelineGamingLatestItem =
    gamingTimelineData[gamingTimelineData.length - 1];
  const timelineNonGamingLatestItem =
    nonGamingTimelineData[nonGamingTimelineData.length - 1];

  /**
   * TIMELINE
   */
  const yMax = Math.max(
    d3.max(gamingTimelineData, (d) => d.revenue),
    d3.max(nonGamingTimelineData, (d) => d.revenue)
  );
  const xScaleTimeline = d3
    .scaleLinear()
    .domain(d3.extent(timelineData, (d) => d.year))
    .range([0, innerWidthTimeline]);
  const yScaleTimeline = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([innerHeightTimeline, 0])
    .nice();
  const lineGenerator = d3
    .line()
    .x((d) => xScaleTimeline(d.year))
    .y((d) => yScaleTimeline(d.revenue))
    .curve(d3.curveCatmullRom);

  /*
    CATEGORY 
  */

  const categoryDataByCountry = categoryData
    .filter((d) => d.country === selectedCountry)
    .sort((a, b) => b.categoryGrowth - a.categoryGrowth)
    .slice(0, 10);

  const labelOffsetX = selectedCountry === "IDN" ? 225 : 160;
  const xScaleCategories = d3
    .scaleLinear()
    .domain([0, d3.max(categoryDataByCountry, (d) => d.categoryGrowth)])
    .range([0, innerWidthCategories - labelOffsetX]);

  const yScaleCategories = d3
    .scaleBand()
    .domain(categoryDataByCountry.map((d) => d.category))
    .range([0, innerHeightCategories])
    .padding(0.3);
  const heightBar = yScaleCategories.bandwidth();

  const getTimeline = () => {
    return html`
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
            ${l(1, loc, "Revenue")}
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
          stroke="#040078"
          stroke-width="4"
        />
        <path
          d="${lineGenerator(nonGamingTimelineData)}"
          fill="none"
          stroke="#0280FB"
          stroke-width="4"
        />
        ${selectedCountry !== "CAN" && timelineGamingLatestItem
          ? html`<text
              transform="translate(${xScaleTimeline(
                timelineGamingLatestItem.year
              )}, ${yScaleTimeline(timelineGamingLatestItem.revenue) - 10})"
              text-anchor="middle"
              class="charts-text-value-small timeline-label"
            >
              ${formatRevenue(timelineGamingLatestItem.revenue)}
            </text>`
          : ""}
        ${timelineNonGamingLatestItem
          ? html`<text
              transform="translate(${xScaleTimeline(
                timelineNonGamingLatestItem.year
              )}, ${yScaleTimeline(timelineNonGamingLatestItem.revenue) - 10})"
              text-anchor="middle"
              class="charts-text-value-small timeline-label"
            >
              ${formatRevenue(timelineNonGamingLatestItem.revenue)}
            </text>`
          : ""}
      </g>
    `;
  };

  const getCategories = () => {
    return html` <g
      class="categories"
      transform="translate(${isMobile
        ? marginCategories.left
        : widthTimeline + marginCategories.left}, ${marginCategories.top})"
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
              loc=${loc}
            />
            <text
              transform="translate(${Math.max(
                xScaleCategories(d.categoryGrowth) + 10,
                25
              )}, ${yScaleCategories.bandwidth() / 2})"
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
      <text x="-20" class="charts-text-body-bold"
        >${l(1, loc, "2024 vs. 2023 growth")}</text
      >
    </g>`;
  };

  if (isMobile) {
    return html`<div class="vis-container-inner">
      <svg
        viewBox="0 0 ${width} ${heightTimeline}"
        preserveAspectRatio="xMidYMid meet"
        style="width:100%; height:100%;"
      >
        ${getTimeline()}
      </svg>

      <svg
        viewBox="0 0 ${width} ${heightCategories}"
        preserveAspectRatio="xMidYMid meet"
        style="width:100%; height:100%;"
      >
        ${getCategories()}
      </svg>
    </div>`;
  } else {
    return html`<div class="vis-container-inner">
      <svg
        viewBox="0 0 ${width} ${heightTimeline}"
        preserveAspectRatio="xMidYMid meet"
        style="width:100%; height:100%;"
      >
        ${getTimeline()}

        <g>
          <line
            x1="${marginTimeline.left +
            xScaleTimeline(timelineNonGamingLatestItem.year)}"
            y1="${marginTimeline.top +
            yScaleTimeline(timelineNonGamingLatestItem.revenue)}"
            x2="${marginTimeline.left + widthTimeline - 20}"
            y2="${marginTimeline.top +
            yScaleTimeline(timelineNonGamingLatestItem.revenue)}"
            class="charts-line-dashed charts-line-dashed-blue"
          />
          <line
            x1="${marginTimeline.left + widthTimeline - 20}"
            y1="${marginTimeline.top + innerHeightTimeline}"
            x2="${marginTimeline.left + widthTimeline - 20}"
            y2="${marginTimeline.top +
              yScaleTimeline(timelineNonGamingLatestItem.revenue) <
            marginTimeline.top
              ? marginTimeline.top +
                yScaleTimeline(timelineNonGamingLatestItem.revenue)
              : marginTimeline.top}"
            class="charts-line-dashed charts-line-dashed-blue"
          />
        </g>

        ${getCategories()}
      </svg>
    </div>`;
  }
}
