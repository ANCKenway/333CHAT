// Configuration Firebase pour Mini Chat
// IMPORTANT : Remplacez ces valeurs par vos vraies clés Firebase !

const firebaseConfig = {
    // 🔥 VOTRE VRAIE CONFIGURATION FIREBASE 🔥
    apiKey: "AIzaSyBll5yZUElxboGXR_R6U-ig-g8qNzCadwI",
    authDomain: "chat-b2b67.firebaseapp.com",
    databaseURL: "https://chat-b2b67-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "chat-b2b67",
    storageBucket: "chat-b2b67.firebasestorage.app",
    messagingSenderId: "963920750963",
    appId: "1:963920750963:web:b10bdeb5392ae85fe97d06"
    
    // 📝 Configuration de démonstration (ne fonctionne pas) :
    // apiKey: "DEMO-KEY-REMPLACER",
    // authDomain: "mini-chat-demo.firebaseapp.com",
    // databaseURL: "https://mini-chat-demo-default-rtdb.firebaseio.com/",
    // projectId: "mini-chat-demo",
    // storageBucket: "mini-chat-demo.appspot.com", 
    // messagingSenderId: "123456789",
    // appId: "1:123456789:web:demo123456"
};

// Export pour utilisation dans d'autres fichiers
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
}

// Instructions d'installation :
/*
1. Allez sur https://console.firebase.google.com
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet (ex: "mini-chat-xavier")
4. Activez Google Analytics si vous voulez (optionnel)
5. Une fois le projet créé :
   - Cliquez sur "Web" (icône </>)
   - Nommez votre app (ex: "Mini Chat Extension")
   - Copiez la configuration qui s'affiche
   - Remplacez le contenu de firebaseConfig ci-dessus
6. Dans la console Firebase :
   - Allez dans "Realtime Database"
   - Cliquez "Créer une base de données"
   - Choisissez "Commencer en mode test"
   - Sélectionnez une région proche (ex: europe-west1)
7. Remplacez ce fichier avec votre vraie config et rechargez l'extension !
*/