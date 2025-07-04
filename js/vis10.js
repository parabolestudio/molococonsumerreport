import { html, useEffect, useState } from "./utils/preact-htm.js";

function Tooltip({ hoveredItem, tooltipData }) {
  if (!hoveredItem || !tooltipData) return null;

  // Find the category data in the array
  const categoryData = tooltipData.find(
    (d) =>
      d.country === hoveredItem.country && d.category === hoveredItem.category
  );
  console.log("Category Data in Tooltip:", categoryData);

  if (!categoryData) return null;

  const formatGrowth = (growth) => {
    if (growth === null || growth === undefined) return "N/A";
    return growth > 0 ? `+${growth.toFixed(2)}%` : `${growth.toFixed(2)}%`;
  };

  return html`<div class="viz10-tooltip">
    <p class="tooltip-title">${categoryData.category}</p>
    <div>
      <p class="tooltip-label">Total time spent</p>
      <p class="tooltip-value">${categoryData.share.toFixed(2)}%</p>
    </div>
    <div>
      <p class="tooltip-label">Growth (2024 vs 2023)</p>
      <p class="tooltip-value">${formatGrowth(categoryData.yearGrowth)}</p>
    </div>
    <div>
      <p class="tooltip-label">Number of apps</p>
      <p class="tooltip-value">${categoryData.apps.length}</p>
    </div>
    <div>
      <p class="tooltip-label">Apps</p>
      <div class="tooltip-apps">
        ${categoryData.apps.map(
          (app) =>
            html`<p class="tooltip-app">
              ${app.appName} (${app.appShare.toFixed(2)}%)
            </p>`
        )}
      </div>
    </div>
  </div>`;
}

