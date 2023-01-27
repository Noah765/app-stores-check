<template>
  <div>
    <h1 class="text-3xl">App Stores Check</h1>
    <user-auth :firebaseApp="app" />
    <user-input @addApp="addApp" />
    <app-data :firebaseApp="app" @addAppCallback="(callback) => (addApp = callback)" />
  </div>
</template>

<script setup>
const addApp = ref();

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBxu4umf4N787fIUYlpQbW_JfT3_VNeiCs",
  authDomain: "app-stores-check.firebaseapp.com",
  projectId: "app-stores-check",
  storageBucket: "app-stores-check.appspot.com",
  messagingSenderId: "977838940663",
  appId: "1:977838940663:web:63f73b2136d1d15f1d0ef2",
};
const app = initializeApp(firebaseConfig);
</script>
