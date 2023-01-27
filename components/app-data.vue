<template>
  <div class="flex flex-col items-center">
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
            <td class="border-t-2 border-r-2 p-2 relative">
              {{ app.title }}
              <Icon
                @click="deleteApp(index)"
                name="material-symbols:delete-outline-rounded"
                class="text-gray-400 absolute bottom-2 left-2 cursor-pointer"
                size="26"
              />
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
    <span class="text-gray-400 mb-1">{{ saveFeedback }}</span>
    <button v-if="authState === 'signedIn'" @click="saveData">Speichern</button>
    <span v-else class="text-gray-400">Melde dich an, um die Daten zu speichern</span>
  </div>
</template>

<script setup>
import VueQrCode from "vue-qrcode";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";

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

function deleteApp(index) {
  apps.value.splice(index, 1);
}

const auth = getAuth(props.firebaseApp);
const authState = ref("signedOut");
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authState.value = "signedIn";
    apps.value = (await getDoc(doc(collection(db, "users"), auth.currentUser.uid))).data().apps;
  } else authState.value = "signedOut";
});

const saveFeedback = ref("");
const db = getFirestore(props.firebaseApp);
async function saveData() {
  if (apps.value.length === 0) return;

  try {
    await setDoc(doc(collection(db, "users"), auth.currentUser.uid), {
      apps: apps.value,
    });
    saveFeedback.value = "Gespeichert";
    setTimeout(() => {
      if (saveFeedback.value === "Gespeichert") saveFeedback.value = "";
    }, 2000);
  } catch (e) {
    saveFeedback.value = e;
  }
}
</script>