export function Vis10() {
  const [data, setData] = useState([]);
  const initialCountries = ["United States", "Australia", "India"];
  const [selectedCountries, setSelectedCountries] = useState(initialCountries);

  const [tooltipData, setTooltipData] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz10_share_time_growth_last_year_updated.csv"
    ).then((data) => {
      data.forEach((d) => {
        // d["app"] = d["App"];
        // delete d["App"];
        d["country"] = d["Country"];
        delete d["Country"];
        d["category"] = d["Category"];
        delete d["Category"];
        // format "38.69%" to 38.69
        d["share"] = parseFloat(d["Share"].replace("%", ""));
        delete d["Share"];
        d["yearGrowth"] = d["2024 vs. 2023 Growth"]
          ? parseFloat(d["2024 vs. 2023 Growth"].replace("%", ""))
          : null;
        delete d["2024 vs. 2023 Growth"];

        d["randomX"] = Math.random();
      });

      // Process tooltip data CURRENTLY NO REAL DATA FOR APPS
      // const copyOfData = data.map((d) => ({ ...d }));
      // const tooltipProcessedData = [];

      // // Group by country and category
      // const grouped = d3.group(
      //   copyOfData,
      //   (d) => d.Country,
      //   (d) => d.ategory
      // );

      // grouped.forEach((categories, country) => {
      //   categories.forEach((apps, category) => {
      //     let categoryData = {
      //       country: country,
      //       category: category,
      //       share: 0,
      //       yearGrowth: null,
      //       apps: [],
      //     };

      //     apps.forEach((app) => {
      //       if (app.app === "Total") {
      //         // Set the total share and growth from the "Total" row
      //         categoryData.share = app.share;
      //         categoryData.yearGrowth = app.yearGrowth;
      //       } else {
      //         // Add individual apps
      //         categoryData.apps.push({
      //           appName: app.app,
      //           appShare: app.share,
      //         });
      //       }
      //     });

      //     // Sort apps by share in descending order
      //     categoryData.apps.sort((a, b) => b.appShare - a.appShare);

      //     tooltipProcessedData.push(categoryData);
      //   });
      // });

      // setTooltipData(tooltipProcessedData);

      // filter out total values only
      // data = data.filter((d) => d["app"] === "Total");

      // filter GenAI due to outlier
      data = data.filter((d) => d.category !== "Generative AI");

      // data group by country
      const groupedData = d3.group(data, (d) => d.country);
      console.log("Grouped Data:", groupedData);
      const groupedArray = Array.from(groupedData, ([key, value]) => {
        return {
          country: key,
          values: value.map((v) => ({
            category: v.category,
            share: v.share,
            yearGrowth: v.yearGrowth,
            randomX: v.randomX,
          })),
        };
      });
      console.log("Grouped Array:", groupedArray);

      setData(groupedArray);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  console.log("Right after loading data for Viz 10:", data);

  // data and scales

  // filter data by selected countries
  const filteredData = data.filter((d) =>
    selectedCountries.includes(d.country)
  );
  console.log("Filtered Data:", filteredData);

  const shareMinValue = d3.min(filteredData, (d) =>
    d3.min(d.values, (v) => v.share)
  );
  const shareMaxValue = d3.max(filteredData, (d) =>
    d3.max(d.values, (v) => v.share)
  );
  console.log("Share Min/Max Values:", shareMinValue, shareMaxValue);

  const shareRadiusScale = d3
    .scaleSqrt()
    .domain([shareMinValue, shareMaxValue])
    .range([5, 50]);

  const growthMinValue = d3.min(filteredData, (d) =>
    d3.min(d.values, (v) => v.yearGrowth)
  );
  const growthMaxValue = d3.max(filteredData, (d) =>
    d3.max(d.values, (v) => v.yearGrowth)
  );
  console.log("Growth Min/Max Values:", growthMinValue, growthMaxValue);

  // layout dimensions
  const vis10Container = document.querySelector("#vis10");
  const width =
    vis10Container && vis10Container.offsetWidth
      ? vis10Container.offsetWidth
      : 600;
  const height = 600;
  const outerMargin = { top: 5, right: 5, bottom: 5, left: 5 };
  const outerWidth = width - outerMargin.left - outerMargin.right;
  const outerHeight = height - outerMargin.top - outerMargin.bottom;

  const sectionMargin = { top: 0, right: 0, bottom: 20, left: 20 };
  const sectionScale = d3
    .scaleBand()
    .domain(selectedCountries)
    .range([0, outerWidth])
    .padding(0.05);
  const sectionInnerWidth =
    sectionScale.bandwidth() - sectionMargin.left - sectionMargin.right;
  const sectionInnerHeight =
    outerHeight - sectionMargin.top - sectionMargin.bottom;

  const valueScale = d3
    .scaleLinear()
    .domain([growthMinValue, growthMaxValue])
    .range([sectionInnerHeight, 0])
    .nice();

  const xScale = d3
    .scalePoint()
    .domain(filteredData[0].values.map((d) => d.category))
    .range([0, sectionInnerWidth]);

  return html`<div class="vis-container-inner viz10-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${outerMargin.left}, ${outerMargin.top})">
        <rect
          x="0"
          y="0"
          width="${outerWidth}"
          height="${outerHeight}"
          fill="transparent"
        />

        ${selectedCountries.map((country, countryIndex) => {
          const countryData = filteredData.filter(
            (d) => d.country === country
          )[0].values;
          console.log("Filtered Country Data:", countryData);
          // sort values by share in descending order to have larger circles below
          countryData.sort((a, b) => b.share - a.share);

          return html`<g
            class="section"
            transform="translate(${sectionScale(country) +
            sectionMargin.left}, ${sectionMargin.top})"
          >
            <g
              transform="translate(${sectionMargin.left}, ${sectionMargin.top})"
            >
              <g>
                <rect
                  y="${valueScale(0)}"
                  width="${sectionInnerWidth}"
                  height="${sectionInnerHeight - valueScale(0)}"
                  fill="#F2F2F2"
                />
                <line
                  y2="${sectionInnerHeight}"
                  stroke="black"
                  stroke-width="0.5"
                />
                <line
                  x1="${-sectionMargin.left}"
                  y1="${valueScale(0)}"
                  x2="${sectionInnerWidth}"
                  y2="${valueScale(0)}"
                  stroke="black"
                  stroke-width="0.5"
                />

                ${countryIndex === 0
                  ? html`<text
                        transform="translate(${-sectionMargin.left +
                        5}, ${valueScale(0) - 10}) rotate(-90)"
                        class="charts-text-body"
                        dominant-baseline="middle"
                      >
                        Growing →
                      </text>
                      <text
                        transform="translate(${-sectionMargin.left +
                        5}, ${valueScale(0) + 10}) rotate(-90)"
                        class="charts-text-body"
                        dominant-baseline="middle"
                        text-anchor="end"
                      >
                        ← Decreasing
                      </text>
                      <text
                        transform="translate(${-sectionMargin.left -
                        25}, ${valueScale(0)}) rotate(-90)"
                        class="charts-text-body-bold"
                        dominant-baseline="middle"
                        text-anchor="middle"
                      >
                        Time spent in 2024 vs 2023
                      </text>`
                  : ""}
                <text
                  x="${sectionInnerWidth / 2}"
                  y="${sectionInnerHeight + 15}"
                  text-anchor="middle"
                  class="charts-text-body"
                  fill="black"
                >
                  ${country}
                </text>
                <text
                  dx="5"
                  y="${valueScale(valueScale.domain()[0])}"
                  dy="-10"
                  class="charts-text-body"
                  dominant-baseline="middle"
                  >${valueScale.domain()[0].toFixed(2)}%</text
                >
                <text
                  dx="5"
                  y="${valueScale(valueScale.domain()[1])}"
                  dy="10"
                  class="charts-text-body"
                  dominant-baseline="middle"
                  >${valueScale.domain()[1].toFixed(2)}%</text
                >
              </g>
              <g class="circles">
                ${countryData.map((d) => {
                  // Random placement within sectionInnerWidth for each circle
                  let x = xScale(d.category);
                  if (x - shareRadiusScale(d.share) < 0) {
                    x = shareRadiusScale(d.share);
                  } else if (
                    x + shareRadiusScale(d.share) >
                    sectionInnerWidth
                  ) {
                    x = sectionInnerWidth - shareRadiusScale(d.share);
                  }
                  return html` <circle
                    cx="${x}"
                    cy="${valueScale(d.yearGrowth)}"
                    r="${shareRadiusScale(d.share)}"
                    fill="${hoveredItem && hoveredItem.Category === d.Category
                      ? "#C368F9"
                      : "#03004C"}"
                    data-category="${d.category}"
                    onmouseover="${() => {
                      setHoveredItem({ category: d.category, country });
                    }}"
                    onmouseout="${() => {
                      setHoveredItem(null);
                    }}"
                  />`;
                })}
              </g>
            </g>
          </g>`;
        })}
      </g>
    </svg>
    <${Tooltip} hoveredItem=${hoveredItem} tooltipData=${tooltipData} />
  </div>`;
}
