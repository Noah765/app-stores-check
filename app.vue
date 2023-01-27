<template>
  <div>
    <h1 class="text-3xl">App Stores Check</h1>
    <div class="flex mb-2 mt-8 items-center">
      <input
        type="text"
        class="w-72 border-2 rounded-lg border-gray-200 p-1 px-2 focus:border-gray-300 outline-none"
        placeholder="Suche..."
        ref="inputRef"
        @keyup="onInput"
      />
    </div>
    <table class="mb-4 border-2 inline-block rounded-lg text-center">
      <tbody>
        <tr>
          <th class="border-r-2 p-2 px-4">Google Play Store</th>
          <th class="p-2 px-4">Apple App Store</th>
        </tr>
        <tr v-for="(app, index) in suggestions.googlePlay" :key="index">
          <td
            class="border-t-2 border-r-2 p-2"
            :class="
              selectedSuggestions.googlePlay === undefined
                ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200'
                : selectedSuggestions.googlePlay === index
                ? 'bg-gray-100 cursor-pointer active:bg-gray-200'
                : 'invisible select-none'
            "
            @click="
              selectedSuggestions.googlePlay === undefined ||
              selectedSuggestions.googlePlay === index
                ? clickSuggestion('googlePlay', index)
                : undefined
            "
          >
            {{ app.title }}
          </td>
          <td
            class="border-t-2 p-2"
            :class="
              selectedSuggestions.appStore === undefined
                ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200'
                : selectedSuggestions.appStore === index
                ? 'bg-gray-100 cursor-pointer active:bg-gray-200'
                : 'invisible select-none'
            "
            @click="
              selectedSuggestions.appStore === undefined || selectedSuggestions.appStore === index
                ? clickSuggestion('appStore', index)
                : undefined
            "
          >
            {{ suggestions.appStore[index].title }}
          </td>
        </tr>
        <tr class="text-gray-400" v-if="suggestions.googlePlay">
          <td
            class="border-t-2 border-r-2 p-2"
            :class="
              selectedSuggestions.googlePlay === undefined
                ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200'
                : selectedSuggestions.googlePlay === null
                ? 'bg-gray-100 cursor-pointer active:bg-gray-200'
                : 'invisible select-none'
            "
            @click="
              selectedSuggestions.googlePlay === undefined ||
              selectedSuggestions.googlePlay === null
                ? clickSuggestion('googlePlay', null)
                : undefined
            "
          >
            Nicht vorhanden
          </td>
          <td
            class="border-t-2 p-2"
            :class="
              selectedSuggestions.appStore === undefined
                ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200'
                : selectedSuggestions.appStore === null
                ? 'bg-gray-100 cursor-pointer active:bg-gray-200'
                : 'invisible select-none'
            "
            @click="
              selectedSuggestions.appStore === undefined || selectedSuggestions.appStore === null
                ? clickSuggestion('appStore', null)
                : undefined
            "
          >
            Nicht vorhanden
          </td>
        </tr>
        <tr v-else>
          <td colspan="4" class="border-t-2 p-2 text-gray-400">Versuche eine App zu suchen</td>
        </tr>
      </tbody>
    </table>
    <div class="border-2 rounded-lg text-center">
      <table class="w-full">
        <tbody ref="tableRef">
          <tr>
            <th class="border-r-2 p-2">Name</th>
            <th class="border-r-2 p-2">Beschreibung</th>
            <th class="border-r-2 p-2">Google Play Store</th>
            <th class="p-2">Apple App Store</th>
          </tr>
          <tr v-for="(app, index) in apps" :key="index">
            <td class="border-t-2 border-r-2 p-2 relative">
              {{ app.title }}
              <button @click="deleteApp(index)">
                <Icon
                  name="material-symbols:delete-outline-rounded"
                  class="text-gray-400 absolute bottom-2 left-2"
                  size="26"
                />
              </button>
            </td>
            <td class="border-t-2 border-r-2 p-2">
              <div v-html="app.description" class="h-96 overflow-hidden" />
              <span>...</span>
            </td>
            <td class="border-t-2 border-r-2 p-2 w-44">
              <div v-if="app.googlePlay">
                <a
                  :href="app.googlePlay.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline"
                >
                  {{ app.googlePlay.title }}
                </a>
                <vue-qr-code
                  :value="app.googlePlay.url"
                  :color="{ dark: '#000000' }"
                  type="image/jpeg"
                />
              </div>
              <span v-else class="text-gray-400">App nicht vorhanden</span>
            </td>
            <td class="border-t-2 p-2 w-44">
              <div v-if="app.appStore">
                <a
                  :href="app.appStore.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline"
                >
                  {{ app.appStore.title }}
                </a>
                <vue-qr-code
                  :value="app.appStore.url"
                  :color="{ dark: '#000000' }"
                  type="image/jpeg"
                />
              </div>
              <span v-else class="text-gray-400">App nicht vorhanden</span>
            </td>
          </tr>
          <tr v-if="apps.length === 0">
            <td colspan="4" class="border-t-2 p-2 text-gray-400">Keine Daten vorhanden</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import VueQrCode from "vue-qrcode";

