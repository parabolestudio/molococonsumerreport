import { html, useEffect, useState } from "./utils/preact-htm.js";
import { getDataURL } from "./utils/helper.js";
import { getLabel as l } from "../localisation/labels.js";

export function Vis8({ locale: loc }) {
  const [ageData, setAgeData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("USA");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const nCategories = 10;

  // Fetch data on mount
  useEffect(() => {
    Promise.all([d3.csv(getDataURL("Viz8_1", loc))]).then((files) => {
      const [ageData] = files;

      ageData.forEach((d) => {
        d["value"] = +d["TIme spent change (%)"];
        d["group"] = d["Demographic Group"].trim();
        d["countryCode"] = d["Country code"];
      });

      const countries = ageData.map((d) => d.countryCode);
      const uniqueCountries = Array.from(new Set(countries)).sort((a, b) =>
        a.localeCompare(b)
      );
      setCountries(uniqueCountries);

      const categories = ageData.map((d) => d.Category);
      const uniqueCategories = Array.from(new Set(categories));
      setCategories(uniqueCategories);

      const groups = ageData.map((d) => d.group);
      const uniqueGroups = Array.from(new Set(groups));
      setGroups(uniqueGroups);

      // age data group by country code and categories
      const groupedData = d3.group(ageData, (d) => d.countryCode);

      const groupedArray = Array.from(groupedData, ([key, values]) => {
        const groupedByCategory = d3.group(values, (d) => d.Category);
        return {
          country: key,
          categories: Array.from(groupedByCategory, ([catKey, catValues]) => {
            const groupedByGroup = d3.group(catValues, (d) => d.group);
            return {
              category: catKey,
              groups: Array.from(groupedByGroup, ([grpKey, grpValues]) => {
                return {
                  group: grpKey,
                  value: d3.sum(grpValues, (d) => d.value),
                };
              }),
            };
          }).sort((a, b) => {
            // Sort categories alphabetically
            return a.category.localeCompare(b.category);
          }),
        };
      });

      setAgeData(groupedArray);

      // set values for country code dropdown
      let countryDropdown = document.querySelector("#vis8_dropdown_countries");
      if (countryDropdown) {
        if (countryDropdown) countryDropdown.innerHTML = "";
        uniqueCountries.forEach((country) => {
          let option = document.createElement("option");
          option.text = l(8, loc, country);
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

  if (ageData.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // get selected country
  const groupedArrayFiltered =
    ageData.filter((d) => d.country === selectedCountry)[0]?.categories || [];
  const dataFiltered =
    showMore === true
      ? groupedArrayFiltered
      : groupedArrayFiltered.slice(0, nCategories);

  // layout dimensions
  const isMobile = window.innerWidth <= 480;
  const vis8Container = document.querySelector("#vis8");
  const width =
    vis8Container && vis8Container.offsetWidth
      ? vis8Container.offsetWidth
      : 600;
  const heightPerCategory = 30;
  const categoryPadding = 15;
  const margin = { top: 25, right: 5, bottom: 5, left: 115 };
  const height =
    (heightPerCategory + categoryPadding) * dataFiltered.length +
    categoryPadding +
    margin.top +
    margin.bottom;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const groupScale = d3
    .scaleBand()
    .domain(groups)
    .range([0, innerWidth])
    .padding(0.05);
  const bandwidth = groupScale.bandwidth();

  const groupSections = groups.map((group) => {
    return html` <g>
      <line
        x1="${groupScale(group) + bandwidth / 2}"
        y1="0"
        x2="${groupScale(group) + bandwidth / 2}"
        y2="${innerHeight}"
        stroke="#000"
      />
      <foreignObject
        x="${groupScale(group)}"
        y="${-24}"
        width="${bandwidth}"
        height="24"
        class="category-label"
      >
        <div xmlns="http://www.w3.org/1999/xhtml">
          <span>
            ${loc === "en" && !isMobile
              ? l(8, loc, `${group} years old`)
              : group}</span
          >
        </div>
      </foreignObject>
    </g>`;
  });

  const minValue = d3.min(dataFiltered, (d) =>
    d3.max(d.groups, (g) => g.value)
  );
  const maxValue = d3.max(dataFiltered, (d) =>
    d3.max(d.groups, (g) => g.value)
  );
  const absMaxValue = Math.max(Math.abs(minValue), Math.abs(maxValue));
  const valueScaleNegative = d3
    .scaleLinear()
    .domain([-absMaxValue, 0])
    .range([0, bandwidth / 2]);
  const valueScalePositive = d3
    .scaleLinear()
    .domain([0, absMaxValue])
    .range([bandwidth / 2, bandwidth]);

  const rows = dataFiltered.map((d, index) => {
    const y = index * (heightPerCategory + categoryPadding) + categoryPadding;

    return html`<g transform="translate(0, ${y})">
      <text
        x="${-margin.left + 10}"
        y="${heightPerCategory / 2}"
        dominant-baseline="middle"
        class="charts-text-body"
      >
        ${d.category}
      </text>
      <line
        x1="${-margin.left + 10}"
        y1="${heightPerCategory + categoryPadding / 2}"
        x2="${width - margin.right}"
        y2="${heightPerCategory + categoryPadding / 2}"
        class="charts-line-dashed"
      />
      ${d.groups.map((group) => {
        const value = group.value;

        // positive and negative values are handled separately
        let barX,
          barWidth = 0;
        if (value >= 0) {
          barX = valueScalePositive(0) + groupScale(group.group);
          barWidth = valueScalePositive(value) - valueScalePositive(0);
        } else {
          barWidth = valueScaleNegative(0) - valueScaleNegative(value);
          barX = valueScaleNegative(0) - barWidth + groupScale(group.group);
        }
        // Make the corner radius adaptive to the bar width
        const maxRadius = 10;
        const radius = Math.min(maxRadius, barWidth / 2);
        let pathData;

        if (value > 0) {
          if (barWidth < 2) {
            // For very small bars, use a simple rectangle
            pathData = `
              M ${barX} ${0}
              L ${barX + barWidth} ${0}
              L ${barX + barWidth} ${heightPerCategory}
              L ${barX} ${heightPerCategory}
              Z
            `;
          } else {
            // Positive values: round top-right and bottom-right corners
            pathData = `
              M ${barX} ${0}
              L ${barX + barWidth - radius} ${0}
              Q ${barX + barWidth} ${0} ${barX + barWidth} ${radius}
              L ${barX + barWidth} ${heightPerCategory - radius}
              Q ${barX + barWidth} ${heightPerCategory} ${
              barX + barWidth - radius
            } ${heightPerCategory}
              L ${barX} ${heightPerCategory}
              Z
            `;
          }
        } else {
          if (barWidth < 2) {
            // For very small bars, use a simple rectangle
            pathData = `
              M ${barX} ${0}
              L ${barX + barWidth} ${0}
              L ${barX + barWidth} ${heightPerCategory}
              L ${barX} ${heightPerCategory}
              Z
            `;
          } else {
            // Negative values: round top-left and bottom-left corners
            pathData = `
              M ${barX + radius} ${0}
              L ${barX + barWidth} ${0}
              L ${barX + barWidth} ${heightPerCategory}
              L ${barX + radius} ${heightPerCategory}
              Q ${barX} ${heightPerCategory} ${barX} ${
              heightPerCategory - radius
            }
              L ${barX} ${radius}
              Q ${barX} ${0} ${barX + radius} ${0}
              Z
            `;
          }
        }

        return html`<path
          d="${pathData}"
          fill="${value > 0 ? "#C368F9" : "#040078"}"
          onmouseover="${() => {
            setHoveredItem({
              country: selectedCountry,
              category: d.category,
              group: group.group,
              value: value,
              x: barX + barWidth / 2,
              y: y + heightPerCategory / 2,
            });
          }}"
          onmouseout="${() => {
            setHoveredItem(null);
          }}"
        />`;
      })}
    </g> `;
  });

  return html`<div class="vis-container-inner viz8-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        ${rows} ${groupSections}
      </g>
    </svg>
    <div
      class="show-more"
      onClick="${() => {
        setShowMore(!showMore);

        if (showMore) {
          // scroll to #viz8
          const viz8Container = document.querySelector("#vis8");
          if (viz8Container) {
            viz8Container.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }}"
    >
      <span>
        ${showMore === true ? l(8, loc, "Show less") : l(8, loc, "Show more")}
      </span>

      ${showMore === true
        ? html`<svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_1748_8045"
              style="mask-type:alpha"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="18"
              height="18"
            >
              <rect width="18" height="18" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_1748_8045)">
              <path d="M5.25 9.375V8.625H12.75V9.375H5.25Z" fill="#1C1B1F" />
            </g>
          </svg>`
        : html`<svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_1495_406"
              style="mask-type:alpha"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="18"
              height="18"
            >
              <rect width="18" height="18" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_1495_406)">
              <path
                d="M8.625 9.875H4.5V9.125H8.625V5H9.375V9.125H13.5V9.875H9.375V14H8.625V9.875Z"
                fill="#1C1B1F"
              />
            </g>
          </svg>`}
    </div>
    <${Tooltip} hoveredItem=${hoveredItem} loc=${loc} />
  </div>`;
}

function Tooltip({ hoveredItem, loc }) {
  if (!hoveredItem) return null;

  const formatGrowth = (growth) => {
    if (growth === null || growth === undefined) return "N/A";
    return growth > 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
  };

  return html`<div
    class="tooltip"
    style="left: ${hoveredItem.x}px; top: ${hoveredItem.y}px;"
  >
    <p class="tooltip-title">${hoveredItem.category}</p>
    <div>
      <p class="tooltip-label">${l(8, loc, "Country")}</p>
      <p class="tooltip-value">${hoveredItem.country}</p>
    </div>
    <div>
      <p class="tooltip-label">${l(8, loc, "Age group")}</p>
      <p class="tooltip-value">${hoveredItem.group}</p>
    </div>
    <div>
      <p class="tooltip-label">
        ${l(8, loc, "Time spent vs. general population")}
      </p>
      <p class="tooltip-value">${formatGrowth(hoveredItem.value * 100)}</p>
    </div>
  </div>`;
}
