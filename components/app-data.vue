<template>
  <div class="flex flex-col items-center mt-4">
    <input
      type="text"
      class="absolute !top-6 left-4 border-none text-3xl h-10 bg-transparent !w-[calc(100%-1.5rem)]"
      value="App Stores Check"
      ref="titleRef"
    />
    <div class="border-2 rounded-lg text-center w-full mb-2">
      <table class="w-full">
        <tbody ref="tableRef">
          <tr>
            <th class="border-r-2 p-2">Name</th>
            <th class="border-r-2 p-2">Beschreibung</th>
            <th class="border-r-2 p-2">Google Play Store</th>
            <th class="p-2">Apple App Store</th>
          </tr>
          <tr v-for="(app, index) in apps" :key="index">
            <td class="border-t-2 border-r-2 p-2 relative min-w-[10rem]">
              {{ app.title }}
              <Icon
                @click="deleteApp(index)"
                name="material-symbols:delete-outline-rounded"
                class="text-gray-400 absolute bottom-2 left-2 cursor-pointer print:text-transparent"
                size="26"
              />
            </td>
            <td class="border-t-2 border-r-2 p-2 w-full">
              <textarea
                v-model="app.description"
                class="h-48 overflow-y-scroll print:scrollbar-hide"
              />
            </td>
            <td class="border-t-2 border-r-2 p-2 min-w-[10rem]">
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
            <td class="border-t-2 p-2 min-w-[10rem]">
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
    <span class="text-gray-400 mb-1 print:hidden">{{ saveFeedback }}</span>
    <button v-if="authState === 'signedIn'" class="print:hidden" @click="saveData">
      Speichern
    </button>
    <span v-else class="text-gray-400 print:hidden">Melde dich an, um die Daten zu speichern</span>
  </div>
</template>

<script setup>
import VueQrCode from "vue-qrcode";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import he from "he";

const emits = defineEmits(["addAppCallback"]);
emits("addAppCallback", addApp);
const props = defineProps(["firebaseApp"]);

const tableRef = ref(null);
const apps = ref([]);
function addApp(googlePlaySuggestion, appStoreSuggestion) {
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

  apps.value[apps.value.length - 1].description = he.decode(
    apps.value[apps.value.length - 1].description
      .replaceAll("<br>", "\n")
      .replaceAll(/<[^>]+>/g, "")
  );
}

function deleteApp(index) {
  apps.value.splice(index, 1);
}

const auth = getAuth(props.firebaseApp);
const authState = ref("signedOut");
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authState.value = "signedIn";
    const document = (await getDoc(doc(collection(db, "users"), auth.currentUser.uid))).data();
    apps.value = document.apps;
    if (document.title) titleRef.value.value = document.title;
  } else authState.value = "signedOut";
});

const titleRef = ref(null); // Ref to the page title
const saveFeedback = ref("");
const db = getFirestore(props.firebaseApp);
async function saveData() {
  try {
    const document = { apps: apps.value };
    if (titleRef.value.value !== "App Stores Check") document["title"] = titleRef.value.value;

    await setDoc(doc(collection(db, "users"), auth.currentUser.uid), document);

    saveFeedback.value = "Gespeichert";
    setTimeout(() => {
      if (saveFeedback.value === "Gespeichert") saveFeedback.value = "";
    }, 2000);
  } catch (e) {
    saveFeedback.value = e.message;
  }
}
</script>
