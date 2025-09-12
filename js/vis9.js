import { html, useEffect, useState } from "./utils/preact-htm.js";
import { getDataURL } from "./utils/helper.js";
import { getLabel as l } from "../localisation/labels.js";

const allValue = "All countries";
const allLabel = "Global";

export function Vis9({ locale: loc }) {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(allValue);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    d3.csv(getDataURL("Viz9", loc)).then((data) => {
      data.forEach((d) => {
        d["DAU"] = parseFloat(d["DAU"].replaceAll(",", ""));
        d["Hours"] = parseFloat(d["Hours"].replaceAll(",", ""));
        d["countryCode"] = d["Country code"];
      });

      setData(data);

      // set values for country code dropdown
      const countries = data.map((d) => d.countryCode);
      const uniqueCountries = Array.from(new Set(countries)).sort();
      let countryDropdown = document.querySelector("#vis9_dropdown_countries");
      if (countryDropdown) {
        if (countryDropdown) countryDropdown.innerHTML = "";
        uniqueCountries.forEach((country) => {
          let option = document.createElement("option");
          option.text =
            country === allValue ? l(9, loc, allLabel) : l(9, loc, country);
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

  if (data.length === 0) {
    return html`<div>Loading...</div>`;
  }

  // layout dimensions
  const vis9Container = document.querySelector("#vis9");
  const width =
    vis9Container && vis9Container.offsetWidth
      ? vis9Container.offsetWidth
      : 600;

  const height = width; // make it square
  const margin = { top: 65, right: 15, bottom: 55, left: 90 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // data and scales
  const dataFiltered = data.filter((d) => d.countryCode === selectedCountry);
  // sort so "Independent App Ecosystem" is always last
  dataFiltered.sort((a, b) => {
    if (a.App === l(9, loc, "Independent App Ecosystem")) return 1;
    if (b.App === l(9, loc, "Independent App Ecosystem")) return -1;
    return a.App.localeCompare(b.App);
  });

  const hourScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataFiltered, (d) => d.Hours)])
    .range([0, innerWidth])
    .nice();

  const [minDau, maxDau] = d3.extent(dataFiltered, (d) => d.DAU);
  const dauScale = d3.scaleLinear().domain([0, maxDau]).range([innerHeight, 0]);

  const circleRadius = 8;

  return html`<div class="vis-container-inner">
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
      style="width:100%; height:100%;"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        <rect
          x="0"
          y="0"
          width="${innerWidth}"
          height="${innerHeight}"
          fill="transparent"
        />
        <g class="x-axis">
          <line
            x1="${0}"
            x2="${innerWidth}"
            y1="${innerHeight}"
            y2="${innerHeight}"
            stroke="#D9D9D9"
          />
          <text
            class="charts-text-body-bold"
            dominant-baseline="hanging"
            dx="12"
            text-anchor="middle"
            x="${innerWidth / 2}"
            y="${innerHeight + 39}"
          >
            ${l(9, loc, "Time spent")}
          </text>
          <g class="hour-ticks">
            ${hourScale.ticks(5).map((tick) => {
              const x = hourScale(tick);
              const formattedTick = d3.format(".2s")(tick).replace("G", "B");
              return html` <text
                x="${x}"
                y="${innerHeight + 29}"
                text-anchor="middle"
                class="charts-text-body"
                >${tick !== 0 ? formattedTick : ""}</text
              >`;
            })}
          </g>
        </g>
        <g class="y-axis">
          <line
            x1="${0}"
            x2="${0}"
            y1="${0}"
            y2="${innerHeight}"
            stroke="#D9D9D9"
          />
          <text
            class="charts-text-body-bold"
            dominant-baseline="hanging"
            dx="12"
            text-anchor="middle"
            x="${-75}"
            y="${innerHeight / 2}"
            transform="rotate(-90 ${-75} ${innerHeight / 2})"
          >
            ${l(9, loc, "DAU")}
          </text>
          <g class="dau-ticks">
            ${dauScale.ticks(5).map((tick) => {
              const y = dauScale(tick);
              const formattedTick = d3.format(".2s")(tick).replace("G", "B");
              return html` <text
                x="${-16}"
                y="${y + 4}"
                text-anchor="end"
                class="charts-text-body"
                >${tick !== 0 ? formattedTick : ""}</text
              >`;
            })}
          </g>
        </g>
        <g class="lollipops">
          ${dataFiltered.map((d) => {
            const isTextTooWide = hourScale(d.Hours) + 100 > innerWidth;
            const xText = isTextTooWide ? 17.5 : -17.5;
            const textAnchor = isTextTooWide ? "end" : "begin";
            return html`
              <g
                transform="translate(${hourScale(d.Hours)}, ${dauScale(d.DAU)})"
                onmouseover="${() => {
                  setHoveredItem({
                    dau: d.DAU,
                    hours: d.Hours,
                    country: d.Country,
                    app: d.App,
                    x: hourScale(d.Hours),
                    y: dauScale(d.DAU),
                    r: circleRadius,
                  });
                }}"
                onmouseout="${() => {
                  setHoveredItem(null);
                }}"
              >
                <${SocialMediaIcon} category="${d.App}" loc="${loc}" />
                ${d.App === l(9, loc, "Independent App Ecosystem") &&
                loc === "en"
                  ? html` <text
                      x="${xText}"
                      y="40.5"
                      dy="0"
                      text-anchor="${textAnchor}"
                      class="charts-text-body"
                    >
                      <tspan
                        x="${xText}"
                        dy="0"
                        fill="#12976B"
                        font-size="14"
                        font-weight="700"
                      >
                        Independent
                      </tspan>
                      <tspan
                        x="${xText}"
                        dy="20"
                        fill="#12976B"
                        font-size="14"
                        font-weight="700"
                      >
                        App Ecosystem
                      </tspan>
                    </text>`
                  : d.App === l(9, loc, "Independent App Ecosystem")
                  ? html`<text
                      x="0"
                      y="40.5"
                      dy="0"
                      text-anchor="middle"
                      class="charts-text-body"
                    >
                      <tspan
                        x="0"
                        dy="0"
                        fill="#12976B"
                        font-size="14"
                        font-weight="700"
                      >
                        ${l(9, loc, "Independent App Ecosystem")}
                      </tspan>
                    </text>`
                  : null}
              </g>
            `;
          })}
        </g>
      </g>
    </svg>
    <${Tooltip} hoveredItem=${hoveredItem} loc=${loc} />
  </div>`;
}

