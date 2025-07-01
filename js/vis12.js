import { html, useEffect, useState } from "./utils/preact-htm.js";

function updateMultiSelect(categories, initialCategories, callback) {
  const selectCategoryData = categories.map((category) => {
    return {
      id: category,
      text: category,
      defaultSelected: initialCategories.includes(category),
    };
  });

  if (typeof window !== "undefined" && window.$) {
    // create select2 dropdown options with categories of that country
    window.$("#viz12-select").empty();
    for (let i = 0; i < selectCategoryData.length; i++) {
      const item = selectCategoryData[i];
      const newOption = new Option(
        item.text,
        item.id,
        item.defaultSelected,
        item.defaultSelected
      );
      window.$("#viz12-select").append(newOption).trigger("change");
    }

    // create event listener to listen for changes
    window.$("#viz12-select").on("change", function (e) {
      const selectedCategories = window
        .$("#viz12-select")
        .select2("data")
        .map((d) => d.id);
      console.log("selectedCategories", selectedCategories);
      callback(selectedCategories);
    });
  }
}

export function Vis12() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("USA");
  const initialCategories = ["Automotive", "Business", "Entertainment"];
  const [selectedCategories, setSelectedCategories] = useState([
    "Automotive",
    "Business",
    "Entertainment",
  ]);
  // const [selectedCategories, setSelectedCategories] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz12_time_spent_during_day.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["value"] = +d["value"];
        d["hour_of_day"] = +d["hour_of_day"];
        d["countryCode"] = d["Country code"];
        d["category"] = d["Category"];
      });

      // data group by country code and categories
      const groupedData = d3.group(data, (d) => d.countryCode);

      const groupedArray = Array.from(groupedData, ([key, value]) => {
        const groupedByCategory = d3.group(value, (d) => d.category);

        const categories = Array.from(
          groupedByCategory,
          ([catKey, catValues]) => {
            return {
              category: catKey,
              hour_values: catValues.map((v) => ({
                hour_of_day: v.hour_of_day,
                value: v.value,
              })),
            };
          }
        );

        // filter out categories where all values are 0
        const filteredCategories = categories.filter(
          (item) =>
            !(item.hour_values.reduce((acc, curr) => acc + curr.value, 0) === 0)
        );

        return {
          countryCode: key,
          categories: filteredCategories,
        };
      });

      setData(groupedArray);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // set values for country code dropdown
  // const countries = data.map((d) => d.countryCode);
  const countries = data.map((d) => d.countryCode).sort();
  let countryDropdown = document.querySelector("#viz12_dropdown_countries");
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

  // filter data based on selected country
  // and get categories for that country
  const dataFiltered =
    data.filter((d) => d.countryCode === selectedCountry)[0]?.categories || [];
  const categories = dataFiltered.map((d) => d.category);

  // filter data based on selected categories
  const dataFilteredWithSelectedCategories = dataFiltered.filter((d) =>
    selectedCategories.includes(d.category)
  );

  // multi select dropdown for categories
  // coded separately in HTML with select2
  useEffect(() => {
    updateMultiSelect(
      categories,
      initialCategories,
      (newlySelectedCategories) => {
        setSelectedCategories(newlySelectedCategories);
      }
    );
  }, []);

  // layout dimensions
  const vis12Container = document.querySelector("#vis12");
  const width =
    vis12Container && vis12Container.offsetWidth
      ? vis12Container.offsetWidth
      : 600;
  const heightPerCategory = 50;
  const categoryPadding = 10;
  const valueOvershot = 40;
  const margin = { top: valueOvershot, right: 5, bottom: 20, left: 170 };
  const height =
    (heightPerCategory + categoryPadding) *
      dataFilteredWithSelectedCategories.length +
    categoryPadding +
    margin.top +
    margin.bottom;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const minValue = d3.min(dataFiltered, (d) =>
    d3.min(d.hour_values, (v) => v.value)
  );
  const maxValue = d3.max(dataFiltered, (d) =>
    d3.max(d.hour_values, (v) => v.value)
  );
  const valueScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([0, heightPerCategory + valueOvershot]);

  const hourScale = d3.scaleLinear().domain([0, 23]).range([0, innerWidth]);
  const areaGenerator = d3
    .area()
    .x((d) => hourScale(d.hour_of_day))
    .y0(heightPerCategory)
    .y1((d) => heightPerCategory - valueScale(d.value))
    .curve(d3.curveCatmullRom);

  const rows = dataFilteredWithSelectedCategories.map((d, index) => {
    return html`<g
      transform="translate(0, ${index * (heightPerCategory + categoryPadding)})"
      class="vis12-row"
    >
      <text
        x="${-10}"
        y="${heightPerCategory}"
        dominant-baseline="no-change"
        text-anchor="end"
        class="charts-text-body charts-text-white"
        >${d.category}</text
      >
      <path d=${areaGenerator(d.hour_values)} fill-opacity="0.99" />
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
      transform="translate(${hourScale(d)}, ${-10})"
      class="charts-text-body"
    >
      <text
        x="0"
        y="${innerHeight}"
        dy="0.5rem"
        dominant-baseline="hanging"
        text-anchor="middle"
        class="charts-text-body charts-text-white"
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
      style="width:100%; height:100%; background-color:#040078"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        ${xTicks}${rows}
      </g>
    </svg>
  </div>`;
}
