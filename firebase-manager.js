// Module Firebase pour la synchronisation en temps réel
class FirebaseManager {
    constructor() {
        this.db = null;
        this.isConnected = false;
        this.currentRoom = '';
        this.userId = '';
        this.messageListeners = new Map();
        this.userListeners = new Map();
        this.firebaseReady = false;
    }
    
    // Initialiser Firebase avec la configuration
    async initialize() {
        if (!window.firebase) {
            throw new Error('Firebase SDK non disponible');
        }
        
        try {
            // Initialiser l'app Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            // Initialiser la base de données
            this.db = firebase.database();
            
            // Authentification anonyme
            await firebase.auth().signInAnonymously();
            
            this.isConnected = true;
            this.firebaseReady = true;
            
            console.log('✅ FirebaseManager initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur initialisation Firebase:', error);
            throw error;
        }
    }
    
    // Rejoindre un salon
    async joinRoom(roomId, userId, password = '') {
        if (!this.firebaseReady) {
            throw new Error('Firebase non initialisé');
        }
        
        this.currentRoom = roomId;
        this.userId = userId;
        
        // Ajouter l'utilisateur à la liste des connectés
        const userRef = this.db.ref(`rooms/${roomId}/users/${userId}`);
        await userRef.set({
            userId: userId,
            joinedAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'online'
        });
        
        // Se déconnecter automatiquement à la fermeture
        userRef.onDisconnect().remove();
        
        console.log(`✅ Rejoint le salon: ${roomId}`);
    }
    
    // Envoyer un message
    async sendMessage(message) {
        console.log('🔥 FirebaseManager.sendMessage() appelée avec:', message);
        
        if (!this.firebaseReady) {
            console.error('❌ Firebase non initialisé');
            throw new Error('Firebase non initialisé');
        }
        
        if (!this.db) {
            console.error('❌ Base de données Firebase non disponible');
            throw new Error('Base de données Firebase non disponible');
        }
        
        if (!this.currentRoom) {
            console.error('❌ Aucun salon actuel');
            throw new Error('Aucun salon rejoint');
        }
        
        try {
            console.log('📤 Création de la référence message...');
            const messageRef = this.db.ref(`rooms/${this.currentRoom}/messages`).push();
            console.log('✅ Référence créée:', messageRef.key);
            
            // Utiliser Date.now() au lieu de ServerValue.TIMESTAMP pour éviter les erreurs
            const messageData = {
                ...message,
                timestamp: Date.now(),
                userId: this.userId,
                roomId: this.currentRoom
            };
            
            console.log('💾 Données à sauvegarder:', messageData);
            
            await messageRef.set(messageData);
            
            console.log('✅ Message envoyé avec succès à Firebase');
            return messageRef.key;
            
        } catch (error) {
            console.error('❌ Erreur détaillée lors de l\'envoi:', error);
            console.error('❌ Stack trace:', error.stack);
            throw new Error(`Erreur Firebase: ${error.message}`);
        }
    }
    
    // Écouter les nouveaux messages
    onNewMessage(callback) {
        if (!this.firebaseReady) return;
        
        const messagesRef = this.db.ref(`rooms/${this.currentRoom}/messages`);
        messagesRef.on('child_added', (snapshot) => {
            const message = snapshot.val();
            if (message) {
                callback({
                    id: snapshot.key,
                    ...message
                });
            }
        });
    }
    
    // Récupérer l'historique des messages
    async getMessages() {
        if (!this.firebaseReady || !this.db) return [];
        
        try {
            console.log('🔄 Récupération historique messages...');
            const messagesRef = this.db.ref(`rooms/${this.currentRoom}/messages`);
            
            const snapshot = await messagesRef
                .orderByChild('timestamp')
                .limitToLast(100)
                .once('value');
            
            const messages = [];
            if (snapshot && snapshot.forEach) {
                snapshot.forEach((child) => {
                    const data = child.val();
                    if (data) {
                        messages.push({
                            id: child.key,
                            ...data
                        });
                    }
                });
            }
            
            console.log(`✅ ${messages.length} messages récupérés`);
            return messages;
        } catch (error) {
            console.error('❌ Erreur récupération messages:', error);
            return [];
        }
    }
    
    // Écouter les changements d'utilisateurs
    onUsersChanged(callback) {
        if (!this.firebaseReady) return;
        
        const usersRef = this.db.ref(`rooms/${this.currentRoom}/users`);
        usersRef.on('value', (snapshot) => {
            const users = [];
            snapshot.forEach((child) => {
                users.push(child.val().userId);
            });
            callback(users);
        });
    }
    
    // Quitter le salon
    async leaveRoom() {
        if (!this.firebaseReady) return;
        
        if (this.currentRoom && this.userId) {
            await this.db.ref(`rooms/${this.currentRoom}/users/${this.userId}`).remove();
        }
        
        // Arrêter tous les listeners
        this.db.ref(`rooms/${this.currentRoom}`).off();
        
        this.currentRoom = '';
        this.userId = '';
    }
    
    // Vérifier si Firebase est connecté
    isFirebaseConnected() {
        return this.isConnected && this.firebaseReady;
    }
}