// viz 2 uses an img tag to load different svgs based on locale, english is the default in Webflow

export function swapSvgForViz2(locale) {
  const imgElement = document.querySelector("#vis2 img");
  if (!imgElement) {
    console.error("Image element for Viz2 not found");
    return;
  }

  const ending = locale === "en" ? "" : `-${locale}`;
  const device = window.innerWidth <= 480 ? "-mobile" : "-desktop";
  const newSrc = `https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/assets/viz2-embeds/viz2${device}${ending}.svg`;

  imgElement.src = newSrc;
}
