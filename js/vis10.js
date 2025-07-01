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

  console.log("Data for Viz 10:", data);

  // get data for country (test with USA)
  const selectedCountry = "US";
  const countryData = data.filter((d) => d.countryCode === selectedCountry)[0]
    .values;
  console.log("Country Data for Viz 10:", countryData);

  // data and scales

  // layout dimensions
  const width = 100;
  const height = 15;
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return html`<div class="vis-container-inner">
    <p>Vis10</p>
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%; border: 1px solid black;"
    >
      <g transform="translate(${margin.left}, ${margin.top})"></g>
    </svg>
  </div>`;
}
