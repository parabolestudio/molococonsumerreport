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
  const [tooltipData, setTooltipData] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz10_share_time_growth_last_year.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["app"] = d["App"];
        delete d["App"];
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
      });

      // Process tooltip data
      const copyOfData = data.map((d) => ({ ...d }));
      const tooltipProcessedData = [];

      // Group by country and category
      const grouped = d3.group(
        copyOfData,
        (d) => d.country,
        (d) => d.category
      );

      grouped.forEach((categories, country) => {
        categories.forEach((apps, category) => {
          let categoryData = {
            country: country,
            category: category,
            share: 0,
            yearGrowth: null,
            apps: [],
          };

          apps.forEach((app) => {
            if (app.app === "Total") {
              // Set the total share and growth from the "Total" row
              categoryData.share = app.share;
              categoryData.yearGrowth = app.yearGrowth;
            } else {
              // Add individual apps
              categoryData.apps.push({
                appName: app.app,
                appShare: app.share,
              });
            }
          });

          // Sort apps by share in descending order
          categoryData.apps.sort((a, b) => b.appShare - a.appShare);

          tooltipProcessedData.push(categoryData);
        });
      });

      setTooltipData(tooltipProcessedData);

      // filter out total values only
      data = data.filter((d) => d["app"] === "Total");

      // data group by country
      const groupedData = d3.group(data, (d) => d.country);
      const groupedArray = Array.from(groupedData, ([key, values]) => {
        return {
          countryCode: key,
          values: values.map((v) => ({
            category: v.category,
            share: v.share,
            yearGrowth: v.yearGrowth,
          })),
        };
      });

      setData(groupedArray);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // console.log("Data for Viz 10:", data);

  // get data for country (test with USA)
  const selectedCountry = "US";
  const countryData = data.filter((d) => d.countryCode === selectedCountry)[0]
    .values;
  // console.log("Country Data for Viz 10:", countryData);

  // data and scales
  // TODO: make min / max based on all countries
  // for now, use USA as example
  const shareMinValue = d3.min(countryData, (d) => d.share);
  const shareMaxValue = d3.max(countryData, (d) => d.share);
  const shareRadiusScale = d3
    .scaleSqrt()
    .domain([shareMinValue, shareMaxValue])
    .range([5, 40]); // radius range for circles

  const growthMinValue = d3.min(countryData, (d) => d.yearGrowth);
  const growthMaxValue = d3.max(countryData, (d) => d.yearGrowth);

  // layout dimensions
  const vis10Container = document.querySelector("#vis10");
  const width =
    vis10Container && vis10Container.offsetWidth
      ? vis10Container.offsetWidth
      : 600;
  const height = 300;
  const outerMargin = { top: 5, right: 5, bottom: 5, left: 5 };
  const outerWidth = width - outerMargin.left - outerMargin.right;
  const outerHeight = height - outerMargin.top - outerMargin.bottom;

  const sectionMargin = { top: 0, right: 0, bottom: 20, left: 20 };
  const exampleCountries = ["US", "Canada", "Mexico"];
  const sectionScale = d3
    .scaleBand()
    .domain(exampleCountries)
    .range([0, outerWidth])
    .padding(0.05);
  const sectionInnerWidth =
    sectionScale.bandwidth() - sectionMargin.left - sectionMargin.right;
  const sectionInnerHeight =
    outerHeight - sectionMargin.top - sectionMargin.bottom;

  const valueScale = d3
    .scaleLinear()
    .domain([growthMinValue, growthMaxValue])
    .range([sectionInnerHeight, 0]);

  return html`<div class="vis-container-inner viz10-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border: 1px solid black;"
    >
      <g transform="translate(${outerMargin.left}, ${outerMargin.top})">
        <rect
          x="0"
          y="0"
          width="${outerWidth}"
          height="${outerHeight}"
          fill="transparent"
        />

        ${exampleCountries.map((country, index) => {
          const countryData = data[0].values;

          return html`<g
            class="section"
            transform="translate(${sectionScale(country) +
            sectionMargin.left}, ${sectionMargin.top})"
          >
            <rect
              x="0"
              y="0"
              width="${sectionScale.bandwidth()}"
              height="${sectionInnerHeight}"
              fill="white"
            />
            <g
              transform="translate(${sectionMargin.left}, ${sectionMargin.top})"
            >
              <g>
                <rect
                  x="0"
                  y="${valueScale(0)}"
                  width="${sectionInnerWidth}"
                  height="${sectionInnerHeight - valueScale(0)}"
                  fill="#F2F2F2"
                />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="${sectionInnerHeight}"
                  stroke="black"
                />
                <line
                  x1="${-sectionMargin.left}"
                  y1="${valueScale(0)}"
                  x2="${sectionInnerWidth}"
                  y2="${valueScale(0)}"
                  stroke="black"
                />
                <text
                  x="${sectionInnerWidth / 2}"
                  y="${sectionInnerHeight + 15}"
                  text-anchor="middle"
                  class="charts-text-body"
                  fill="black"
                >
                  ${country}
                </text>
              </g>
              <g class="circles">
                ${countryData.map((d) => {
                  return html` <circle
                    cx="50"
                    cy="${valueScale(d.yearGrowth)}"
                    r="${shareRadiusScale(d.share)}"
                    fill="${hoveredItem && hoveredItem.category === d.category
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
