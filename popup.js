// Interface simplifiée Mini Chat
document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM - Interface de connexion
    const mainPage = document.getElementById('mainPage');
    const joinRoomPage = document.getElementById('joinRoomPage');
    const createRoomPage = document.getElementById('createRoomPage');
    const passwordPage = document.getElementById('passwordPage');
    const serverListPage = document.getElementById('serverListPage');
    
    // Éléments DOM - Page principale
    const setupUserId = document.getElementById('setupUserId');
    const showJoinRoomBtn = document.getElementById('showJoinRoomBtn');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const showServerListBtn = document.getElementById('showServerListBtn');
    
    // Éléments DOM - Page rejoindre salon
    const joinRoomId = document.getElementById('joinRoomId');
    const joinRoomConfirmBtn = document.getElementById('joinRoomConfirmBtn');
    const backFromJoinBtn = document.getElementById('backFromJoinBtn');
    
    // Éléments DOM - Page création salon
    const createRoomName = document.getElementById('createRoomName');
    const isPrivateRoom = document.getElementById('isPrivateRoom');
    const passwordField = document.getElementById('passwordField');
    const createRoomPassword = document.getElementById('createRoomPassword');
    const createRoomConfirmBtn = document.getElementById('createRoomConfirmBtn');
    const backFromCreateBtn = document.getElementById('backFromCreateBtn');
    
    // Éléments DOM - Page mot de passe
    const roomNameDisplay = document.getElementById('roomNameDisplay');
    const roomPassword = document.getElementById('roomPassword');
    const joinWithPasswordBtn = document.getElementById('joinWithPasswordBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    
    // Éléments DOM - Liste des serveurs
    const serversList = document.getElementById('serversList');
    const backFromServersBtn = document.getElementById('backFromServersBtn');
    
    // Éléments DOM - Chat
    const setupContainer = document.getElementById('setupContainer');
    const chatContainer = document.getElementById('chatContainer');
    const roomTitle = document.getElementById('roomTitle');
    const roomSubtitle = document.getElementById('roomSubtitle');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Variables globales
    let currentMessages = [];
    let userId = '';
    let currentRoom = '';
    let currentRoomPassword = '';
    let firebaseManager = null;
    let connectedUsers = new Set();
    let contentDetector = new ContentDetector();
    let pendingRoomData = null; // Pour stocker les données du salon en attente
    let tempUserId = ''; // Pour sauvegarder temporairement le pseudo
    
    // Initialisation
    init();
    
    async function init() {
        try {
            console.log('Initialisation Firebase...');
            
            const firebaseLoaded = await FirebaseLoader.loadFirebase();
            if (!firebaseLoaded || !window.firebase) {
                throw new Error('Impossible de charger Firebase SDK');
            }
            
            firebaseManager = new FirebaseManager();
            await firebaseManager.initialize();
            
            console.log('Firebase connecté avec succès !');
            
            // Lancer un nettoyage automatique des salons inactifs
            setTimeout(() => {
                firebaseManager.cleanupInactiveRooms();
            }, 2000); // Attendre 2 secondes pour ne pas ralentir l'ouverture
            
            checkConfiguration();
            setupEventListeners();
            
        } catch (error) {
            console.log('Connexion Firebase échouée:', error.message);
            showError('Erreur de connexion Firebase');
        }
    }
    
    // Vérifier si déjà configuré
    function checkConfiguration() {
        chrome.storage.local.get(['userId', 'currentRoom', 'roomPassword'], async (result) => {
            if (result.userId && result.currentRoom) {
                // Déjà configuré, reconnecter au salon Firebase
                try {
                    await joinRoomDirectly(result.userId, result.currentRoom, result.roomPassword || '');
                } catch (error) {
                    // Si la reconnexion échoue, retourner à la page principale
                    console.log('Reconnexion échouée, retour à la page principale');
                    showMainPage();
                }
            } else {
                // Première utilisation
                showMainPage();
            }
        });
    }
    
    // Configuration des événements
    function setupEventListeners() {
        // Page principale
        if (showJoinRoomBtn) {
            showJoinRoomBtn.addEventListener('click', showJoinRoomPage);
        }
        
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', showCreateRoomPage);
        }
        
        if (showServerListBtn) {
            showServerListBtn.addEventListener('click', showServerList);
        }
        
        // Page rejoindre salon
        if (joinRoomConfirmBtn) {
            joinRoomConfirmBtn.addEventListener('click', handleJoinRoom);
        }
        
        if (backFromJoinBtn) {
            backFromJoinBtn.addEventListener('click', showMainPage);
        }
        
        if (joinRoomId) {
            joinRoomId.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleJoinRoom();
                }
            });
        }
        
        // Page création salon
        if (createRoomConfirmBtn) {
            createRoomConfirmBtn.addEventListener('click', handleCreateRoom);
        }
        
        if (backFromCreateBtn) {
            backFromCreateBtn.addEventListener('click', showMainPage);
        }
        
        if (createRoomName) {
            createRoomName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleCreateRoom();
                }
            });
        }
        
        // Checkbox salon privé
        if (isPrivateRoom) {
            isPrivateRoom.addEventListener('change', togglePasswordField);
        }
        
        // Page mot de passe
        if (joinWithPasswordBtn) {
            joinWithPasswordBtn.addEventListener('click', joinRoomWithPassword);
        }
        
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', showMainPage);
        }
        
        if (roomPassword) {
            roomPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    joinRoomWithPassword();
                }
            });
        }
        
        // Liste des serveurs
        if (backFromServersBtn) {
            backFromServersBtn.addEventListener('click', showMainPage);
        }
        
        // Chat
        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Boutons de partage
        const shareCurrentTabBtn = document.getElementById('shareCurrentTab');
        const shareClipboardBtn = document.getElementById('shareClipboard');
        
        if (shareCurrentTabBtn) {
            shareCurrentTabBtn.addEventListener('click', shareCurrentTab);
        }
        
        if (shareClipboardBtn) {
            shareClipboardBtn.addEventListener('click', shareClipboard);
        }
    }
    
    // === NAVIGATION ENTRE LES PAGES === //
    
    function showMainPage() {
        mainPage.style.display = 'block';
        joinRoomPage.style.display = 'none';
        createRoomPage.style.display = 'none';
        passwordPage.style.display = 'none';
        serverListPage.style.display = 'none';
        
        // Charger les serveurs disponibles en arrière-plan
        loadAvailableServers();
    }
    
    function showJoinRoomPage() {
        // Sauvegarder le pseudo temporairement
        tempUserId = setupUserId.value.trim();
        
        if (!tempUserId) {
            showError('Veuillez d\'abord entrer votre pseudo');
            return;
        }
        
        mainPage.style.display = 'none';
        joinRoomPage.style.display = 'block';
        createRoomPage.style.display = 'none';
        passwordPage.style.display = 'none';
        serverListPage.style.display = 'none';
        
        joinRoomId.focus();
    }
    
    function showCreateRoomPage() {
        // Sauvegarder le pseudo temporairement
        tempUserId = setupUserId.value.trim();
        
        if (!tempUserId) {
            showError('Veuillez d\'abord entrer votre pseudo');
            return;
        }
        
        mainPage.style.display = 'none';
        joinRoomPage.style.display = 'none';
        createRoomPage.style.display = 'block';
        passwordPage.style.display = 'none';
        serverListPage.style.display = 'none';
        
        // Réinitialiser les champs
        createRoomName.value = '';
        isPrivateRoom.checked = false;
        createRoomPassword.value = '';
        passwordField.style.display = 'none';
        
        createRoomName.focus();
    }
    
    function showPasswordPage(roomName) {
        mainPage.style.display = 'none';
        joinRoomPage.style.display = 'none';
        createRoomPage.style.display = 'none';
        passwordPage.style.display = 'block';
        serverListPage.style.display = 'none';
        
        roomNameDisplay.textContent = `Salon "${roomName}" - Mot de passe requis`;
        roomPassword.focus();
    }
    
    function showServerList() {
        mainPage.style.display = 'none';
        joinRoomPage.style.display = 'none';
        createRoomPage.style.display = 'none';
        passwordPage.style.display = 'none';
        serverListPage.style.display = 'block';
        
        loadAndDisplayServers();
    }
    
    function showChatInterface() {
        setupContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        
        updateRoomInfo();
        initializeChat();
    }
    
    // === GESTION DES SALONS === //
    
    async function handleJoinRoom() {
        const userIdValue = tempUserId || setupUserId.value.trim();
        const roomIdValue = joinRoomId.value.trim();
        
        if (!userIdValue || !roomIdValue) {
            showError('Veuillez remplir tous les champs');
            return;
        }
        
        // Sauvegarder temporairement les données
        pendingRoomData = {
            userId: userIdValue,
            roomId: roomIdValue
        };
        
        // Vérifier si le salon nécessite un mot de passe
        try {
            const roomInfo = await firebaseManager.checkRoomInfo(roomIdValue);
            
            if (roomInfo && roomInfo.hasPassword) {
                showPasswordPage(roomIdValue);
            } else {
                // Pas de mot de passe nécessaire
                joinRoomDirectly(userIdValue, roomIdValue, '');
            }
        } catch (error) {
            // Si on ne peut pas vérifier, essayer de rejoindre directement
            joinRoomDirectly(userIdValue, roomIdValue, '');
        }
    }
    
    // Afficher/masquer le champ mot de passe selon la checkbox
    function togglePasswordField() {
        if (isPrivateRoom && passwordField) {
            if (isPrivateRoom.checked) {
                passwordField.style.display = 'flex';
                createRoomPassword.focus();
            } else {
                passwordField.style.display = 'none';
                createRoomPassword.value = '';
            }
        }
    }
    
    async function handleCreateRoom() {
        const userIdValue = tempUserId || setupUserId.value.trim();
        const roomNameValue = createRoomName.value.trim();
        const isPrivate = isPrivateRoom.checked;
        const passwordValue = isPrivate ? createRoomPassword.value.trim() : '';
        
        if (!userIdValue || !roomNameValue) {
            showError('Veuillez remplir au moins le pseudo et le nom du salon');
            return;
        }
        
        if (isPrivate && !passwordValue) {
            showError('Veuillez entrer un mot de passe pour le salon privé');
            return;
        }
        
        try {
            // Créer le salon d'abord
            await firebaseManager.createRoom(roomNameValue, userIdValue, passwordValue);
            
            // Puis le rejoindre
            joinRoomDirectly(userIdValue, roomNameValue, passwordValue);
            
        } catch (error) {
            showError('Impossible de créer le salon');
        }
    }
    
    function joinRoomWithPassword() {
        if (!pendingRoomData) {
            showError('Données de connexion perdues');
            showMainPage();
            return;
        }
        
        const password = roomPassword.value.trim();
        joinRoomDirectly(pendingRoomData.userId, pendingRoomData.roomId, password);
    }
    
    async function joinRoomDirectly(userIdValue, roomIdValue, passwordValue) {
        try {
            // Tenter de rejoindre le salon avec Firebase
            await firebaseManager.joinRoom(roomIdValue, userIdValue, passwordValue);
            
            // Si succès, sauvegarder les données
            userId = userIdValue;
            currentRoom = roomIdValue;
            currentRoomPassword = passwordValue;
            
            // Sauvegarder la configuration
            chrome.storage.local.set({
                userId: userId,
                currentRoom: currentRoom,
                roomPassword: currentRoomPassword
            });
            
            showChatInterface();
            
        } catch (error) {
            // Gestion silencieuse des erreurs pour éviter les remontées dans Chrome
            if (error.message === 'Mot de passe incorrect') {
                showError('Mot de passe incorrect');
                
                if (passwordValue) {
                    // Si c'était un salon avec mot de passe, revenir à la page mot de passe
                    roomPassword.value = '';
                    roomPassword.focus();
                } else {
                    // Montrer la page de mot de passe pour la première fois
                    showPasswordPage(roomIdValue);
                }
            } else {
                showError('Impossible de rejoindre le salon');
                showMainPage();
            }
        }
    }
    
    // === LISTE DES SERVEURS === //
    
    async function loadAvailableServers() {
        if (!firebaseManager || !firebaseManager.isFirebaseConnected()) {
            return;
        }
        
        try {
            const servers = await firebaseManager.getAvailableRooms();
            return servers;
        } catch (error) {
            console.log('Chargement serveurs échoué:', error.message);
            return [];
        }
    }
    
    async function loadAndDisplayServers() {
        serversList.innerHTML = '<div class="loading">Chargement des salons...</div>';
        
        try {
            // Lancer un nettoyage pour avoir une liste fraîche
            firebaseManager.cleanupInactiveRooms().catch(() => {
                // Nettoyage en arrière-plan, ne pas bloquer si ça échoue
            });
            
            const servers = await loadAvailableServers();
            displayServers(servers);
        } catch (error) {
            console.log('Affichage serveurs échoué:', error.message);
            serversList.innerHTML = '<div class="loading">Erreur de chargement</div>';
        }
    }
    
    function displayServers(servers) {
        if (!servers || servers.length === 0) {
            serversList.innerHTML = '<div class="loading">Aucun salon disponible</div>';
            return;
        }
        
        const serversHTML = servers.map(server => `
            <div class="server-item" data-room-id="${server.id}" data-has-password="${server.hasPassword}">
                <div class="server-icon">${server.hasPassword ? '🔒' : '🌐'}</div>
                <div class="server-info">
                    <div class="server-name">${server.id}</div>
                    <div class="server-stats">${server.userCount || 0} utilisateurs • ${server.messageCount || 0} messages</div>
                </div>
            </div>
        `).join('');
        
        serversList.innerHTML = serversHTML;
        
        // Ajouter les événements de clic
        serversList.querySelectorAll('.server-item').forEach(item => {
            item.addEventListener('click', () => {
                const roomId = item.dataset.roomId;
                const hasPassword = item.dataset.hasPassword === 'true';
                selectServerRoom(roomId, hasPassword);
            });
        });
    }
    
    async function selectServerRoom(roomId, hasPassword) {
        // Sauvegarder le pseudo temporairement
        tempUserId = setupUserId.value.trim();
        
        if (!tempUserId) {
            showError('Veuillez entrer votre pseudo d\'abord');
            return;
        }
        
        const userIdValue = tempUserId;
        
        if (hasPassword) {
            // Salon avec mot de passe - sauvegarder les données et demander le mot de passe
            pendingRoomData = {
                userId: userIdValue,
                roomId: roomId
            };
            showPasswordPage(roomId);
        } else {
            // Salon public - rejoindre directement
            try {
                await joinRoomDirectly(userIdValue, roomId, '');
            } catch (error) {
                showError('Impossible de rejoindre le salon');
            }
        }
    }
    
    // === GESTION DU CHAT === //
    
    function updateRoomInfo() {
        if (roomTitle) {
            roomTitle.textContent = `Salon: ${currentRoom}`;
        }
        if (roomSubtitle) {
            const lockIcon = currentRoomPassword ? '🔒' : '🌐';
            const roomType = currentRoomPassword ? 'prive' : 'public';
            roomSubtitle.textContent = `${lockIcon} ${roomType} • ${userId}`;
        }
    }
    
    async function initializeChat() {
        try {
            console.log('Initialisation du chat...');
            
            // Le salon a déjà été rejoint dans joinRoomDirectly ou checkConfiguration
            // Écouter les nouveaux messages
            firebaseManager.onNewMessage((message) => {
                const messageWithId = {
                    id: message.id || Date.now().toString(),
                    ...message
                };
                
                const existingMessage = currentMessages.find(m => m.id === messageWithId.id);
                if (!existingMessage) {
                    currentMessages.push(messageWithId);
                    displayMessages();
                }
            });
            
            // Écouter les utilisateurs connectés
            firebaseManager.onUsersChanged((users) => {
                connectedUsers = new Set(users);
                updateOnlineCount();
            });
            
            // Charger l'historique
            const messages = await firebaseManager.getMessages();
            currentMessages = messages || [];
            displayMessages();
            
            console.log('Chat initialisé avec succès');
            
        } catch (error) {
            showError('Impossible de se connecter au salon');
        }
    }
    
    function updateOnlineCount() {
        const countElement = document.querySelector('.count-number');
        if (countElement) {
            countElement.textContent = connectedUsers.size;
        }
    }
    
    async function sendMessage() {
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        const message = {
            id: Date.now().toString(),
            type: contentDetector ? contentDetector.detectType(content) : 'text',
            content: content,
            timestamp: new Date().toISOString(),
            userId: userId
        };
        
        try {
            await firebaseManager.sendMessage(message);
            messageInput.value = '';
            
        } catch (error) {
            showError('Impossible d\'envoyer le message');
        }
    }
    
    function displayMessages() {
        if (!chatMessages) return;
        
        // Supprimer le message de bienvenue
        const welcomeMsg = chatMessages.querySelector('.welcome-message');
        if (welcomeMsg && currentMessages.length > 0) {
            welcomeMsg.remove();
        }
        
        // Vider et recréer les messages
        const existingMessages = chatMessages.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        currentMessages.forEach(message => {
            const messageElement = createMessageElement(message);
            if (messageElement) {
                chatMessages.appendChild(messageElement);
            }
        });
        
        // Scroll vers le bas
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
    
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const isMyMessage = message.userId === userId;
        messageDiv.classList.add(isMyMessage ? 'sent' : 'received');
        
        const senderBadge = isMyMessage ? 'vous' : (message.userId || 'inconnu');
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender-badge ${isMyMessage ? 'sender-me' : 'sender-other'}">${senderBadge}</span>
                <span class="message-time">${formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${formatMessageContent(message.content, message.type, message)}</div>
        `;
        
        return messageDiv;
    }
    
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    function formatMessageContent(content, type, message) {
        if (!contentDetector) return content;
        return contentDetector.formatContent(content, type, message);
    }
    
    // === PARTAGE === //
    
    async function shareCurrentTab() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url) {
                const shareMessage = {
                    id: Date.now().toString(),
                    type: 'page_share',
                    content: currentTab.url,
                    title: currentTab.title,
                    timestamp: new Date().toISOString(),
                    userId: userId
                };
                
                await firebaseManager.sendMessage(shareMessage);
                showSuccess('Page partagee !');
            }
        } catch (error) {
            showError('Erreur lors du partage');
        }
    }
    
    async function shareClipboard() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            
            if (clipboardText && clipboardText.trim()) {
                const shareMessage = {
                    id: Date.now().toString(),
                    type: 'clipboard_share',
                    content: clipboardText,
                    detectedType: contentDetector ? contentDetector.detectType(clipboardText) : 'text',
                    timestamp: new Date().toISOString(),
                    userId: userId
                };
                
                await firebaseManager.sendMessage(shareMessage);
                showSuccess('Presse-papier partage !');
            } else {
                showError('Presse-papier vide');
            }
        } catch (error) {
            showError('Acces au presse-papier refuse');
        }
    }
    
    // === UTILITAIRES === //
    
    function logout() {
        // Quitter le salon et arrêter le heartbeat
        if (firebaseManager) {
            firebaseManager.leaveRoom();
        }
        
        chrome.storage.local.clear();
        currentMessages = [];
        userId = '';
        currentRoom = '';
        currentRoomPassword = '';
        connectedUsers.clear();
        
        setupContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
        showMainPage();
    }
    
    function showError(message) {
        // Supprimer complètement les logs console pour éviter les "erreurs" dans Chrome
        // Seule la notification visuelle sera affichée
        showNotification(message, 'error');
    }
    
    function showSuccess(message) {
        // Garder seulement les succès dans la console (pas considérés comme des erreurs)
        console.log('Extension Success:', message);
        showNotification(message, 'success');
    }
    
    function showNotification(message, type = 'info') {
        const notificationArea = document.getElementById('notificationArea');
        if (!notificationArea) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notificationArea.appendChild(notification);
        
        // Animer l'apparition
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Supprimer automatiquement après 4 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
});

// Fonction globale pour copier
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copie !';
        
        setTimeout(() => {
            button.textContent = originalText;
        }, 1000);
    }).catch(err => {
        console.log('Copie échouée:', err.message);
    });
};