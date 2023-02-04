export default defineEventHandler(async (event) => {
  const term = getQuery(event).term;
  if (typeof term != "string" || term.length < 3) return new Error("Query String (minimum 3 characters) is required");

  let googlePlaySuggestionsRaw: string = await $fetch("https://play.google.com/store/search", {
    query: {
      q: term,
      c: "apps",
      hl: "de",
      gl: "de",
    },
  });
  googlePlaySuggestionsRaw = googlePlaySuggestionsRaw.substring(googlePlaySuggestionsRaw.indexOf("hash: '7', data:") + 16);
  googlePlaySuggestionsRaw = googlePlaySuggestionsRaw.substring(0, googlePlaySuggestionsRaw.indexOf(", sideChannel"));

  let googlePlaySuggestions = JSON.parse(googlePlaySuggestionsRaw)[0][1][1];
  googlePlaySuggestions = googlePlaySuggestions[22] ? googlePlaySuggestions[22] : googlePlaySuggestions[21];

  if (googlePlaySuggestions) {
    googlePlaySuggestions = googlePlaySuggestions[0].slice(0, 5).map((e: any) => {
      const withIndent = e[1] === undefined ? e[0] : e;
      return { title: withIndent[3], url: `https://play.google.com/store/apps/details?id=${withIndent[0][0]}`, description: withIndent[13][1] };
    });
  } else {
    googlePlaySuggestions = [];
  }

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
