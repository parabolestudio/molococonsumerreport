import { html, useEffect, useState } from "./utils/preact-htm.js";

const URL =
  "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/";

function setCountryDropdownOptions(countries, selectedCountry, callback) {
  // set values for country code dropdown
  // const countries = ["Australia", "Germany"];
  const uniqueCountries = Array.from(new Set(countries));
  let countryDropdown = document.querySelector("#viz11_dropdown_countries");
  if (countryDropdown) {
    if (countryDropdown) countryDropdown.innerHTML = "";
    uniqueCountries.forEach((country) => {
      let option = document.createElement("option");
      option.text = country;
      countryDropdown.add(option);
    });
    countryDropdown.value = selectedCountry;
    countryDropdown.addEventListener("change", (e) => {
      callback(e);
    });
  }
}
function setCategoryDropdownOptions(categories, selectedCategory, callback) {
  const uniqueCategories = Array.from(new Set(categories));
  let categoryDropdown = document.querySelector("#viz11_dropdown_categories");
  if (categoryDropdown) {
    if (categoryDropdown) categoryDropdown.innerHTML = "";
    uniqueCategories.forEach((country) => {
      let option = document.createElement("option");
      option.text = country;
      categoryDropdown.add(option);
    });
    categoryDropdown.value = selectedCategory;
    categoryDropdown.addEventListener("change", (e) => {
      callback(e);
    });
  }
}

export function Vis11() {
  const [selectedCountry, setSelectedCountry] = useState("Australia");
  const [selectedCategory, setSelectedCategory] = useState("Travel");
  const [genreData, setGenreData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);

  const [timeData, setTimeData] = useState([]);
  const [appData, setAppData] = useState([]);

  useEffect(() => {
    Promise.all([
      d3.csv(URL + "Viz11_1_genre_overview.csv"),
      d3.csv(URL + "Viz11_2_gender.csv"),
      d3.csv(URL + "Viz11_3_demographics.csv"),
      d3.csv(URL + "Viz11_4_time_spent.csv"),
      d3.csv(URL + "Viz11_5_top_apps.csv"),
    ]).then((files) => {
      const [
        genreDataFile,
        genderDataFile,
        ageDataFile,
        timeDataFile,
        appData,
      ] = files;
      setGenreData(genreDataFile);
      setGenderData(genderDataFile);
      setAgeData(ageDataFile);
      setTimeData(timeDataFile);
      setAppData(appData);

      // update country dropdown options
      const uniqueCountries = Array.from(
        new Set(genreDataFile.map((d) => d.Country))
      );
      setCountryDropdownOptions(uniqueCountries, selectedCountry, (e) => {
        setSelectedCountry(e.target.value);
      });

      // update category dropdown options
      const uniqueCategories = Array.from(
        new Set(genreDataFile.map((d) => d.Genre))
      );
      setCategoryDropdownOptions(uniqueCategories, selectedCategory, (e) => {
        setSelectedCategory(e.target.value);
      });
    });
  }, []);

  return html`<div class="vis-container-inner">
    <${Vis11Top}
      genreData=${genreData}
      selectedCountry="${selectedCountry}"
      selectedCategory="${selectedCategory}"
    />
    <div class="vis-11-part vis-11-bottom">
      <div class="vis-11-bottom-top-grid">
        <${Vis11Time}
          timeData="${timeData}"
          selectedCountry="${selectedCountry}"
          selectedCategory="${selectedCategory}"
        />
        <${Vis11App}
          appData="${appData}"
          selectedCountry="${selectedCountry}"
          selectedCategory="${selectedCategory}"
        />
      </div>
      <${Vis11GenderAge}
        genderData="${genderData}"
        ageData="${ageData}"
        selectedCountry="${selectedCountry}"
        selectedCategory="${selectedCategory}"
      />
    </div>
  </div>`;
}

const Vis11Top = ({ genreData, selectedCategory, selectedCountry }) => {
  if (!genreData || genreData.length === 0) {
    return html`<div>Loading...</div>`;
  }

  const filteredGenreData = genreData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );
  const numberApps = filteredGenreData[0]["Apps used in the past 30 days"];
  const numberAdOpportunities =
    filteredGenreData[0]["Ad opportunity every 24h"];

  const pillList = [
    filteredGenreData[0]["Top Ad Opportunity #1"],
    filteredGenreData[0]["Top Ad Opportunity #2"],
    filteredGenreData[0]["Top Ad Opportunity #3"],
  ];

  return html`<div class="vis-11-part vis-11-top">
    <p class="title">${selectedCategory}</p>
    <div class="vis-11-top-grid">
      <div class="element1">
        <p class="number">${numberApps}</p>
        <p class="label">IAE apps used</p>
        <p class="sublabel">in the past 30 days</p>
      </div>
      <div class="element2"><${DotSection} dotCount="${numberApps}" /></div>
      <div class="element3">
        <p class="number">${numberAdOpportunities}</p>
        <p class="label">Ad opportunities</p>
        <p class="sublabel">in the past 24 hours</p>
      </div>
      <div class="element4">
        <${DotSection} dotCount="${numberAdOpportunities}" />
      </div>
      <div class="element5">
        <p class="label">Top ad opportunities</p>
      </div>
      <div class="element6">
        ${pillList.map((pill) => html`<div class="pill label">${pill}</div>`)}
      </div>
    </div>
  </div>`;
};

