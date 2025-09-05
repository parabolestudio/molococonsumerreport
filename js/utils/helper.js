export function getDataURL(filename, locale) {
  const BASE_URL =
    "https://raw.githubusercontent.com/parabolestudio/molococonsumerreport/refs/heads/main/data";
  let localeEnding = "";
  if (locale === "en") {
    localeEnding = "";
  } else if (locale === "zh") {
    localeEnding = "-zh";
  } else if (locale === "ko") {
    localeEnding = "-ko";
  } else if (locale === "ja") {
    localeEnding = "-ja";
  }
  return `${BASE_URL}/${filename}${localeEnding}.csv`;
}
