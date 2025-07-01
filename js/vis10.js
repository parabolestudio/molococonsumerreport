import { html, useEffect, useState } from "./utils/preact-htm.js";

export function Vis10() {
  const [data, setData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data/Viz10_share_time_growth_last_year.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["country"] = d["Country"];
        d["category"] = d["Category"];
        // format "38.69%" to 38.69
        d["share"] = parseFloat(d["Share"].replace("%", ""));
        d["yearGrowth"] = d["2024 vs. 2023 Growth"]
          ? parseFloat(d["2024 vs. 2023 Growth"].replace("%", ""))
          : null;
      });

      // filter out total values only
      data = data.filter((d) => d["App"] === "Total");

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
  const minValue = d3.min(countryData, (d) => d.yearGrowth);
  const maxValue = d3.max(countryData, (d) => d.yearGrowth);
  // console.log("Min/Max Values for Viz 10:", minValue, maxValue);

  // layout dimensions
  const vis10Container = document.querySelector("#vis10_test");
  const width =
    vis10Container && vis10Container.offsetWidth
      ? vis10Container.offsetWidth
      : 600;
  const height = 300;
  const outerMargin = { top: 5, right: 5, bottom: 5, left: 5 };
  const outerWidth = width - outerMargin.left - outerMargin.right;
  const outerHeight = height - outerMargin.top - outerMargin.bottom;

  const sectionMargin = { top: 0, right: 0, bottom: 0, left: 20 };
  const exampleCountries = ["USA", "Canada", "Mexico"];
  const sectionScale = d3
    .scaleBand()
    .domain(exampleCountries)
    .range([0, outerWidth])
    .padding(0.1);
  const sectionInnerWidth =
    sectionScale.bandwidth() - sectionMargin.left - sectionMargin.right;

  const valueScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([outerHeight, 0]);

  return html`<div class="vis-container-inner">
    <p>Vis10</p>
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
          fill="lightgray"
        />
        ${exampleCountries.map((country, index) => {
          return html`<g
            class="section"
            transform="translate(${sectionScale(country)}, 0)"
          >
            <rect
              x="0"
              y="0"
              width="${sectionScale.bandwidth()}"
              height="${outerHeight}"
              fill="pink"
            />
            <g
              transform="translate(${sectionMargin.left}, ${sectionMargin.top})"
            >
              <line x1="0" y1="0" x2="0" y2="${outerHeight}" stroke="red" />
              <line
                x1="${-sectionMargin.left}"
                y1="${valueScale(0)}"
                x2="${sectionInnerWidth}"
                y2="${valueScale(0)}"
                stroke="blue"
              />
            </g>
          </g>`;
        })}
      </g>
    </svg>
  </div>`;
}
