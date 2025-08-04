import { html, useEffect, useState } from "./utils/preact-htm.js";

const URL =
  "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/";
const ASSETS_URL =
  "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/assets/";

const isMobile = window.innerWidth <= 425;

// Map categories to their corresponding icons
function getCategoryIcon(category) {
  const iconMap = {
    "E-Commerce": "shopping.svg",
    Entertainment: "entertainment.svg",
    Finance: "finance.svg",
    RMG: "sport betting.svg",
    Travel: "travel.svg",
    "On Demand": "on demand transportation.svg",
    Social: "social.svg",
  };
  return iconMap[category] || "travel.svg";
}

function getCategoryLabel(category) {
  const labelMap = {
    "E-Commerce": "E-Commerce",
    Entertainment: "Entertainment",
    Finance: "Finance",
    RMG: "Real Money Gaming",
    Travel: "Travel",
    // "On Demand": "On Demand",
    "On Demand": "Delivery & Food",
    Social: "Social Media",
  };
  return labelMap[category] || category;
}

function setCountryDropdownOptions(countries, selectedCountry, callback) {
  // set values for country code dropdown
  // const countries = ["Australia", "Germany"];
  const uniqueCountries = Array.from(new Set(countries));
  let countryDropdown = document.querySelector("#vis11_dropdown_countries");
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

export function Vis11() {
  const [selectedCountry, setSelectedCountry] = useState("U.S.");
  const initialCategory = window.vis11_initial_category || "E-Commerce";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [genreData, setGenreData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);

  const [timeData, setTimeData] = useState([]);
  const [appData, setAppData] = useState([]);
  const [svgCache, setSvgCache] = useState({});

  // Fetch and cache SVG content
  const fetchSvgContent = async (iconPath) => {
    if (svgCache[iconPath]) {
      return svgCache[iconPath];
    }

    try {
      const response = await fetch(ASSETS_URL + iconPath);
      const svgText = await response.text();
      setSvgCache((prev) => ({ ...prev, [iconPath]: svgText }));
      return svgText;
    } catch (error) {
      console.error("Error fetching SVG:", error);
      return null;
    }
  };

  useEffect(() => {
    Promise.all([
      d3.csv(URL + "Viz11_1_genre_overview.csv"),
      d3.csv(URL + "Viz11_2_gender.csv"),
      d3.csv(URL + "Viz11_3_demographics.csv"),
      d3.csv(URL + "Viz11_4_time_spent.csv"),
      d3.csv(URL + "Viz11_5_top_apps.csv"),
    ]).then(async (files) => {
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

      // Pre-fetch all SVG icons
      const uniqueCategories = Array.from(
        new Set(files[0].map((d) => d.Genre))
      ).sort();
      const iconPaths = uniqueCategories.map((cat) => getCategoryIcon(cat));
      const uniqueIcons = [...new Set(iconPaths)];

      for (const iconPath of uniqueIcons) {
        await fetchSvgContent(iconPath);
      }
    });
  }, []);

  useEffect(() => {
    // Listen for custom category change events
    const handleCategoryChange = (e) => {
      const newCategory = e.detail.selectedCategory;
      if (newCategory && newCategory !== selectedCategory)
        setSelectedCategory(newCategory);
    };
    document.addEventListener("viz11CategoryChanged", handleCategoryChange);

    return () => {
      document.removeEventListener(
        "viz11CategoryChanged",
        handleCategoryChange
      );
    };
  }, [selectedCategory]);

  useEffect(() => {
    // set color variables in css based on selected category, red for first category, green for second
    // and blue for third category
    const colors = {
      "E-Commerce": { main: "#60e2b7", secondary: "#ccf5e8" },
      Entertainment: { main: "#C368F9", secondary: "#E8C4FD" },
      Finance: { main: "#0280FB", secondary: "#ADEFFF" },
      "On Demand": { main: "#876AFF", secondary: "#CDC2FF" },
      RMG: { main: "#60e2b7", secondary: "#ccf5e8" },
      Social: { main: "#C368F9", secondary: "#E8C4FD" },
      Travel: { main: "#0280FB", secondary: "#ADEFFF" },
    };
    const selectedColor = colors[selectedCategory] || colors["E-Commerce"];
    document.documentElement.style.setProperty(
      "--vis11-main-color",
      selectedColor.main
    );
    document.documentElement.style.setProperty(
      "--vis11-secondary-color",
      selectedColor.secondary
    );
  }, [selectedCategory]);

  const iconPath = getCategoryIcon(selectedCategory);
  const svgContent = svgCache[iconPath];

  return html`<div class="vis-container-inner ${isMobile ? "mobile" : ""}">
    <div
      class="vis-11-main-category-icon"
      dangerouslySetInnerHTML=${{ __html: svgContent || "" }}
    ></div>
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

const DOTS_PER_CIRCLE = 28;
const RADII_CONCENTRIC_CIRCLES = [65, 65 + 12, 65 + 12 * 2, 65 + 12 * 3];

const getDotPositions = (numDots, center) => {
  const dots = [];
  let dotsPlaced = 0;
  let circleIdx = 0;
  while (dotsPlaced < numDots) {
    const dotsThisCircle = Math.min(DOTS_PER_CIRCLE, numDots - dotsPlaced);
    const r =
      RADII_CONCENTRIC_CIRCLES[circleIdx] ||
      RADII_CONCENTRIC_CIRCLES[RADII_CONCENTRIC_CIRCLES.length - 1];
    for (let i = 0; i < dotsThisCircle; i++) {
      const angle = (2 * Math.PI * i) / DOTS_PER_CIRCLE;
      const x = center + r * Math.cos(angle - Math.PI / 2);
      const y = center + r * Math.sin(angle - Math.PI / 2);
      dots.push({ x, y });
    }
    dotsPlaced += dotsThisCircle;
    circleIdx++;
  }
  return dots;
};

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

  const sizeDotSvg = 200;
  const dotRadius = 5;
  const dots1 = getDotPositions(numberApps, sizeDotSvg / 2);
  const dots2 = getDotPositions(numberAdOpportunities, sizeDotSvg / 2);

  return html`<div class="vis-11-part vis-11-top">
    <p class="title">${getCategoryLabel(selectedCategory)}</p>
    <div class="vis-11-top-grid">
      <div class="element1">
        ${isMobile
          ? ""
          : html`<svg viewBox="0 0 ${sizeDotSvg} ${sizeDotSvg}">
              ${dots1.map(
                (dot) => html`<circle
                  class="dot"
                  cx="${dot.x}"
                  cy="${dot.y}"
                  r="${dotRadius}"
                />`
              )}
            </svg>`}
        <p class="number">${numberApps}</p>
        <p class="label">IAE apps used</p>
        <p class="sublabel">in a month</p>
      </div>
      <div class="element2">
        ${isMobile
          ? ""
          : html`<svg viewBox="0 0 200 200">
              ${dots2.map(
                (dot) => html`<circle
                  class="dot"
                  cx="${dot.x}"
                  cy="${dot.y}"
                  r="${dotRadius}"
                />`
              )}
            </svg>`}
        <p class="number">${numberAdOpportunities}</p>
        <p class="label">Ad opportunities</p>
        <p class="sublabel">in 24 hours</p>
      </div>
      <div class="element3">
        <p class="label">Top ad opportunities</p>
        <div class="pill-list">
          ${pillList.map((pill) => html`<div class="pill label">${pill}</div>`)}
        </div>
      </div>
    </div>
  </div>`;
};

const Vis11Time = ({ selectedCountry, selectedCategory, timeData }) => {
  const [barWidths, setBarWidths] = useState({});

  if (!timeData || timeData.length === 0) {
    return html`<div>Loading...</div>`;
  }
  const filteredTimeData = timeData.filter(
    (d) => d.Country === selectedCountry && d.Genre === selectedCategory
  );
  filteredTimeData.forEach((d) => {
    d["value"] = parseFloat(d["%"].replace("%", ""));
  });
  filteredTimeData.sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...filteredTimeData.map((d) => d.value));

  useEffect(() => {
    if (filteredTimeData.length === 0) return;

    // Add a small delay to ensure the DOM is fully rendered
    const calculateWidths = () => {
      const container = document.querySelector(".vis-11-time-grid");

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
    <p class="label">Where users spend their time</p>
    <p class="sublabel">Time spent vs. general population</p>
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
    <p class="label">Global ad-supported apps</p>
    <p class="sublabel">Example publisher inventory</p>
    <div class="app-list">
      ${filteredAppData.map(
        (d) => html`
          <div class="app-item">
            <p class="position">${d["Position"]}</p>
            <p class="sublabel">${d["Top Growing App"]}</p>
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
        class="group ${d.value <= 2 && isMobile ? "tiny" : ""} ${d.value < 16 &&
        isMobile
          ? "small"
          : ""}"
        data-value="${d.value}"
        data-group="${d.group}"
      >
        <p class="sublabel">${d.group}</p>
      </div>
      <div
        style="grid-area: 2 / ${i + 1} / 3 / ${i + 1};"
        class="bar ${d.value < 2 && isMobile ? "tiny" : ""} ${d.value <= 16 &&
        isMobile
          ? "small"
          : ""}"
        data-value="${d.value}"
        data-group="${d.group}"
      >
        <p class="number">
          ${Math.round(d.value)}${d.value >= 8 || !isMobile ? "%" : ""}
        </p>
      </div>`
  );

  return html`<div>
    <p class="label">Age and gender split</p>
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