function Tooltip({ hoveredItem, loc }) {
  if (!hoveredItem) return null;

  return html`<div
    class="tooltip"
    style="left: ${hoveredItem.x}px; top: ${hoveredItem.y}px;"
  >
    <div>
      <p class="tooltip-label">${l(9, loc, "Country")}</p>
      <p class="tooltip-value">${hoveredItem.country}</p>
    </div>
    <div>
      <p class="tooltip-label">${l(9, loc, "Platform")}</p>
      <p class="tooltip-value">${hoveredItem.app}</p>
    </div>
    <div>
      <p class="tooltip-label">${l(9, loc, "Daily active users")}</p>
      <p class="tooltip-value">
        ${d3.format(".2s")(hoveredItem.dau).replace("G", "B")}
      </p>
    </div>
    <div>
      <p class="tooltip-label">${l(9, loc, "Time spent (in hours)")}</p>
      <p class="tooltip-value">
        ${d3.format(".2s")(hoveredItem.hours).replace("G", "B")}
      </p>
    </div>
  </div>`;
}

function SocialMediaIcon({ category, loc }) {
  const iconHeight = 35;
  const iconOffsetX = iconHeight / -2;
  const iconOffsetY = iconHeight / -2;
  switch (category) {
    case "Facebook":
      return html` <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#040078" />
        <g clip-path="url(#clip0_1644_994)">
          <path
            d="M17.5 4C10.0442 4 4 10.0442 4 17.5C4 23.831 8.35888 29.1435 14.2389 30.6026V21.6256H11.4552V17.5H14.2389V15.7223C14.2389 11.1275 16.3185 8.9977 20.8296 8.9977C21.685 8.9977 23.1608 9.16564 23.7645 9.33304V13.0725C23.4459 13.0391 22.8924 13.0223 22.205 13.0223C19.9916 13.0223 19.1362 13.8609 19.1362 16.0409V17.5H23.5458L22.7882 21.6256H19.1362V30.9012C25.8209 30.0939 31.0005 24.4023 31.0005 17.5C31 10.0442 24.9558 4 17.5 4Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_1644_994">
            <rect
              width="27"
              height="27"
              fill="white"
              transform="translate(4 4)"
            />
          </clipPath>
        </defs>
      </g>`;
    case "YouTube":
      return html` <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#040078" />
        <path
          d="M28.7709 12.9C28.7709 12.9 28.5463 11.3143 27.8545 10.618C26.9785 9.7016 25.9992 9.69711 25.55 9.6432C22.3336 9.40961 17.5045 9.40961 17.5045 9.40961H17.4955C17.4955 9.40961 12.6664 9.40961 9.45 9.6432C9.00078 9.69711 8.02148 9.7016 7.14551 10.618C6.45371 11.3143 6.23359 12.9 6.23359 12.9C6.23359 12.9 6 14.7643 6 16.6241V18.367C6 20.2268 6.2291 22.0911 6.2291 22.0911C6.2291 22.0911 6.45371 23.6768 7.14102 24.3731C8.01699 25.2895 9.16699 25.258 9.6791 25.3569C11.5209 25.5321 17.5 25.586 17.5 25.586C17.5 25.586 22.3336 25.577 25.55 25.3479C25.9992 25.294 26.9785 25.2895 27.8545 24.3731C28.5463 23.6768 28.7709 22.0911 28.7709 22.0911C28.7709 22.0911 29 20.2313 29 18.367V16.6241C29 14.7643 28.7709 12.9 28.7709 12.9ZM15.1236 20.4828V14.0186L21.3363 17.262L15.1236 20.4828Z"
          fill="white"
        />
      </g>`;
    case "Instagram":
      return html` <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#040078" />
        <g clip-path="url(#clip0_1644_1003)">
          <path
            d="M17.5 8.0709C20.5727 8.0709 20.9365 8.08437 22.1449 8.13828C23.268 8.1877 23.8744 8.37637 24.2787 8.53359C24.8133 8.74023 25.1996 8.9918 25.5994 9.3916C26.0037 9.7959 26.2508 10.1777 26.4574 10.7123C26.6146 11.1166 26.8033 11.7275 26.8527 12.8461C26.9066 14.059 26.9201 14.4229 26.9201 17.491C26.9201 20.5637 26.9066 20.9275 26.8527 22.1359C26.8033 23.259 26.6146 23.8654 26.4574 24.2697C26.2508 24.8043 25.9992 25.1906 25.5994 25.5904C25.1951 25.9947 24.8133 26.2418 24.2787 26.4484C23.8744 26.6057 23.2635 26.7943 22.1449 26.8438C20.932 26.8977 20.5682 26.9111 17.5 26.9111C14.4273 26.9111 14.0635 26.8977 12.8551 26.8438C11.732 26.7943 11.1256 26.6057 10.7213 26.4484C10.1867 26.2418 9.80039 25.9902 9.40059 25.5904C8.99629 25.1861 8.74922 24.8043 8.54258 24.2697C8.38535 23.8654 8.19668 23.2545 8.14727 22.1359C8.09336 20.923 8.07988 20.5592 8.07988 17.491C8.07988 14.4184 8.09336 14.0545 8.14727 12.8461C8.19668 11.723 8.38535 11.1166 8.54258 10.7123C8.74922 10.1777 9.00078 9.79141 9.40059 9.3916C9.80488 8.9873 10.1867 8.74023 10.7213 8.53359C11.1256 8.37637 11.7365 8.1877 12.8551 8.13828C14.0635 8.08437 14.4273 8.0709 17.5 8.0709ZM17.5 6C14.3779 6 13.9871 6.01348 12.7607 6.06738C11.5389 6.12129 10.6988 6.31895 9.97109 6.60195C9.21191 6.89844 8.56953 7.28926 7.93164 7.93164C7.28926 8.56953 6.89844 9.21191 6.60195 9.9666C6.31895 10.6988 6.12129 11.5344 6.06738 12.7562C6.01348 13.9871 6 14.3779 6 17.5C6 20.6221 6.01348 21.0129 6.06738 22.2393C6.12129 23.4611 6.31895 24.3012 6.60195 25.0289C6.89844 25.7881 7.28926 26.4305 7.93164 27.0684C8.56953 27.7062 9.21191 28.1016 9.9666 28.3936C10.6988 28.6766 11.5344 28.8742 12.7562 28.9281C13.9826 28.982 14.3734 28.9955 17.4955 28.9955C20.6176 28.9955 21.0084 28.982 22.2348 28.9281C23.4566 28.8742 24.2967 28.6766 25.0244 28.3936C25.7791 28.1016 26.4215 27.7062 27.0594 27.0684C27.6973 26.4305 28.0926 25.7881 28.3846 25.0334C28.6676 24.3012 28.8652 23.4656 28.9191 22.2437C28.973 21.0174 28.9865 20.6266 28.9865 17.5045C28.9865 14.3824 28.973 13.9916 28.9191 12.7652C28.8652 11.5434 28.6676 10.7033 28.3846 9.97559C28.1016 9.21191 27.7107 8.56953 27.0684 7.93164C26.4305 7.29375 25.7881 6.89844 25.0334 6.60645C24.3012 6.32344 23.4656 6.12578 22.2437 6.07187C21.0129 6.01348 20.6221 6 17.5 6Z"
            fill="white"
          />
          <path
            d="M17.5 11.5928C14.2387 11.5928 11.5928 14.2387 11.5928 17.5C11.5928 20.7613 14.2387 23.4072 17.5 23.4072C20.7613 23.4072 23.4072 20.7613 23.4072 17.5C23.4072 14.2387 20.7613 11.5928 17.5 11.5928ZM17.5 21.3318C15.3842 21.3318 13.6682 19.6158 13.6682 17.5C13.6682 15.3842 15.3842 13.6682 17.5 13.6682C19.6158 13.6682 21.3318 15.3842 21.3318 17.5C21.3318 19.6158 19.6158 21.3318 17.5 21.3318Z"
            fill="white"
          />
          <path
            d="M25.0199 11.3591C25.0199 12.1228 24.4 12.7382 23.6408 12.7382C22.8771 12.7382 22.2617 12.1183 22.2617 11.3591C22.2617 10.5955 22.8816 9.98004 23.6408 9.98004C24.4 9.98004 25.0199 10.6 25.0199 11.3591Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_1644_1003">
            <rect
              width="23"
              height="23"
              fill="white"
              transform="translate(6 6)"
            />
          </clipPath>
        </defs>
      </g>`;
    case "TikTok":
      return html` <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#040078" />
        <path
          d="M22.361 6H18.4848V21.6666C18.4848 23.5333 16.994 25.0667 15.1388 25.0667C13.2835 25.0667 11.7927 23.5333 11.7927 21.6666C11.7927 19.8334 13.2504 18.3333 15.0394 18.2667V14.3333C11.0969 14.4 7.9165 17.6333 7.9165 21.6666C7.9165 25.7334 11.1632 29 15.1719 29C19.1805 29 22.4272 25.7 22.4272 21.6666V13.6333C23.885 14.7 25.6739 15.3333 27.5623 15.3667V11.4333C24.647 11.3333 22.361 8.93333 22.361 6Z"
          fill="white"
        />
      </g>`;
    case "Threads":
      return html` <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#040078" />
        <path
          d="M22.9548 16.6601C22.8557 16.6126 22.7551 16.5669 22.6532 16.5231C22.4756 13.252 20.6882 11.3792 17.6869 11.3601C17.6733 11.36 17.6598 11.36 17.6462 11.36C15.8511 11.36 14.3581 12.1263 13.4391 13.5206L15.0897 14.6529C15.7762 13.6114 16.8536 13.3893 17.647 13.3893C17.6562 13.3893 17.6654 13.3893 17.6744 13.3894C18.6627 13.3957 19.4084 13.683 19.891 14.2433C20.2422 14.6513 20.4771 15.215 20.5935 15.9264C19.7173 15.7775 18.7697 15.7317 17.7568 15.7898C14.9033 15.9541 13.0689 17.6183 13.1921 19.9308C13.2546 21.1038 13.839 22.1129 14.8375 22.7722C15.6817 23.3294 16.769 23.6019 17.899 23.5403C19.3913 23.4584 20.5621 22.8891 21.3788 21.848C21.9991 21.0573 22.3914 20.0328 22.5646 18.7418C23.2758 19.171 23.8029 19.7358 24.094 20.4148C24.589 21.569 24.6179 23.4656 23.0703 25.0119C21.7143 26.3665 20.0845 26.9525 17.6212 26.9706C14.8889 26.9504 12.8224 26.0741 11.4789 24.3661C10.2208 22.7668 9.57055 20.4567 9.54629 17.5C9.57055 14.5433 10.2208 12.2332 11.4789 10.6339C12.8224 8.9259 14.8888 8.04964 17.6212 8.02933C20.3734 8.04979 22.4759 8.93027 23.8708 10.6465C24.5548 11.4881 25.0706 12.5465 25.4105 13.7805L27.3448 13.2644C26.9327 11.7455 26.2843 10.4366 25.4019 9.35105C23.6135 7.1508 20.998 6.02338 17.628 6H17.6145C14.2513 6.0233 11.665 7.15501 9.9276 9.36367C8.38152 11.3291 7.58401 14.0639 7.55721 17.4919L7.55713 17.5L7.55721 17.5081C7.58401 20.9361 8.38152 23.6709 9.9276 25.6364C11.665 27.845 14.2513 28.9768 17.6145 29H17.628C20.618 28.9793 22.7256 28.1964 24.4619 26.4617C26.7335 24.1923 26.6651 21.3476 25.9164 19.6013C25.3793 18.349 24.3552 17.3318 22.9548 16.6601ZM17.7922 21.5139C16.5416 21.5843 15.2423 21.023 15.1782 19.8206C15.1307 18.9291 15.8127 17.9344 17.8689 17.8159C18.1044 17.8023 18.3355 17.7956 18.5625 17.7956C19.3094 17.7956 20.0082 17.8682 20.6434 18.0071C20.4065 20.9662 19.0166 21.4467 17.7922 21.5139Z"
          fill="white"
        />
      </g>`;
    case "Reddit":
      return html` <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#040078" />
        <path
          d="M19.8394 11.4229C20.0388 12.2684 20.798 12.8982 21.7045 12.8982C22.7629 12.8982 23.6209 12.0402 23.6209 10.9818C23.6209 9.92344 22.7629 9.06543 21.7045 9.06543C20.7791 9.06543 20.0074 9.72129 19.8277 10.5937C18.2779 10.7599 17.0677 12.0743 17.0677 13.6672C17.0677 13.6708 17.0677 13.6735 17.0677 13.6771C15.3822 13.7481 13.8432 14.2279 12.6213 14.9852C12.1676 14.6339 11.598 14.4246 10.9799 14.4246C9.49654 14.4246 8.29443 15.6267 8.29443 17.11C8.29443 18.1864 8.92693 19.1136 9.84064 19.5421C9.92959 22.6597 13.3266 25.1672 17.5052 25.1672C21.6838 25.1672 25.0853 22.657 25.1698 19.5367C26.0763 19.1055 26.7034 18.181 26.7034 17.1109C26.7034 15.6276 25.5013 14.4255 24.018 14.4255C23.4026 14.4255 22.8356 14.633 22.3828 14.9816C21.1502 14.2189 19.5941 13.7391 17.8915 13.6753C17.8915 13.6726 17.8915 13.6708 17.8915 13.6681C17.8915 12.5271 18.7397 11.5802 19.8394 11.4247V11.4229ZM12.5135 18.8144C12.5584 17.8405 13.2053 17.093 13.9573 17.093C14.7093 17.093 15.2843 17.8827 15.2394 18.8566C15.1944 19.8305 14.6329 20.1845 13.88 20.1845C13.1271 20.1845 12.4686 19.7883 12.5135 18.8144ZM21.054 17.093C21.8069 17.093 22.4538 17.8405 22.4978 18.8144C22.5428 19.7883 21.8833 20.1845 21.1313 20.1845C20.3793 20.1845 19.8169 19.8314 19.772 18.8566C19.7271 17.8827 20.3012 17.093 21.054 17.093ZM20.1592 21.0677C20.3003 21.082 20.3901 21.2285 20.3353 21.3596C19.8726 22.4656 18.7801 23.2428 17.5052 23.2428C16.2303 23.2428 15.1387 22.4656 14.6751 21.3596C14.6203 21.2285 14.7102 21.082 14.8512 21.0677C15.6778 20.9841 16.5717 20.9383 17.5052 20.9383C18.4387 20.9383 19.3317 20.9841 20.1592 21.0677Z"
          fill="white"
        />
      </g>`;
    case l(9, loc, "Independent App Ecosystem"):
      return html` <g transform="translate(${iconOffsetX}, ${iconOffsetY})">
        <circle cx="17.5" cy="17.5" r="17.5" fill="#60E2B7" />
      </g>`;
    default:
      return null;
  }
}
