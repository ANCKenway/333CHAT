// Logique principale du popup avec écran de configuration
document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM - Configuration
    const setupContainer = document.getElementById('setupContainer');
    const chatContainer = document.getElementById('chatContainer');
    const setupUserId = document.getElementById('setupUserId');
    const setupRoomId = document.getElementById('setupRoomId');
    const setupRoomPassword = document.getElementById('setupRoomPassword');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const quickDemoBtn = document.getElementById('quickDemoBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    // Éléments DOM - En-tête de salon
    const roomTitle = document.getElementById('roomTitle');
    const roomSubtitle = document.getElementById('roomSubtitle');
    const onlineCount = document.getElementById('onlineCount');
    
    // Éléments DOM - Chat
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    // Variables globales
    let currentMessages = [];
    let userId = '';
    let currentRoom = '';
    let roomPassword = '';
    let connectedUsers = new Set();
    let contentDetector = new ContentDetector();
    let isConfigured = false;
    let firebaseManager = null;
    
    // Initialisation
    init();
    
    async function init() {
        // Mode Firebase UNIQUEMENT
        if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('VOTRE_')) {
            showFirebaseError('Configuration Firebase manquante');
            return;
        }
        
        try {
            console.log('🔥 Initialisation Firebase UNIQUEMENT...');
            showLoadingMessage('Connexion à Firebase...');
            
            const firebaseLoaded = await FirebaseLoader.loadFirebase();
            if (!firebaseLoaded || !window.firebase) {
                throw new Error('Impossible de charger Firebase SDK');
            }
            
            firebaseManager = new FirebaseManager();
            await firebaseManager.initialize();
            
            console.log('✅ Firebase connecté avec succès !');
            hideLoadingMessage();
            
            checkConfiguration();
            setupEventListeners();
            
        } catch (error) {
            console.error('❌ Erreur critique Firebase:', error);
            showFirebaseError(`Erreur de connexion: ${error.message}`);
        }
    }
    
    // Vérifier si l'extension est déjà configurée
    async function checkConfiguration() {
        chrome.storage.local.get(['userId', 'currentRoom', 'roomPassword'], async (result) => {
            if (result.userId && result.currentRoom) {
                // Déjà configuré
                userId = result.userId;
                currentRoom = result.currentRoom;
                roomPassword = result.roomPassword || '';
                isConfigured = true;
                showChatInterface();
                updateRoomInfo();
                
                // Firebase UNIQUEMENT
                await initializeFirebaseChat();
            } else {
                // Première utilisation
                showSetupInterface();
            }
        });
    }
    
    // Afficher l'interface de configuration
    function showSetupInterface() {
        setupContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    }
    
    // Afficher l'interface de chat
    function showChatInterface() {
        setupContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
    
    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Écouteurs pour la configuration
        if (joinRoomBtn) joinRoomBtn.addEventListener('click', joinRoom);
        if (quickDemoBtn) quickDemoBtn.addEventListener('click', quickDemo);
        
        // Validation en temps réel
        if (setupUserId) setupUserId.addEventListener('input', validateSetupForm);
        if (setupRoomId) setupRoomId.addEventListener('input', validateSetupForm);
        
        // Clic sur les exemples de salons
        const roomTags = document.querySelectorAll('.room-tag');
        roomTags.forEach(tag => {
            tag.addEventListener('click', () => {
                if (setupRoomId) {
                    setupRoomId.value = tag.textContent;
                    validateSetupForm();
                }
            });
        });
        
        // Écouteurs pour le chat
        if (sendButton) {
            console.log('✅ Bouton envoi trouvé, ajout de l\'événement');
            sendButton.addEventListener('click', (e) => {
                console.log('🖱️ Clic sur bouton envoi détecté');
                sendMessage();
            });
        } else {
            console.error('❌ Bouton envoi non trouvé');
        }
        
        if (messageInput) {
            console.log('✅ Champ message trouvé, ajout de l\'événement Enter');
            messageInput.addEventListener('keypress', (e) => {
                console.log('⌨️ Touche pressée:', e.key);
                if (e.key === 'Enter' && !e.shiftKey) {
                    console.log('📨 Enter détecté, envoi du message');
                    e.preventDefault();
                    sendMessage();
                }
            });
        } else {
            console.error('❌ Champ message non trouvé');
        }
        
        // Bouton paramètres
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                chrome.storage.local.clear();
                showSetupInterface();
            });
        }
        
        // Boutons de partage rapide
        const shareCurrentTabBtn = document.getElementById('shareCurrentTab');
        const shareClipboardBtn = document.getElementById('shareClipboard');
        const generateShareCodeBtn = document.getElementById('generateShareCode');
        
        if (shareCurrentTabBtn) {
            shareCurrentTabBtn.addEventListener('click', shareCurrentTab);
        }
        
        if (shareClipboardBtn) {
            shareClipboardBtn.addEventListener('click', shareClipboard);
        }
        
        if (generateShareCodeBtn) {
            generateShareCodeBtn.addEventListener('click', generateShareCode);
        }
    }
    
    // Validation du formulaire de configuration
    function validateSetupForm() {
        const userValid = setupUserId && setupUserId.value.trim().length >= 2;
        const roomValid = setupRoomId && setupRoomId.value.trim().length >= 2;
        
        if (joinRoomBtn) {
            joinRoomBtn.disabled = !(userValid && roomValid);
        }
    }
    
    // Rejoindre un salon
    async function joinRoom() {
        const userIdValue = setupUserId.value.trim();
        const roomIdValue = setupRoomId.value.trim();
        const passwordValue = setupRoomPassword.value.trim();
        
        if (!userIdValue || !roomIdValue) {
            showTemporaryMessage('⚠️ Nom d\'utilisateur et salon requis', 'warning');
            return;
        }
        
        // Sauvegarder les paramètres
        userId = userIdValue;
        currentRoom = roomIdValue;
        roomPassword = passwordValue;
        
        chrome.storage.local.set({ 
            userId: userId, 
            currentRoom: currentRoom,
            roomPassword: roomPassword
        }, async () => {
            isConfigured = true;
            showChatInterface();
            updateRoomInfo();
            
            // Firebase UNIQUEMENT
            await initializeFirebaseChat();
        });
    }
    
    // Mode démo rapide
    async function quickDemo() {
        userId = 'Utilisateur' + Math.floor(Math.random() * 1000);
        currentRoom = 'demo';
        roomPassword = '';
        
        chrome.storage.local.set({ 
            userId: userId, 
            currentRoom: currentRoom,
            roomPassword: roomPassword
        }, async () => {
            isConfigured = true;
            showChatInterface();
            updateRoomInfo();
            
            // Firebase UNIQUEMENT
            await initializeFirebaseChat();
        });
    }
    
    // Mettre à jour les informations du salon
    function updateRoomInfo() {
        if (roomTitle) {
            roomTitle.textContent = `💬 Salon: ${currentRoom}`;
        }
        if (roomSubtitle) {
            const lockIcon = roomPassword ? '🔒' : '🌐';
            const roomType = roomPassword ? 'privé' : 'public';
            roomSubtitle.textContent = `${lockIcon} ${roomType} • ${userId}`;
        }
    }
    
    // Mettre à jour le compteur d'utilisateurs en ligne
    function updateOnlineCount() {
        if (onlineCount) {
            const countNumber = onlineCount.querySelector('.count-number');
            if (countNumber) {
                countNumber.textContent = connectedUsers.size;
            }
            
            // Tooltip avec la liste des utilisateurs
            const userList = Array.from(connectedUsers).join(', ');
            onlineCount.title = `Connectés: ${userList}`;
        }
    }
    
    // Initialiser le chat Firebase UNIQUEMENT
    async function initializeFirebaseChat() {
        try {
            console.log('🔄 Connexion au salon Firebase...');
            showTemporaryMessage('Connexion au salon...', 'info');
            
            // Rejoindre le salon Firebase
            await firebaseManager.joinRoom(currentRoom, userId, roomPassword);
            console.log(`✅ Salon "${currentRoom}" rejoint avec succès`);
            
            // Écouter les nouveaux messages en temps réel
            firebaseManager.onNewMessage((message) => {
                console.log('📨 Nouveau message reçu:', message);
                
                const messageWithId = {
                    id: message.id || Date.now().toString(),
                    ...message
                };
                
                // Ajouter le message s'il n'existe pas déjà
                const existingMessage = currentMessages.find(m => m.id === messageWithId.id);
                if (!existingMessage) {
                    currentMessages.push(messageWithId);
                    displayMessages();
                    
                    // Notification pour messages des autres utilisateurs
                    if (messageWithId.userId !== userId) {
                        showTemporaryMessage(`💬 ${messageWithId.userId}: ${messageWithId.content.substring(0, 25)}...`, 'info');
                    }
                }
            });
            
            // Écouter les utilisateurs connectés
            firebaseManager.onUsersChanged((users) => {
                console.log('👥 Utilisateurs connectés:', users);
                connectedUsers = new Set(users);
                updateOnlineCount();
            });
            
            // Charger l'historique des messages
            console.log('📚 Chargement de l\'historique...');
            const messages = await firebaseManager.getMessages();
            currentMessages = messages || [];
            displayMessages();
            console.log(`✅ ${currentMessages.length} messages historiques chargés`);
            
            updateStatus(true, 'Firebase');
            showTemporaryMessage('🔥 Salon connecté en temps réel !', 'success');
            
        } catch (error) {
            console.error('❌ Erreur critique Firebase:', error);
            showFirebaseError(`Impossible de se connecter au salon: ${error.message}`);
        }
    }
    
    // Envoyer un message
    async function sendMessage() {
        console.log('🚀 sendMessage() appelée');
        
        if (!messageInput) {
            console.error('❌ messageInput non trouvé');
            return;
        }
        
        const content = messageInput.value.trim();
        console.log('📝 Contenu du message:', content);
        console.log('👤 UserId:', userId);
        
        if (!content) {
            console.warn('⚠️ Message vide');
            showTemporaryMessage('⚠️ Tapez un message', 'warning');
            return;
        }
        
        if (!userId) {
            console.error('❌ UserId manquant');
            showTemporaryMessage('⚠️ Configuration requise', 'warning');
            return;
        }
        
        const message = {
            id: Date.now().toString(),
            type: detectMessageType(content),
            content: content,
            timestamp: new Date().toISOString(),
            userId: userId
        };
        
        // Vérifications avant envoi
        if (!firebaseManager) {
            console.error('❌ FirebaseManager non initialisé');
            showTemporaryMessage('❌ Connexion Firebase requise', 'error');
            return;
        }
        
        if (!firebaseManager.isFirebaseConnected()) {
            console.error('❌ Firebase non connecté');
            showTemporaryMessage('❌ Connexion Firebase perdue', 'error');
            return;
        }
        
        try {
            console.log('📤 Envoi du message via Firebase:', message);
            
            // Envoyer UNIQUEMENT via Firebase
            const messageId = await firebaseManager.sendMessage(message);
            console.log('✅ Message envoyé avec succès, ID:', messageId);
            
        } catch (error) {
            console.error('❌ Erreur envoi message:', error);
            console.error('❌ Type d\'erreur:', error.constructor.name);
            console.error('❌ Message d\'erreur:', error.message);
            showTemporaryMessage(`❌ Erreur: ${error.message}`, 'error');
            return; // Ne pas vider le champ si erreur
        }
        
        // Vider le champ de saisie
        messageInput.value = '';
        messageInput.focus();
        
        // Réinitialiser le badge
        chrome.action?.setBadgeText({ text: '' });
    }
    
    // Détecter le type de message
    function detectMessageType(content) {
        if (contentDetector) {
            return contentDetector.detectType(content);
        }
        return 'text';
    }
    
    // Partager la page actuelle
    async function shareCurrentTab() {
        try {
            // Récupérer les informations de l'onglet actuel
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url) {
                // Créer un message de partage formaté proprement
                const shareMessage = {
                    id: Date.now().toString(),
                    type: 'page_share',
                    content: currentTab.url,
                    title: currentTab.title,
                    timestamp: new Date().toISOString(),
                    userId: userId
                };
                
                // Envoyer directement via Firebase (sans passer par le champ input)
                try {
                    const messageId = await firebaseManager.sendMessage(shareMessage);
                    console.log('✅ Page partagée avec succès, ID:', messageId);
                    showTemporaryMessage('📄 Page partagée !', 'success');
                } catch (error) {
                    console.error('❌ Erreur envoi page:', error);
                    showTemporaryMessage(`❌ Erreur: ${error.message}`, 'error');
                }
            } else {
                showTemporaryMessage('❌ Impossible d\'accéder à la page', 'error');
            }
        } catch (error) {
            console.error('Erreur partage page:', error);
            showTemporaryMessage('❌ Erreur lors du partage', 'error');
        }
    }
    
    // Partager le contenu du presse-papier
    async function shareClipboard() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            
            if (clipboardText && clipboardText.trim()) {
                // Détecter le type de contenu
                const detectedType = contentDetector ? contentDetector.detectType(clipboardText) : 'text';
                
                const shareMessage = {
                    id: Date.now().toString(),
                    type: 'clipboard_share',
                    content: clipboardText,
                    detectedType: detectedType,
                    timestamp: new Date().toISOString(),
                    userId: userId
                };
                
                // Envoyer directement via Firebase
                try {
                    const messageId = await firebaseManager.sendMessage(shareMessage);
                    console.log('✅ Presse-papier partagé avec succès, ID:', messageId);
                    showTemporaryMessage('📋 Presse-papier partagé !', 'success');
                } catch (error) {
                    console.error('❌ Erreur envoi presse-papier:', error);
                    showTemporaryMessage(`❌ Erreur: ${error.message}`, 'error');
                }
            } else {
                showTemporaryMessage('⚠️ Presse-papier vide', 'warning');
            }
        } catch (error) {
            console.error('Erreur partage presse-papier:', error);
            showTemporaryMessage('❌ Accès au presse-papier refusé', 'error');
        }
    }
    
    // Générer un code de partage
    async function generateShareCode() {
        try {
            // Récupérer le dernier message ou créer un code pour le salon
            const shareData = {
                room: currentRoom,
                userId: userId,
                timestamp: Date.now(),
                type: 'room_invite'
            };
            
            // Générer un code de partage unique
            const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Sauvegarder temporairement
            chrome.storage.local.set({
                [`shareCode_${shareCode}`]: shareData
            });
            
            // Copier dans le presse-papier
            await navigator.clipboard.writeText(shareCode);
            
            showTemporaryMessage(`🔗 Code généré et copié: ${shareCode}`, 'success');
            
        } catch (error) {
            console.error('Erreur génération code:', error);
            showTemporaryMessage('❌ Erreur génération code', 'error');
        }
    }
    
    // Afficher les messages
    function displayMessages() {
        if (!chatMessages) {
            console.error('❌ Element chatMessages non trouvé');
            return;
        }
        
        console.log(`📝 Affichage de ${currentMessages.length} messages`);
        
        // Supprimer le message de bienvenue s'il y a des vrais messages
        if (currentMessages.length > 0) {
            const welcomeMsg = chatMessages.querySelector('.welcome-message');
            if (welcomeMsg) welcomeMsg.remove();
        }
        
        // Vider et recréer tous les messages
        const existingMessages = chatMessages.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        currentMessages.forEach((message, index) => {
            console.log(`📨 Message ${index}:`, message);
            const messageElement = createMessageElement(message);
            if (messageElement) {
                chatMessages.appendChild(messageElement);
            } else {
                console.error('❌ Erreur création message element');
            }
        });
        
        // Faire défiler vers le bas
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Créer un élément de message
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.dataset.messageId = message.id;
        
        // Déterminer qui a envoyé le message
        const isMyMessage = message.userId === userId;
        const senderClass = isMyMessage ? 'sender-me' : 'sender-other';
        
        // Badge expéditeur - toujours afficher le userId réel
        const senderBadge = isMyMessage ? 'vous' : (message.userId || 'inconnu');
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender-badge ${senderClass}">${senderBadge}</span>
                <span class="message-time">${formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${formatMessageContent(message.content, message.type, message)}</div>
        `;
        
        return messageDiv;
    }
    
    // Formater le contenu du message
    function formatMessageContent(content, type, message = null) {
        if (!contentDetector) return content;
        return contentDetector.formatContent(content, type, message);
    }
    
    // Formater l'heure
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    // Mettre à jour le statut de connexion
    function updateStatus(isConnected, mode) {
        if (statusDot && statusText) {
            if (isConnected) {
                statusDot.className = 'status-dot online';
                statusText.textContent = `En ligne (${mode})`;
            } else {
                statusDot.className = 'status-dot offline';
                statusText.textContent = `Hors ligne (${mode})`;
            }
        }
    }
    
    // Afficher un message temporaire
    function showTemporaryMessage(message, type = 'info') {
        // Créer ou trouver la zone de notification
        let notification = document.querySelector('.temp-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'temp-notification';
            document.body.appendChild(notification);
        }
        
        // Styles selon le type
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Masquer après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    // Afficher une erreur Firebase critique
    function showFirebaseError(message) {
        setupContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #721c24;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3 style="color: #721c24; margin: 0 0 15px 0;">Erreur Firebase</h3>
                    <p style="margin: 0 0 20px 0; line-height: 1.5;">${message}</p>
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <strong>Solutions possibles :</strong><br>
                        • Vérifiez votre connexion internet<br>
                        • Vérifiez votre configuration Firebase<br>
                        • Ouvrez test-firebase.html pour diagnostiquer<br>
                        • Rechargez l'extension
                    </div>
                    <button id="retryFirebaseBtn" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        🔄 Réessayer
                    </button>
                </div>
            `;
            
            // Ajouter l'événement pour le bouton de retry
            setTimeout(() => {
                const retryBtn = document.getElementById('retryFirebaseBtn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        location.reload();
                    });
                }
            }, 100);
        }
    }
    
    // Afficher un message de chargement
    function showLoadingMessage(message) {
        setupContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 32px; margin-bottom: 20px;">⏳</div>
                    <p style="margin: 0; color: #666;">${message}</p>
                </div>
            `;
        }
    }
    
    // Masquer le message de chargement
    function hideLoadingMessage() {
        if (chatMessages) {
            const loadingMsg = chatMessages.querySelector('div');
            if (loadingMsg) {
                chatMessages.innerHTML = '<div class="welcome-message">Salon prêt ! 🎉</div>';
            }
        }
    }

});

// Fonction globale pour copier dans le presse-papier
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Feedback visuel temporaire
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copié !';
        button.style.background = '#51cf66';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#2196f3';
        }, 1000);
    }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        alert('Erreur lors de la copie dans le presse-papier');
    });
};