export function Vis11Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("E-Commerce");
  const [svgCache, setSvgCache] = useState({});

  // Fetch and cache SVG content
  const fetchSvgContent = async (iconPath) => {
    if (svgCache[iconPath]) {
      return svgCache[iconPath];
    }

    try {
      const response = await fetch(ASSETS_URL + iconPath);
      const svgText = await response.text();
      setSvgCache((prev) => ({ ...prev, [iconPath]: svgText }));
      return svgText;
    } catch (error) {
      console.error("Error fetching SVG:", error);
      return null;
    }
  };

  // get categories
  useEffect(() => {
    Promise.all([d3.csv(URL + "Viz11_1_genre_overview.csv")]).then(
      async (files) => {
        const uniqueCategories = Array.from(
          new Set(files[0].map((d) => d.Genre))
        ).sort();
        setCategories(uniqueCategories);

        // Pre-fetch all SVG icons
        const iconPaths = uniqueCategories.map((cat) => getCategoryIcon(cat));
        const uniqueIcons = [...new Set(iconPaths)];

        for (const iconPath of uniqueIcons) {
          await fetchSvgContent(iconPath);
        }
      }
    );
  }, []);

  const categoryItems = categories.map((category) => {
    const iconPath = getCategoryIcon(category);
    const svgContent = svgCache[iconPath];

    return html`<li
      class="category-item ${selectedCategory === category
        ? "active"
        : "inactive"}"
      onClick="${() => {
        setSelectedCategory(category);

        // Dispatch custom event to notify other components
        document.dispatchEvent(
          new CustomEvent("viz11CategoryChanged", {
            detail: { selectedCategory: category },
          })
        );
      }}"
    >
      <div
        class="category-icon"
        dangerouslySetInnerHTML=${{ __html: svgContent || "" }}
      ></div>
      <span>${getCategoryLabel(category)}</span>
    </li>`;
  });

  return html`
    <ul data-active-category="${selectedCategory}" class="category-list">
      ${categoryItems}
    </ul>
  `;
}
