# 🚀 333CHAT - Extension Chrome

Extension Chrome moderne pour chat en temps réel avec système de salons, heartbeat intelligent et interface épurée.

![333CHAT](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=googlechrome)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?style=for-the-badge&logo=firebase)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)

## ✨ Fonctionnalités principales

### 🎯 Interface moderne
- **Navigation 3 pages** : Accueil → Création/Connexion → Chat
- **Design épuré** : Interface intuitive et réactive
- **Notifications élégantes** : Messages d'état visuels (plus d'alerts Chrome)
- **Bouton déconnexion** : Action claire et explicite

### 💡 Système intelligent
- **Heartbeat automatique** : Présence utilisateur mise à jour toutes les 2 minutes
- **Détection d'activité** : Utilisateurs actifs pendant 10 minutes
- **Reconnexion auto** : Reprise de session après fermeture
- **Nettoyage intelligent** : Suppression des salons inactifs (1h public, 24h privé)

### 🔐 Gestion des salons
- **Salons privés** : Checkbox intuitive révélant le champ mot de passe
- **Icônes cadenas** : Indication visuelle des salons privés (🔒)
- **Liste des serveurs** : Clic direct pour rejoindre
- **Création simplifiée** : Nom + option privée = c'est parti !

### 🔥 Firebase temps réel
- **Synchronisation instantanée** : Messages partagés en temps réel
- **Persistance** : Historique sauvegardé par salon
- **Multi-utilisateurs** : Chat collaboratif véritable
- **Robuste** : Gestion d'erreurs silencieuse (console.log)

## 🚀 Installation rapide

### 1. Cloner le projet
```bash
git clone https://github.com/ANCKenway/333CHAT.git
cd 333CHAT
```

### 2. Configuration Firebase
1. **Créer un projet** sur [Firebase Console](https://console.firebase.google.com)
2. **Activer Realtime Database** en mode test
3. **Copier le template** : `cp firebase-config.template.js firebase-config.js`
4. **Éditer `firebase-config.js`** avec vos vraies clés Firebase :

**⚠️ Note** : Le fichier `firebase-config.js` est ignoré par git pour protéger vos clés.

```javascript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  databaseURL: "https://votre-projet-rtdb.firebaseio.com/",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

### 3. Charger dans Chrome
1. **Ouvrir** `chrome://extensions/`
2. **Activer** le mode développeur
3. **Charger** l'extension non empaquetée (dossier `333CHROME`)
4. **Prêt !** L'icône 333CHAT apparaît dans la barre

## 📱 Guide d'utilisation

### 🏠 Page d'accueil
1. **Saisir votre pseudo** dans le champ principal
2. **Choisir une action** :
   - 🚪 **Rejoindre un salon** : Accès à un salon existant
   - ➕ **Créer un salon** : Nouveau salon
3. **Consulter la liste** des serveurs actifs

### ➕ Créer un salon
1. **Nom du salon** : Choisissez un nom unique
2. **Salon privé** : Cochez pour activer le mot de passe
3. **Mot de passe** : Apparaît si "privé" est coché
4. **Créer** : Vous êtes connecté automatiquement !

### 🚪 Rejoindre un salon
- **Depuis la liste** : Clic direct sur un salon
- **Par recherche** : Tapez le nom exact
- **Salon privé** : Saisissez le mot de passe (🔒 visible)

### 💬 Chat en action
- **Messages temps réel** : Synchronisation Firebase instantanée
- **Présence active** : Heartbeat maintient votre connexion
- **Liste utilisateurs** : Qui est connecté en temps réel
- **Historique persistant** : Messages sauvegardés par salon

## 🛠️ Architecture technique

### Structure projet
```
333CHROME/
├── manifest.json          # Configuration extension Chrome
├── popup.html            # Interface utilisateur (3 pages)
├── popup.css             # Styles modernes + animations
├── popup.js              # Logique principale (774 lignes)
├── firebase-manager.js   # Gestion Firebase + heartbeat
├── firebase-config.js    # Configuration Firebase (à créer)
├── utils.js              # Utilitaires et helpers
├── icons/
│   └── icone.png        # Icône extension (toutes tailles)
└── README.md            # Ce fichier
```

### Technologies utilisées
- **Chrome Extension Manifest V3** : Standard moderne
- **Firebase Realtime Database** : Synchronisation temps réel
- **Vanilla JavaScript ES6+** : Performance optimale
- **CSS3 Grid/Flexbox** : Layout responsif
- **Local Storage** : Cache et préférences

### Fonctionnalités avancées
- **Heartbeat système** : `startHeartbeat()` / `stopHeartbeat()`
- **Nettoyage auto** : `cleanupInactiveRooms()`
- **Gestion erreurs** : Console.log silencieux
- **Notifications** : `showNotification()` système
- **TempUserId** : Sessions temporaires automatiques

## 🎨 Personnalisation

### Modifier les couleurs
Dans `popup.css` :
```css
/* Thème principal */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Thème alternatif bleu */
.gradient-bg {
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
}
```

### Ajuster le heartbeat
Dans `firebase-manager.js` :
```javascript
// Intervalle heartbeat (défaut: 2 minutes)
const HEARTBEAT_INTERVAL = 2 * 60 * 1000;

// Fenêtre d'activité (défaut: 10 minutes)
const tenMinutesAgo = now - (10 * 60 * 1000);
```

## 🔧 Développement

### Débogage
1. **Console Chrome** : F12 → Console pour les logs
2. **Extension devtools** : Outils de développement dédiés
3. **Firebase console** : Monitoring temps réel des données

### Contribution
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. **Push** la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Pull Request** vers main

## 🚦 État du projet

### ✅ Fonctionnalités complètes
- [x] Interface 3 pages finalisée
- [x] Système heartbeat opérationnel
- [x] Salons privés avec mot de passe
- [x] Reconnexion automatique
- [x] Notifications visuelles
- [x] Nettoyage automatique des salons
- [x] Firebase temps réel intégré
- [x] Gestion d'erreurs robuste

### 🎯 Version actuelle : **1.0.0**
- Extension complètement fonctionnelle
- Code nettoyé et optimisé
- Prête pour utilisation quotidienne
- Interface finale validée

## 📞 Support

- **Issues GitHub** : [Signaler un problème](https://github.com/ANCKenway/333CHAT/issues)
- **Discussions** : [Questions et suggestions](https://github.com/ANCKenway/333CHAT/discussions)
- **Wiki** : Documentation complète (à venir)

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour les détails.

---

**🎉 Prêt à chatter ? Lancez 333CHAT et créez votre premier salon !**

*Extension développée avec ❤️ pour une communication fluide et moderne.*