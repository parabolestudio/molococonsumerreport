import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis8() {
  // const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("USA");

  // // Fetch data on mount
  // useEffect(() => {
  //   d3.csv(
  //     "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz12_time_spent_during_day.csv"
  //   ).then((data) => {
  //     //   data.forEach((d) => {
  //     //     d["Value"] = +d["Value"];
  //     //     d["Year"] = +d["Year"];
  //     //   });

  //     setData(data);
  //   });
  // }, []);

  const categories = ["Category1", "Category2", "Category3"];
  const groups = ["18-24 year old", "25-45", "45+"];

  const data = [
    {
      countryCode: "USA",
      group: "18-24 year old",
      category: "Category1",
      value: Math.random() * 150 - 50, // Random value between -50 and 100
    },
    {
      countryCode: "USA",
      group: "18-24 year old",
      category: "Category2",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "USA",
      group: "18-24 year old",
      category: "Category3",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "USA",
      group: "25-45",
      category: "Category1",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "USA",
      group: "25-45",
      category: "Category2",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "USA",
      group: "25-45",
      category: "Category3",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "USA",
      group: "45+",
      category: "Category1",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "USA",
      group: "45+",
      category: "Category2",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "USA",
      group: "45+",
      category: "Category3",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "18-24 year old",
      category: "Category1",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "18-24 year old",
      category: "Category2",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "18-24 year old",
      category: "Category3",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "25-45",
      category: "Category1",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "25-45",
      category: "Category2",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "25-45",
      category: "Category3",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "45+",
      category: "Category1",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "45+",
      category: "Category2",
      value: Math.random() * 150 - 50,
    },
    {
      countryCode: "Canada",
      group: "45+",
      category: "Category3",
      value: Math.random() * 150 - 50,
    },
  ];

  console.log("Rendering Vis8 with data:", data);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // data group by country code and categories
  const groupedData = d3.group(data, (d) => d.countryCode);

  const groupedArray = Array.from(groupedData, ([key, values]) => {
    const groupedByCategory = d3.group(values, (d) => d.category);
    return {
      countryCode: key,
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
      }),
    };
  });
  console.log("Grouped Data:", groupedArray);

  // get selected country
  const groupedArrayFiltered =
    groupedArray.filter((d) => d.countryCode === selectedCountry)[0]
      ?.categories || [];
  console.log(
    "Filtered Grouped Data for selected country:",
    groupedArrayFiltered
  );
  const dataFiltered = groupedArrayFiltered;

  // set values for country code dropdown
  // const countries = data.map((d) => d.countryCode);
  const countries = ["USA", "Canada"];
  let countryDropdown = document.querySelector("#viz8_dropdown_countries");
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

  // layout dimensions
  const vis8Container = document.querySelector("#vis8");
  const width =
    vis8Container && vis8Container.offsetWidth
      ? vis8Container.offsetWidth
      : 600;
  const heightPerCategory = 20;
  const categoryPadding = 5;
  const margin = { top: 25, right: 5, bottom: 5, left: 115 };
  const height =
    (heightPerCategory + categoryPadding) * categories.length +
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
        stroke="#03004C"
      />
      <foreignObject
        x="${groupScale(group)}"
        y="${-24}"
        width="${bandwidth}"
        height="24"
        style="display: flex; align-items: center; justify-content: center;"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          class="charts-text-body"
          style="text-align: center; line-height: 24px; font-size: 14px; background-color: #E8C4FD; border-radius: 15px; padding: 0 10px; display: inline-block; margin: 0 auto;"
        >
          ${group}
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
        return html` <rect
          x="${barX}"
          y="${0}"
          width="${barWidth}"
          height="${heightPerCategory}"
          fill="${value > 0 ? "#C368F9" : "#040078"}"
          rx="2"
          ry="2"
        />`;
      })}
    </g> `;
  });

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        ${groupSections} ${rows}
      </g>
    </svg>
  </div>`;
}