const suggestions = ref({});

let inputCounter = 0;
let previousInput = "";
function onInput(event) {
  const input = event.target.value;
  if (input.length < 3 || input === previousInput) return;
  previousInput = input;

  // Waits for 1 Second; If no more changes to the input occur, fetches the app data

  inputCounter++;

  const currentInputCounter = inputCounter;
  setTimeout(() => {
    if (inputCounter === currentInputCounter) suggest(input);
  }, 1000);
}

async function suggest(term) {
  const { data } = await useFetch("/api/apps", { query: { term } });

  suggestions.value = data.value;
}

const inputRef = ref(null);
const tableRef = ref(null);

const selectedSuggestions = ref({});
const apps = ref([]);
function clickSuggestion(store, suggestion) {
  if (selectedSuggestions.value[store] !== undefined) delete selectedSuggestions.value[store];
  else selectedSuggestions.value[store] = suggestion;

  const googlePlaySuggestionIndex = selectedSuggestions.value.googlePlay;
  const appStoreSuggestionIndex = selectedSuggestions.value.appStore;

  if (googlePlaySuggestionIndex === undefined || appStoreSuggestionIndex === undefined) return;

  const googlePlaySuggestion =
    googlePlaySuggestionIndex === null
      ? null
      : suggestions.value.googlePlay[googlePlaySuggestionIndex];
  const appStoreSuggestion =
    appStoreSuggestionIndex === null ? null : suggestions.value.appStore[appStoreSuggestionIndex];

  if (googlePlaySuggestion || appStoreSuggestion) {
    apps.value.push({
      title:
        googlePlaySuggestion && !appStoreSuggestion
          ? googlePlaySuggestion.title
          : !googlePlaySuggestion && appStoreSuggestion
          ? appStoreSuggestion.title
          : googlePlaySuggestion.title.length <= appStoreSuggestion.title.length
          ? googlePlaySuggestion.title
          : appStoreSuggestion.title,
      description:
        googlePlaySuggestion && !appStoreSuggestion
          ? googlePlaySuggestion.description
          : !googlePlaySuggestion && appStoreSuggestion
          ? appStoreSuggestion.description
          : googlePlaySuggestion.description.length <= appStoreSuggestion.description.length
          ? googlePlaySuggestion.description
          : appStoreSuggestion.description,
      googlePlay: googlePlaySuggestion
        ? { title: googlePlaySuggestion.title, url: googlePlaySuggestion.url }
        : null,
      appStore: appStoreSuggestion
        ? { title: appStoreSuggestion.title, url: appStoreSuggestion.url }
        : null,
    });

    apps.value[apps.value.length - 1].description = apps.value[
      apps.value.length - 1
    ].description.replaceAll("\n", "<br>");

    // To hide the ellipsis if the description is not overflowing
    setTimeout(() => {
      const element = tableRef.value.children[apps.value.length].children[1].children[0];
      if (element.offsetHeight >= element.scrollHeight) {
        element.nextSibling.style.display = "none";
      }
    });
  }

  inputRef.value.value = "";
  selectedSuggestions.value = {};
  suggestions.value = {};
}

function deleteApp(index) {
  apps.value.splice(index, 1);
}
</script>
