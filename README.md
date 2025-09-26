# 💬 Mini Chat - Extension Chrome

Une extension Chrome simple et élégante pour partager facilement des liens, clés CD, et messages entre vous et votre copine, sans passer par email ou Discord.

## ✨ Fonctionnalités

- **Système de salons** : Discussions multi-utilisateurs organisées par salons
- **Salons privés** : Protection par mot de passe optionnel
- **Utilisateurs connectés** : Voir qui est en ligne dans votre salon
- **Chat instantané** : Messages avec horodatage, expéditeur et historique
- **Détection automatique** : 
  - 🔗 Liens web
  - 🎮 Clés CD et codes de jeu
  - 📧 Adresses email
  - 🎫 Codes promo
  - 📞 Numéros de téléphone
- **Partage rapide** :
  - Partager la page courante d'un clic
  - Partager le contenu du presse-papier
  - Boutons de copie pour tous les contenus détectés
- **Codes de partage** : Générer des codes temporaires pour partager facilement
- **Interface moderne** : Design élégant avec animations fluides
- **Stockage par salon** : Historique séparé pour chaque salon

## 🚀 Installation

### Option 1 : Installation en mode développeur

1. **Télécharger l'extension**
   - Téléchargez tous les fichiers de ce dossier
   - Ou clonez le projet : `git clone [url]`

2. **Ouvrir Chrome**
   - Allez dans `chrome://extensions/`
   - Activez le "Mode développeur" (en haut à droite)

3. **Charger l'extension**
   - Cliquez sur "Charger l'extension non empaquetée"
   - Sélectionnez le dossier contenant les fichiers de l'extension
   - L'extension apparaîtra dans votre barre d'outils

### Option 2 : Utilisation de votre icône existante

✅ **Votre icône `icone.png` est déjà configurée !**

L'extension utilisera automatiquement votre fichier `icone.png` pour toutes les tailles d'icône nécessaires. Aucune action supplémentaire requise.

## 📱 Utilisation

### 🎯 Première utilisation (Système de salons)

1. **Cliquez sur l'icône** de l'extension dans la barre d'outils
2. **L'écran de bienvenue apparaît** automatiquement
3. **Configurez votre accès** :
   - **Votre pseudo** (ex: Xavier)
   - **Nom du salon** (ex: famille, gaming, travail...)
   - **Mot de passe** (optionnel pour salon privé)
4. **Cliquez sur "� Rejoindre le salon"**
5. **C'est parti !** Vous chattez avec tous les membres du salon

### ⚡ Ou mode démo rapide

- Cliquez sur **"⚡ Démo rapide (salon test)"** pour tester immédiatement
- Vous serez dans le salon "demo" avec un pseudo aléatoire

### 🏠 Exemples de salons

- **famille** - Chat familial privé
- **gaming** - Partage de clés de jeux
- **travail** - Liens et documents professionnels
- **amis** - Discussion générale
- Ou créez le vôtre avec n'importe quel nom !

### 💬 Envoyer des messages

- **Tapez votre message** et appuyez sur Entrée
- **Shift + Entrée** pour une nouvelle ligne
- **Utilisez les boutons rapides** :
  - 📄 Partager la page courante
  - 📋 Partager le presse-papier
- **Bouton 🚪** (en haut à droite) pour changer de salon
- **Compteur 👥** : Voir le nombre d'utilisateurs connectés au salon

### Contenus détectés automatiquement

L'extension détecte et formate automatiquement :

- **Liens** : `https://example.com`
- **Clés CD** : `ABCD-1234-EFGH-5678`
- **Emails** : `exemple@email.com`
- **Codes promo** : `PROMO2024`
- **Téléphones** : `06 12 34 56 78`

Chaque contenu détecté aura un bouton "Copier" pour faciliter l'utilisation.

### Codes de partage

1. **Générer un code** : Cliquez sur "Générer code de partage"
2. **Partager le code** : Envoyez le code généré (8 caractères) à votre copine
3. **Utiliser un code** : Entrez un code reçu dans le champ correspondant

## 🔧 Structure du projet

