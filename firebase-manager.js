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
        this.heartbeatInterval = null;
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
    
    // Vérifier les informations d'un salon (mot de passe, etc.)
    async checkRoomInfo(roomId) {
        if (!this.firebaseReady) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            const roomRef = this.db.ref(`rooms/${roomId}/info`);
            const snapshot = await roomRef.once('value');
            const roomInfo = snapshot.val();
            
            if (roomInfo) {
                return {
                    hasPassword: Boolean(roomInfo.password),
                    created: roomInfo.created,
                    creator: roomInfo.creator
                };
            }
            
            return { hasPassword: false };
        } catch (error) {
            console.log('Vérification salon échouée:', error.message);
            return { hasPassword: false };
        }
    }
    
    // Créer un salon avec mot de passe optionnel
    async createRoom(roomId, creatorId, password = '') {
        if (!this.firebaseReady) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            const roomInfoRef = this.db.ref(`rooms/${roomId}/info`);
            const roomData = {
                created: firebase.database.ServerValue.TIMESTAMP,
                creator: creatorId,
                hasPassword: Boolean(password)
            };
            
            // Ajouter le mot de passe seulement s'il y en a un
            if (password) {
                roomData.password = password;
            }
            
            await roomInfoRef.set(roomData);
            console.log(`✅ Salon créé: ${roomId} ${password ? '(avec mot de passe)' : '(public)'}`);
            
        } catch (error) {
            console.log('Création salon échouée:', error.message);
            throw error;
        }
    }
    
    // Rejoindre un salon
    async joinRoom(roomId, userId, password = '') {
        if (!this.firebaseReady) {
            throw new Error('Firebase non initialisé');
        }
        
        // Vérifier si le salon nécessite un mot de passe
        const roomInfo = await this.checkRoomInfo(roomId);
        
        if (roomInfo.hasPassword) {
            // Vérifier le mot de passe
            const roomRef = this.db.ref(`rooms/${roomId}/info`);
            const snapshot = await roomRef.once('value');
            const roomData = snapshot.val();
            
            if (!roomData || roomData.password !== password) {
                throw new Error('Mot de passe incorrect');
            }
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
        
        // Démarrer le heartbeat pour maintenir la présence
        this.startHeartbeat();
        
        console.log(`✅ Rejoint le salon: ${roomId}`);
    }
    
    // Maintenir la présence utilisateur active (heartbeat)
    startHeartbeat() {
        // Arrêter le heartbeat précédent s'il existe
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        // Mettre à jour la présence toutes les 2 minutes
        this.heartbeatInterval = setInterval(async () => {
            if (this.currentRoom && this.userId && this.firebaseReady) {
                try {
                    const userRef = this.db.ref(`rooms/${this.currentRoom}/users/${this.userId}`);
                    await userRef.update({
                        lastSeen: firebase.database.ServerValue.TIMESTAMP,
                        status: 'online'
                    });
                    console.log('💓 Heartbeat - Présence mise à jour');
                } catch (error) {
                    console.log('❌ Erreur heartbeat:', error.message);
                }
            }
        }, 2 * 60 * 1000); // 2 minutes
        
        console.log('💓 Heartbeat démarré');
    }
    
    // Arrêter le heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
            console.log('💔 Heartbeat arrêté');
        }
    }
    
    // Envoyer un message
    async sendMessage(message) {
        console.log('🔥 FirebaseManager.sendMessage() appelée avec:', message);
        
        if (!this.firebaseReady) {
            // Erreur silencieuse pour éviter les remontées Chrome
            throw new Error('Firebase non initialisé');
        }
        
        if (!this.db) {
            // Erreur silencieuse pour éviter les remontées Chrome
            throw new Error('Base de données Firebase non disponible');
        }
        
        if (!this.currentRoom) {
            // Erreur silencieuse pour éviter les remontées Chrome
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
            // Erreur silencieuse pour éviter les remontées Chrome
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
            console.log('Récupération messages échouée:', error.message);
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
        
        // Arrêter le heartbeat
        this.stopHeartbeat();
        
        if (this.currentRoom && this.userId) {
            await this.db.ref(`rooms/${this.currentRoom}/users/${this.userId}`).remove();
        }
        
        // Arrêter tous les listeners
        this.db.ref(`rooms/${this.currentRoom}`).off();
        
        this.currentRoom = '';
        this.userId = '';
    }
    
    // Récupérer les salons disponibles avec statistiques
    async getAvailableRooms() {
        if (!this.firebaseReady || !this.db) return [];
        
        try {
            console.log('🔄 Récupération des salons disponibles...');
            
            // Récupérer tous les salons
            const roomsSnapshot = await this.db.ref('rooms').once('value');
            const rooms = [];
            
            if (roomsSnapshot.exists()) {
                const roomsData = roomsSnapshot.val();
                
                for (const roomId in roomsData) {
                    const roomData = roomsData[roomId];
                    
                    // Compter les utilisateurs actifs (vus dans les 10 dernières minutes)
                    let activeUsers = 0;
                    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
                    
                    if (roomData.users) {
                        for (const userId in roomData.users) {
                            const userData = roomData.users[userId];
                            // Utiliser lastSeen s'il existe, sinon joinedAt
                            const lastActivity = userData.lastSeen || userData.joinedAt || 0;
                            if (lastActivity > tenMinutesAgo) {
                                activeUsers++;
                            }
                        }
                    }
                    
                    // Compter les messages
                    let messageCount = 0;
                    let lastActivity = 0;
                    
                    if (roomData.messages) {
                        messageCount = Object.keys(roomData.messages).length;
                        
                        // Trouver le dernier message
                        const messages = Object.values(roomData.messages);
                        messages.forEach(msg => {
                            const msgTime = msg.timestamp || 0;
                            if (msgTime > lastActivity) {
                                lastActivity = msgTime;
                            }
                        });
                    }
                    
                    // Déterminer si le salon a un mot de passe
                    const hasPassword = (roomData.info && roomData.info.hasPassword) || false;
                    
                    // N'afficher que les salons avec une activité récente ou des utilisateurs connectés
                    if (activeUsers > 0 || lastActivity > tenMinutesAgo) {
                        rooms.push({
                            id: roomId,
                            userCount: activeUsers,
                            messageCount: messageCount,
                            lastActivity: lastActivity,
                            hasPassword: hasPassword
                        });
                    }
                }
            }
            
            // Trier par activité récente
            rooms.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
            
            console.log(`✅ ${rooms.length} salons actifs trouvés`);
            return rooms;
            
        } catch (error) {
            console.log('Récupération salons échouée:', error.message);
            return [];
        }
    }
    
    // Nettoyage automatique des salons inactifs
    async cleanupInactiveRooms() {
        if (!this.firebaseReady || !this.db) return;
        
        try {
            console.log('🧹 Démarrage du nettoyage des salons inactifs...');
            
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;        // 1 heure en ms
            const twentyFourHours = 24 * 60 * 60 * 1000; // 24 heures en ms
            
            // Récupérer tous les salons
            const roomsSnapshot = await this.db.ref('rooms').once('value');
            
            if (!roomsSnapshot.exists()) return;
            
            const roomsData = roomsSnapshot.val();
            let cleanedCount = 0;
            
            for (const roomId in roomsData) {
                const roomData = roomsData[roomId];
                
                // Vérifier s'il y a des utilisateurs connectés récemment (10 minutes)
                let hasActiveUsers = false;
                const tenMinutesAgo = now - (10 * 60 * 1000);
                
                if (roomData.users) {
                    for (const userId in roomData.users) {
                        const userData = roomData.users[userId];
                        // Utiliser lastSeen s'il existe, sinon joinedAt
                        const lastActivity = userData.lastSeen || userData.joinedAt || 0;
                        if (lastActivity > tenMinutesAgo) {
                            hasActiveUsers = true;
                            break;
                        }
                    }
                }
                
                // Ne pas supprimer les salons avec des utilisateurs actifs
                if (hasActiveUsers) continue;
                
                // Calculer l'inactivité
                let lastActivity = 0;
                
                // Vérifier l'activité des messages
                if (roomData.messages) {
                    const messages = Object.values(roomData.messages);
                    messages.forEach(msg => {
                        const msgTime = msg.timestamp || 0;
                        if (msgTime > lastActivity) {
                            lastActivity = msgTime;
                        }
                    });
                }
                
                // Vérifier la création du salon si pas de messages
                if (lastActivity === 0 && roomData.info && roomData.info.created) {
                    lastActivity = roomData.info.created;
                }
                
                // Déterminer la durée limite selon le type de salon
                const isPrivateRoom = roomData.info && roomData.info.hasPassword;
                const maxInactivity = isPrivateRoom ? twentyFourHours : oneHour;
                const inactiveTime = now - lastActivity;
                
                // Supprimer le salon si inactif trop longtemps
                if (inactiveTime > maxInactivity) {
                    console.log(`🗑️ Suppression du salon inactif: ${roomId} (inactif depuis ${Math.round(inactiveTime / (1000 * 60))} minutes)`);
                    
                    await this.db.ref(`rooms/${roomId}`).remove();
                    cleanedCount++;
                }
            }
            
            if (cleanedCount > 0) {
                console.log(`✅ Nettoyage terminé: ${cleanedCount} salon(s) supprimé(s)`);
            } else {
                console.log('✅ Aucun salon à nettoyer');
            }
            
        } catch (error) {
            console.log('Nettoyage échoué:', error.message);
        }
    }
    
    // Vérifier si Firebase est connecté
    isFirebaseConnected() {
        return this.isConnected && this.firebaseReady;
    }
}