const DotSection = ({ dotCount }) => {
  return html`<div class="dots">
    ${Array.from(
      { length: dotCount },
      (_, i) => html`<div class="dot" key=${i}></div>`
    )}
  </div>`;
};

const Vis11Time = ({ selectedCountry, selectedCategory, timeData }) => {
  const [barWidths, setBarWidths] = useState({});

  if (!timeData || timeData.length === 0) {
    return html`<div>Loading...</div>`;
  }
  console.log("timeData", timeData);
  const filteredTimeData = timeData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );
  filteredTimeData.forEach((d) => {
    d["value"] = parseFloat(d["%"].replace("%", ""));
  });
  filteredTimeData.sort((a, b) => b.value - a.value);
  console.log(filteredTimeData);

  const maxValue = Math.max(...filteredTimeData.map((d) => d.value));
  console.log("maxValue", maxValue);

  useEffect(() => {
    if (filteredTimeData.length === 0) return;

    // Add a small delay to ensure the DOM is fully rendered
    const calculateWidths = () => {
      const container = document.querySelector(".vis-11-time-grid");
      console.log("container", container);

      if (container) {
        const containerWidth = container.offsetWidth;
        // container width - gap * percentage bar-span (as 70%) minus 90px for value span
        const maxBarWidth = (containerWidth - 5) * 0.7 - 90;

        const newBarWidths = {};
        filteredTimeData.forEach((d, index) => {
          const barWidth = (d.value / maxValue) * maxBarWidth;
          newBarWidths[index] = barWidth;
        });

        setBarWidths(newBarWidths);
      }
    };

    // Try immediately and also with a small delay for safety
    calculateWidths();
    const timeoutId = setTimeout(calculateWidths, 10);

    return () => clearTimeout(timeoutId);
  }, [selectedCountry, selectedCategory, timeData]);

  return html`<div class="vis-11-time left">
    <p class="label">Where people spend their time</p>
    <p class="sublabel">Time spent vs general population</p>
    <div class="vis-11-time-grid">
      ${filteredTimeData.map(
        (d, index) => html`<div class="element${index * 2 + 1} sublabel">
            ${d["Top subcat for time spent"]}
          </div>
          <div class="element${index * 2 + 2} bar-container">
            <div class="bar" style="width: ${barWidths[index] || 50}px;"></div>
            <span class="number">+${d["value"]}%</span>
          </div>`
      )}
    </div>
  </div>`;
};

const Vis11App = ({ selectedCountry, selectedCategory, appData }) => {
  if (!appData || appData.length === 0) {
    return html`<div>Loading...</div>`;
  }
  const filteredAppData = appData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );
  filteredAppData.forEach((d) => {
    d["Position"] = +d["Position"];
  });
  filteredAppData.sort((a, b) => a.Position - b.Position);

  return html`<div class="vis-11-app right">
    <p class="label">Which apps are trending</p>
    <p class="sublabel">Top 3 ad supported apps</p>
    <div class="app-list">
      ${filteredAppData.map(
        (d) => html`
          <div class="app-item">
            <p class="position"></p>
            <p class="sublabel">${d["Top Growing App #1"]}</p>
            <p class="number">+${d["Growth"]}</p>
          </div>
        `
      )}
    </div>
  </div>`;
};

const Vis11GenderAge = ({
  selectedCountry,
  selectedCategory,
  ageData,
  genderData,
}) => {
  if (
    !genderData ||
    !ageData ||
    genderData.length === 0 ||
    ageData.length === 0
  ) {
    return html`<div>Loading...</div>`;
  }

  const filteredGenderData = genderData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );
  const filteredAgeData = ageData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );

  filteredGenderData.forEach((d) => {
    d["group"] = d["Demographics (Gender)"];

    d["value"] = +d["%"] * 100;
  });
  filteredAgeData.forEach((d) => {
    d["group"] = d["Demographics (Age)"];
    d["value"] = +d["%"] * 100;
  });

  const genderTemplateColumns = filteredGenderData
    .map((d) => `${d.value}%`)
    .join(" ");
  const genderGridElements = filteredGenderData.map(
    (d, i) => html`<div style="grid-area: 1 / ${i + 1} / 2 / ${i + 1};">
        <p class="sublabel">${d.group}</p>
      </div>
      <div style="grid-area: 2 / ${i + 1} / 3 / ${i + 1};" class="bar">
        <p class="number">${Math.round(d.value)}%</p>
      </div>`
  );

  const ageTemplateColumns = filteredAgeData
    .map((d) => `${d.value}%`)
    .join(" ");
  const ageGridElements = filteredAgeData.map(
    (d, i) => html`<div
        style="grid-area: 1 / ${i + 1} / 2 / ${i + 1};"
        class="group"
      >
        <p class="sublabel">${d.group}</p>
      </div>
      <div style="grid-area: 2 / ${i + 1} / 3 / ${i + 1};" class="bar">
        <p class="number">${Math.round(d.value)}%</p>
      </div>`
  );

  return html`<div>
    <p class="label">Who uses the apps</p>
    <div
      class="vis-11-grid-gender"
      style="grid-template-columns: ${genderTemplateColumns};"
    >
      ${genderGridElements}
    </div>
    <div
      class="vis-11-grid-age"
      style="grid-template-columns: ${ageTemplateColumns};"
    >
      ${ageGridElements}
    </div>
  </div>`;
};
