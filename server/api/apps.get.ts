import googlePlay from "google-play-scraper";

export default defineEventHandler(async (event) => {
  const term = getQuery(event).term;
  if (typeof term != "string" || term.length < 3)
    return new Error("Query String (minimum 3 characters) is required");

  const googlePlaySuggestions = (
    await googlePlay.search({
      term: term,
      num: 5,
      lang: "de",
      country: "de",
    })
  ).map((e) => {
    return { title: e.title, url: e.url, description: e.summary };
  });

  const appStoreSuggestions: { title: string; url: string; description: string }[] = JSON.parse(
    await $fetch("https://itunes.apple.com/de/search", {
      query: {
        term: encodeURI(term.replaceAll(" ", "+")),
        limit: 5,
        media: "software",
        country: "de",
      },
    })
  ).results.map((e: { trackName: string; trackViewUrl: string; description: string }) => {
    return { title: e.trackName, url: e.trackViewUrl, description: e.description };
  });

  return {
    googlePlay: googlePlaySuggestions,
    appStore: appStoreSuggestions,
  };
});
