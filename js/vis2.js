// viz 2 uses an img tag to load different svgs based on locale, english is the default in Webflow

export function swapSvgForViz2(locale) {
  const ending = locale === "en" ? "" : `-${locale}`;

  // desktop version
  const imgElement = document.querySelector("#vis2 img");
  if (!imgElement) {
    console.error("Image element for Viz2 desktop not found");
    return;
  } else {
    imgElement.src = `https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/assets/viz2-embeds/viz2-desktop${ending}.svg`;
  }

  // mobile version
  const imgElement2 = document.querySelector("#vis2-mobile img");
  if (!imgElement2) {
    console.error("Image element for Viz2 mobile not found");
    return;
  } else {
    imgElement2.src = `https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/assets/viz2-embeds/viz2-mobile${ending}.svg`;
  }
}
