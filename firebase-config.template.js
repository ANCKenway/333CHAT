// Configuration Firebase pour 333CHAT
// INSTRUCTIONS: Remplacez les valeurs par vos vraies clés Firebase

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY_ICI",
  authDomain: "votre-projet.firebaseapp.com",
  databaseURL: "https://votre-projet-rtdb.firebaseio.com/",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// ⚠️ IMPORTANT: 
// 1. Créez un projet Firebase sur https://console.firebase.google.com
// 2. Activez Realtime Database en mode test
// 3. Copiez votre configuration dans ce fichier
// 4. Ne partagez jamais vos vraies clés publiquement

export { firebaseConfig };