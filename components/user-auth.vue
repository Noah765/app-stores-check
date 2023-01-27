<template>
  <div class="border-2 rounded-lg p-2 fixed right-6 top-6 text-center shadow-lg print:hidden">
    <div v-if="authUser === 'signedOut'">
      <input type="email" placeholder="Email-Adresse" ref="emailRef" />
      <div class="flex items-center mt-1">
        <input
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="Passwort"
          ref="passwordRef"
        />
        <Icon
          :name="`material-symbols:${
            passwordVisible ? 'visibility-off-outline-rounded' : 'visibility-outline-rounded'
          }`"
          size="24"
          class="absolute right-5 cursor-pointer text-gray-400"
          @click="passwordVisible = !passwordVisible"
        />
      </div>

      <span class="text-gray-400 text-sm block">{{ feedbackMessage }}</span>

      <button @click="signIn" :class="feedbackMessage ? 'mt-2' : 'mt-4'">Anmelden</button>
      <span class="text-gray-400 text-sm block">Oder</span>
      <button @click="signUp">Registrieren</button>
    </div>
    <div v-else>
      <span class="mb-2 block">Angemeldet als {{ authUser }}</span>
      <span class="text-gray-400 text-sm block">{{ feedbackMessage }}</span>
      <button class="mb-1" @click="signOut">Abmelden</button>
      <button @click="deleteAccount">Account löschen</button>
    </div>
  </div>
</template>

<script setup>
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, collection, doc, deleteDoc } from "firebase/firestore";

const props = defineProps(["firebaseApp"]);
const emailRef = ref(null);
const passwordRef = ref(null);
const passwordVisible = ref(false);

const feedbackMessage = ref("");

const auth = getAuth(props.firebaseApp);

function signUp() {
  const email = emailRef.value.value;
  const password = passwordRef.value.value;

  if (inputValid(email, password)) {
    createUserWithEmailAndPassword(auth, email, password).catch(
      (error) => (feedbackMessage.value = error.message)
    );
  }
}
function signIn() {
  const email = emailRef.value.value;
  const password = passwordRef.value.value;

  if (inputValid(email, password)) {
    signInWithEmailAndPassword(auth, email, password).catch(
      (error) => (feedbackMessage.value = error.message)
    );
  }
}

function inputValid(email, password) {
  if (!RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/).test(email)) {
    feedbackMessage.value = "Ungültige email-adresse";
    return false;
  }
  if (password.length < 6) {
    feedbackMessage.value = "Passwort muss min 6 Zeichen haben";
    return false;
  }
  feedbackMessage.value = "";
  return true;
}

function signOut() {
  firebaseSignOut(auth).catch((e) => (feedbackMessage.value = e.message));
}
const db = getFirestore(props.firebaseApp);
async function deleteAccount() {
  try {
    await deleteDoc(doc(collection(db, "users"), auth.currentUser.uid));
    await deleteUser(auth.currentUser);
  } catch (e) {
    feedbackMessage.value = e.message;
  }
}

const authUser = ref("signedOut");
onAuthStateChanged(auth, (user) => {
  if (user) authUser.value = user.email;
  else authUser.value = "signedOut";
});
</script>