```
333CHROME/
├── manifest.json      # Configuration de l'extension
├── popup.html        # Interface utilisateur
├── popup.css         # Styles et animations
├── popup.js          # Logique principale
├── background.js     # Service worker
├── content.js        # Script d'injection de page
├── utils.js          # Utilitaires de détection
├── icons/            # Icônes de l'extension
│   ├── icon.svg      # Icône source SVG
│   ├── icon16.png    # À créer
│   ├── icon32.png    # À créer
│   ├── icon48.png    # À créer
│   └── icon128.png   # À créer
└── README.md         # Ce fichier
```

## 🛠️ Développement avancé

### Personnalisation

1. **Couleurs** : Modifiez les gradients dans `popup.css`
2. **Patterns** : Ajoutez de nouveaux patterns dans `utils.js`
3. **Messages simulés** : Modifiez `background.js` pour changer les messages de démonstration

### Synchronisation réelle

Pour une vraie synchronisation entre navigateurs :

1. **Firebase** : Utilisez Firebase Realtime Database
2. **Supabase** : Base de données en temps réel
3. **WebRTC** : Communication peer-to-peer
4. **API custom** : Votre propre serveur

Exemple d'intégration Firebase :
```javascript
// Dans background.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

// Configuration Firebase (remplacez par vos clés)
const firebaseConfig = { /* vos clés */ };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
```

## 🎨 Personnalisation visuelle

### Changer les couleurs

Dans `popup.css`, modifiez les gradients :

```css
/* Thème violet (défaut) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Thème bleu */
background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);

/* Thème rose */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Ajouter des animations

L'extension supporte déjà des animations fluides. Vous pouvez en ajouter d'autres dans `popup.css`.

## 🔒 Confidentialité et sécurité

- **Stockage local** : Les messages sont stockés localement sur chaque navigateur
- **Pas de serveur** : Aucune donnée n'est envoyée à des serveurs tiers
- **Simulation** : La synchronisation actuelle est simulée pour démonstration
- **Permissions minimales** : L'extension ne demande que les permissions nécessaires

## 🐛 Dépannage

### L'extension ne s'affiche pas
1. Vérifiez que le mode développeur est activé
2. Actualisez la page des extensions
3. Vérifiez les erreurs dans la console

### Les messages ne se synchronisent pas
1. La synchronisation actuelle est simulée
2. Vérifiez que les deux utilisateurs ont configuré leurs IDs
3. Pour une vraie sync, implémentez Firebase ou une autre solution

### Erreurs de console
1. Ouvrez les outils de développeur (F12)
2. Vérifiez l'onglet Console pour les erreurs
3. Vérifiez l'onglet Extensions pour les erreurs d'extension

## 📞 Support

Pour des questions ou améliorations :

1. **Issues GitHub** : Si le projet est sur GitHub
2. **Documentation** : Consultez les commentaires dans le code
3. **Communauté** : Forums de développement Chrome Extensions

## � Notes importantes

### 💾 **Stockage actuel**
- **Stockage local** : Les messages sont stockés localement dans chaque navigateur Chrome
- **Simulation** : Les "autres utilisateurs" sont simulés pour la démonstration
- **Pas de serveur** : Actuellement aucune synchronisation réelle entre navigateurs
- **Historique conservé** : Vos messages sont sauvegardés par salon dans Chrome

### 🌐 **Pour une vraie synchronisation**
- **Firebase recommandé** : Solution gratuite pour chat en temps réel
- **Voir TECHNICAL-INFO.md** : Guide complet pour implémenter Firebase
- **Alternative** : Supabase, WebRTC ou serveur custom

### ⚠️ **Limitations actuelles**
- Les "autres utilisateurs" sont des simulations
- Pas de vraie synchronisation entre différents navigateurs/ordinateurs
- Pour un vrai usage multi-utilisateurs, une base de données en ligne est nécessaire

## �📋 TODO / Améliorations futures

- [ ] Synchronisation réelle avec Firebase/Supabase
- [ ] Notifications desktop
- [ ] Chiffrement des messages
- [ ] Thèmes personnalisables
- [ ] Support des fichiers (images, documents)
- [ ] Historique de recherche
- [ ] Messages temporaires (qui s'auto-détruisent)
- [ ] Mode sombre
- [ ] Raccourcis clavier
- [ ] Export/Import de l'historique

## 📄 Licence

Projet personnel - Utilisation libre pour usage privé.

---

**Bon chat dans vos salons ! 💬�**