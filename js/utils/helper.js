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

export const getLocale = () => {
  const locales = ["zh", "ko", "ja", "en"];
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("moloco-dev")
  ) {
    console.log("Running in local testing mode");
    // local testing with ?testLocale=zh or ko or ja or en
    const param = new URLSearchParams(window.location.search).get("testLocale");
    if (locales.includes(param)) return param;
  } else {
    // production - determine locale from path
    console.log("Running in production mode");
    const urlPath = window.location.pathname;
    for (const locale of locales) {
      if (urlPath.includes(`/${locale}/`)) return locale;
    }
  }
  // default to English if no locale found in path
  return "en";
};
