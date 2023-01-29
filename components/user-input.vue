<template>
  <div class="print:hidden">
    <input type="text" class="mb-2 mt-6" placeholder="Suche..." ref="inputRef" @keyup="onInput" />
    <span class="text-sm text-gray-400 block w-[30rem]" v-if="suggestions.googlePlay">Klicke auf den App Namen, um die gesuchte App auszuwählen. Sollte sie in einem Store nicht vorhanden sein, klicke auf "Nicht vorhanden"</span>
    <table class="border-2 inline-block rounded-lg text-center">
      <tbody>
        <tr>
          <th class="border-r-2 p-2 px-4">Google Play Store</th>
          <th class="p-2 px-4">Apple App Store</th>
        </tr>
        <tr v-for="(app, index) in suggestions.googlePlay" :key="index">
          <td
            class="border-t-2 border-r-2 p-2"
            :class="selectedSuggestions.googlePlay === undefined ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200' : selectedSuggestions.googlePlay === index ? 'bg-gray-100 cursor-pointer active:bg-gray-200' : 'invisible select-none'"
            @click="selectedSuggestions.googlePlay === undefined || selectedSuggestions.googlePlay === index ? clickSuggestion('googlePlay', index) : undefined"
          >
            {{ app.title }}
          </td>
          <td
            class="border-t-2 p-2"
            :class="selectedSuggestions.appStore === undefined ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200' : selectedSuggestions.appStore === index ? 'bg-gray-100 cursor-pointer active:bg-gray-200' : 'invisible select-none'"
            @click="selectedSuggestions.appStore === undefined || selectedSuggestions.appStore === index ? clickSuggestion('appStore', index) : undefined"
          >
            {{ suggestions.appStore[index].title }}
          </td>
        </tr>
        <tr class="text-gray-400" v-if="suggestions.googlePlay">
          <td
            class="border-t-2 border-r-2 p-2"
            :class="selectedSuggestions.googlePlay === undefined ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200' : selectedSuggestions.googlePlay === null ? 'bg-gray-100 cursor-pointer active:bg-gray-200' : 'invisible select-none'"
            @click="selectedSuggestions.googlePlay === undefined || selectedSuggestions.googlePlay === null ? clickSuggestion('googlePlay', null) : undefined"
          >
            Nicht vorhanden
          </td>
          <td
            class="border-t-2 p-2"
            :class="selectedSuggestions.appStore === undefined ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200' : selectedSuggestions.appStore === null ? 'bg-gray-100 cursor-pointer active:bg-gray-200' : 'invisible select-none'"
            @click="selectedSuggestions.appStore === undefined || selectedSuggestions.appStore === null ? clickSuggestion('appStore', null) : undefined"
          >
            Nicht vorhanden
          </td>
        </tr>
        <tr v-else>
          <td colspan="4" class="border-t-2 p-2 text-gray-400">Suche eine App</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const emits = defineEmits(["addApp"]);
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
    if (inputCounter === currentInputCounter) {
      suggest(input);
      previousInput = "";
    }
  }, 1000);
}

async function suggest(term) {
  const { data } = await useFetch("/api/apps", { query: { term } });

  suggestions.value = data.value;
}

const inputRef = ref(null);

const selectedSuggestions = ref({});
function clickSuggestion(store, suggestion) {
  if (selectedSuggestions.value[store] !== undefined) delete selectedSuggestions.value[store];
  else selectedSuggestions.value[store] = suggestion;

  const googlePlaySuggestionIndex = selectedSuggestions.value.googlePlay;
  const appStoreSuggestionIndex = selectedSuggestions.value.appStore;

  const googlePlaySuggestion = googlePlaySuggestionIndex === null ? null : suggestions.value.googlePlay[googlePlaySuggestionIndex];
  const appStoreSuggestion = appStoreSuggestionIndex === null ? null : suggestions.value.appStore[appStoreSuggestionIndex];

  if (googlePlaySuggestionIndex !== undefined && appStoreSuggestionIndex !== undefined) {
    if (googlePlaySuggestion || appStoreSuggestion) {
      emits("addApp", googlePlaySuggestion, appStoreSuggestion);
    }
    inputRef.value.value = "";
    selectedSuggestions.value = {};
    suggestions.value = {};
  }
}
</script>
