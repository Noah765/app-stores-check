import googlePlay from "google-play-scraper";

export default defineEventHandler(async (event) => {
  const appName = getQuery(event).app;
  if (!appName) return new Error("App name required");

  const googlePlaySearch = (
    await googlePlay.search({
      term: appName,
      num: 1,
      lang: "de",
      country: "de",
    })
  )[0]; // Google Play Store is structured in a way that always shows apps, no matter what you search for

  const appStoreSearch = JSON.parse(
    await $fetch("https://itunes.apple.com/de/search", {
      query: {
        term: encodeURI(appName.replaceAll(" ", "+")),
        limit: 1,
        media: "software",
        country: "de",
      },
    })
  ).results[0];

  return {
    googlePlayTitle: googlePlaySearch.title,
    googlePlayLink: googlePlaySearch.url,
    googlePlayDescription: googlePlaySearch.summary,
    appStoreTitle: appStoreSearch ? appStoreSearch.trackName : undefined,
    appStoreLink: appStoreSearch ? appStoreSearch.trackViewUrl : undefined,
    appStoreDescription: appStoreSearch ? appStoreSearch.description : undefined,
  };
});
