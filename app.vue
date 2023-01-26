<template>
  <div>
    <h1 class="text-2xl">App Stores Check</h1>
    <div class="flex my-4 items-center">
      <input
        type="text"
        class="border-2 rounded-lg border-gray-200 p-1 px-2 focus:border-gray-300 outline-none"
        placeholder="Eingabe"
        ref="input"
        @keypress.enter="addApp"
      />
      <button class="ml-1 bg-gray-100 rounded-full p-1 h-min" @click="addApp">
        <Icon name="material-symbols:add-rounded" size="1.5rem" class="text-gray-400" />
      </button>
    </div>
    <table class="w-full">
      <tr>
        <th class="border-2 p-2">Name</th>
        <th class="border-2 p-2">Beschreibung</th>
        <th class="border-2 p-2 whitespace-nowrap">Google Play Store</th>
        <th class="border-2 p-2 whitespace-nowrap">Apple App Store</th>
      </tr>
      <tr v-for="(app, index) in apps" :key="index">
        <td class="border-2 p-2 text-center">
          {{ app.googlePlayTitle ? app.googlePlayTitle : app.appStoreTitle }}
        </td>
        <td
          class="border-2 p-2 text-center"
          v-html="
            app.googlePlayDescription &&
            (!app.appStoreDescription ||
              app.googlePlayDescription.length < app.appStoreDescription.length)
              ? app.googlePlayDescription
              : app.appStoreDescription
          "
        />
        <td class="border-2 p-2 text-center">
          <a :href="app.googlePlayLink" class="underline">{{ app.googlePlayTitle }}</a>
        </td>
        <td class="border-2 p-2 text-center">
          <a :href="app.appStoreLink" class="underline">{{ app.appStoreTitle }}</a>
        </td>
      </tr>
      <tr v-if="apps.length === 0">
        <td colspan="4" class="border-2 p-2 text-center">Keine Daten vorhanden</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
const apps = ref([]);

const input = ref(null);

async function addApp() {
  const inp = input.value.value;
  if (!inp) return;

  const { data } = await useFetch("/api/check-stores", {
    query: { app: inp },
  });

  apps.value.push(data.value);
}
</script>
