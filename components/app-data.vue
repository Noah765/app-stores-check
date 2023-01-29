<template>
  <div>
    <input type="text" class="absolute !top-6 left-4 border-none text-3xl h-10 bg-transparent !w-[calc(100%-1.5rem)]" value="App Stores Check" ref="titleRef" />
    <div v-if="apps.length !== 0" class="flex flex-col items-center mt-4">
      <div class="border-2 rounded-lg text-center w-full mb-2">
        <table class="w-full">
          <tbody ref="tableRef">
            <tr>
              <th class="border-r-2 p-2">Name</th>
              <th class="border-r-2 p-2">
                Beschreibung
                <span class="text-sm text-gray-400 print:hidden">(Bearbeitbar)</span>
              </th>
              <th class="border-r-2 p-2">Google Play Store</th>
              <th class="p-2">Apple App Store</th>
            </tr>
            <tr v-for="(app, index) in apps" :key="index">
              <td class="border-t-2 border-r-2 p-2 relative min-w-[10rem]">
                {{ app.title }}
                <Icon @click="apps.splice(index, 1)" name="material-symbols:delete-outline-rounded" class="text-red-400 absolute left-2 cursor-pointer print:text-transparent" :class="apps.length === 1 ? 'bottom-2' : 'bottom-10'" size="26" />
                <Icon v-if="apps.length !== 1" @mousedown="startDragging($event, index)" name="material-symbols:open-with-rounded" class="text-gray-400 absolute bottom-2 left-2 cursor-pointer print:text-transparent" size="26" />
              </td>
              <td class="border-t-2 border-r-2 p-2 w-full">
                <textarea v-model="app.description" rows="6" class="bg-transparent print:scrollbar-hide" />
              </td>
              <td class="border-t-2 border-r-2 p-2 min-w-[10rem]">
                <div v-if="app.googlePlay">
                  <a :href="app.googlePlay.url" target="_blank" rel="noopener noreferrer" class="underline print:no-underline">
                    {{ app.googlePlay.title }}
                  </a>
                  <vue-qr-code :value="app.googlePlay.url" :color="{ dark: '#000000' }" type="image/jpeg" />
                </div>
                <span v-else class="text-gray-400">App nicht vorhanden</span>
              </td>
              <td class="border-t-2 p-2 min-w-[10rem]">
                <div v-if="app.appStore">
                  <a :href="app.appStore.url" target="_blank" rel="noopener noreferrer" class="underline print:no-underline">
                    {{ app.appStore.title }}
                  </a>
                  <vue-qr-code :value="app.appStore.url" :color="{ dark: '#000000' }" type="image/jpeg" />
                </div>
                <span v-else class="text-gray-400">App nicht vorhanden</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <span class="text-gray-400 mb-1 print:hidden">{{ saveFeedback }}</span>
      <button v-if="authState === 'signedIn'" class="print:hidden" @click="saveData">Speichern</button>
      <span v-else class="text-gray-400 print:hidden"> Melde dich an, um die Daten zu speichern </span>
      <button v-if="apps.length !== 1" class="text-red-400 mt-2" @click="apps = []">Alle Löschen</button>
    </div>
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
    googlePlay: googlePlaySuggestion ? { title: googlePlaySuggestion.title, url: googlePlaySuggestion.url } : null,
    appStore: appStoreSuggestion ? { title: appStoreSuggestion.title, url: appStoreSuggestion.url } : null,
  });

  apps.value[apps.value.length - 1].description = he.decode(apps.value[apps.value.length - 1].description.replaceAll("<br>", "\n").replaceAll(/<[^>]+>/g, ""));
}

function startDragging(event, index) {
  document.body.style.userSelect = "none";

  let element = event.target.parentElement.parentElement;
  if (event.target.nodeName === "path") element = element.parentElement;

  const cursorElementOffset = element.offsetHeight - 20;

  const parentElement = element.parentElement;

  const siblingElementsPosition = Array.prototype.map.call(parentElement.children, (element) => element.getBoundingClientRect().top - document.body.getBoundingClientRect().top);

  const previewElement = parentElement.insertBefore(document.createElement("tr"), element);
  previewElement.style.borderTopWidth = "2px";
  previewElement.style.height = `${element.offsetHeight}px`;
  let previewElementPosition = index + 1;

  element.style.position = "absolute";
  const tableElement = document.body.insertBefore(document.createElement("table"), document.body.children[0]);
  tableElement.appendChild(element);
  element.style.top = `${event.pageY - cursorElementOffset}px`;

  element.style.width = "calc(100% - 3rem)";
  element.style.borderLeftWidth = "2px";
  element.style.borderRightWidth = "2px";
  element.style.borderBottomWidth = "2px";
  element.style.textAlign = "center";

  let mouseMoveEventListener;
  document.addEventListener(
    "mousemove",
    (mouseMoveEventListener = (event) => {
      const elementPosition = event.pageY - cursorElementOffset;
      element.style.top = `${elementPosition}px`;

      if (elementPosition - siblingElementsPosition[previewElementPosition - 1] < siblingElementsPosition[previewElementPosition] - elementPosition && previewElementPosition !== 1) {
        parentElement.insertBefore(previewElement, parentElement.children[previewElementPosition - 1]);
        previewElementPosition--;
      } else if (siblingElementsPosition[previewElementPosition + 1] - elementPosition < elementPosition - siblingElementsPosition[previewElementPosition]) {
        parentElement.insertBefore(previewElement, parentElement.children[previewElementPosition + 2]);
        previewElementPosition++;
      }
    })
  );

  let mouseUpEventListener;
  document.addEventListener(
    "mouseup",
    (mouseUpEventListener = () => {
      document.removeEventListener("mousemove", mouseMoveEventListener);
      document.removeEventListener("mouseup", mouseUpEventListener);

      parentElement.insertBefore(element, parentElement.children[previewElementPosition - 1 < index ? index + 2 : index + 1]);

      apps.value.splice(previewElementPosition - 1 < index ? previewElementPosition - 1 : previewElementPosition, 0, apps.value[index]);
      apps.value.splice(previewElementPosition - 1 < index ? index + 1 : index, 1);

      document.body.style.userSelect = null;
      previewElement.remove();
      tableElement.remove();
      element.style.position = null;
      element.style.top = null;
      element.style.width = null;
      element.style.borderLeftWidth = null;
      element.style.borderRightWidth = null;
      element.style.borderBottomWidth = null;
      element.style.textAlign = null;
    })
  );
}

const auth = getAuth(props.firebaseApp);
const authState = ref("signedOut");
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authState.value = "signedIn";
    const document = (await getDoc(doc(collection(db, "users"), auth.currentUser.uid))).data();
    if (document && document.apps) apps.value = document.apps;
    if (document && document.title) titleRef.value.value = document.title;
  } else authState.value = "signedOut";
});

const titleRef = ref(null); // Ref to the page title
const saveFeedback = ref("");
const db = getFirestore(props.firebaseApp);
async function saveData() {
  try {
    const document = {};
    if (apps.value.length !== 0) document["apps"] = apps.value;
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
