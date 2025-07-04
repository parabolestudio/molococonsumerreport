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
  const [timeData, setTimeData] = useState([]);
  const [appData, setAppData] = useState([]);

  useEffect(() => {
    Promise.all([
      d3.csv(URL + "Viz11_1_genre_overview.csv"),
      d3.csv(URL + "Viz11_4_time_spent.csv"),
      d3.csv(URL + "Viz11_5_top_apps.csv"),
    ]).then((files) => {
      const [genreDataFile, timeDataFile, appData] = files;
      setGenreData(genreDataFile);
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
  if (!timeData || timeData.length === 0) {
    return html`<div>Loading...</div>`;
  }
  console.log("timeData", timeData);
  const filteredTimeData = timeData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );
  console.log(filteredTimeData);
  return html`<div class="vis-11-time left">
    <p class="label">Where people spend their time</p>
    <p class="sublabel">Time spent vs general population</p>
  </div>`;
};

const Vis11App = ({ selectedCountry, selectedCategory, appData }) => {
  if (!appData || appData.length === 0) {
    return html`<div>Loading...</div>`;
  }
  console.log("appData", appData);
  const filteredAppData = appData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );
  filteredAppData.forEach((d) => {
    d["Position"] = +d["Position"];
  });
  filteredAppData.sort((a, b) => a.Position - b.Position);
  console.log(filteredAppData);

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

const Vis11GenderAge = ({ selectedCountry, selectedCategory }) => {
  const [rawGenderData, setRawGenderData] = useState([]);
  const [rawAgeData, setRawAgeData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);

  function prepData() {
    // prep gender data
    const copyRawGenderData = JSON.parse(JSON.stringify(rawGenderData));
    let preppedGenderData = copyRawGenderData.filter(
      (d) => d.Country === selectedCountry && d.Genre === selectedCategory
    );
    preppedGenderData.forEach((d) => {
      d["group"] = d["Demographics (Gender)"];
      delete d["Demographics (Gender)"];

      d["value"] = +d["%"] * 100;
      delete d["%"];
      delete d["Country"];
      delete d["Country code"];
      delete d["Genre"];
    });
    setGenderData(preppedGenderData);

    // prep age data
    const copyRawAgeData = JSON.parse(JSON.stringify(rawAgeData));
    let preppedAgeData = copyRawAgeData.filter(
      (d) => d.Country === selectedCountry && d.Genre === selectedCategory
    );
    preppedAgeData.forEach((d) => {
      d["group"] = d["Demographics (Age)"];
      delete d["Demographics (Age)"];

      d["value"] = +d["%"] * 100;
      delete d["%"];
      delete d["Country"];
      delete d["Country code"];
      delete d["Genre"];
    });
    setAgeData(preppedAgeData);
  }

  useEffect(() => {
    const fileName2 = "Viz11_2_gender.csv";
    const fileName3 = "Viz11_3_demographics.csv";
    Promise.all([d3.csv(URL + fileName2), d3.csv(URL + fileName3)]).then(
      (files) => {
        let [genderDataFile, ageDataFile] = files;

        setRawGenderData(genderDataFile);
        setRawAgeData(ageDataFile);
      }
    );
  }, []);

  useEffect(() => {
    if (
      rawGenderData.length > 0 &&
      rawAgeData.length > 0 &&
      selectedCountry &&
      selectedCategory
    ) {
      prepData();
    }
  }, [rawGenderData, rawAgeData, selectedCountry, selectedCategory]);

  if (
    !genderData ||
    !ageData ||
    genderData.length === 0 ||
    ageData.length === 0
  ) {
    return html`<div>Loading...</div>`;
  }

  const genderTemplateColumns = genderData.map((d) => `${d.value}%`).join(" ");
  const genderGridElements = genderData.map(
    (d, i) => html`<div style="grid-area: 1 / ${i + 1} / 2 / ${i + 1};">
        <p class="sublabel">${d.group}</p>
      </div>
      <div style="grid-area: 2 / ${i + 1} / 3 / ${i + 1};" class="bar">
        <p class="number">${Math.round(d.value)}%</p>
      </div>`
  );
  const ageTemplateColumns = ageData.map((d) => `${d.value}%`).join(" ");
  const ageGridElements = ageData.map(
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
