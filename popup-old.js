//    // Éléments DOM - Configuration
    const setupContainer = document.getElementById('setupContainer');
    const chatContainer = document.getElementById('chatContainer');
    const setupUserId = document.getElementById('setupUserId');
    const setupPartnerId = document.getElementById('setupPartnerId');
    const startChatBtn = document.getElementById('startChatBtn');
    const skipSetupBtn = document.getElementById('skipSetupBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    // Éléments DOM - Chat
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const userIdInput = document.getElementById('userId');
    const partnerIdInput = document.getElementById('partnerId');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const shareCurrentTabBtn = document.getElementById('shareCurrentTab');
    const shareClipboardBtn = document.getElementById('shareClipboard');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const generateShareCodeBtn = document.getElementById('generateShareCode');
    const shareCodeInput = document.getElementById('shareCodeInput');
    const quickSuggestions = document.getElementById('quickSuggestions');
    
    // Variables globales
    let currentMessages = [];
    let userId = '';
    let partnerId = '';
    let contentDetector = new ContentDetector();
    let isConfigured = false;
    
    // Initialisation
    init();
    
    function init() {
        checkConfiguration();
        setupEventListeners();
    }
    
    // Vérifier si l'extension est déjà configurée
    function checkConfiguration() {
        chrome.storage.local.get(['userId', 'partnerId'], (result) => {
            if (result.userId && result.partnerId) {
                // Déjà configuré
                userId = result.userId;
                partnerId = result.partnerId;
                isConfigured = true;
                showChatInterface();
                loadMessages();
                startMessagePolling();
                updateStatus();
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
        startChatBtn.addEventListener('click', startChat);
        skipSetupBtn.addEventListener('click', skipSetup);
        
        // Validation en temps réel
        setupUserId.addEventListener('input', validateSetupForm);
        setupPartnerId.addEventListener('input', validateSetupForm);
        
        // Écouteurs pour le chat (si les éléments existent)
        if (messageInput) {
            sendButton.addEventListener('click', sendMessage);
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            // Détection de contenu en temps réel
            messageInput.addEventListener('input', () => {
                detectAndSuggestContent();
            });
        }
        
        // Paramètres
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                showSetupInterface();
            });
        }
        
        // Actions rapides
        if (shareCurrentTabBtn) shareCurrentTabBtn.addEventListener('click', shareCurrentTab);
        if (shareClipboardBtn) shareClipboardBtn.addEventListener('click', shareClipboard);
        if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);
        if (generateShareCodeBtn) generateShareCodeBtn.addEventListener('click', generateShareCode);
        
        // Code de partage
        if (shareCodeInput) {
            shareCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    retrieveFromShareCode();
                }
            });
        }
    }
    
    // Valider le formulaire de configuration
    function validateSetupForm() {
        const userIdValid = setupUserId.value.trim().length > 0;
        const partnerIdValid = setupPartnerId.value.trim().length > 0;
        
        startChatBtn.disabled = !(userIdValid && partnerIdValid);
        
        if (userIdValid && partnerIdValid) {
            startChatBtn.textContent = '🚀 Commencer à chatter';
        } else {
            startChatBtn.textContent = 'Veuillez remplir les deux champs';
        }
    }
    
    // Démarrer le chat après configuration
    function startChat() {
        const userIdValue = setupUserId.value.trim();
        const partnerIdValue = setupPartnerId.value.trim();
        
        if (!userIdValue || !partnerIdValue) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        // Sauvegarder les paramètres
        userId = userIdValue;
        partnerId = partnerIdValue;
        
        chrome.storage.local.set({ 
            userId: userId, 
            partnerId: partnerId 
        }, () => {
            isConfigured = true;
            showChatInterface();
            loadMessages();
            startMessagePolling();
            updateStatus();
            
            // Message de bienvenue
            addWelcomeMessage();
        });
    }
    
    // Passer la configuration (mode démo)
    function skipSetup() {
        userId = 'Vous';
        partnerId = 'Votre copine';
        
        chrome.storage.local.set({ 
            userId: userId, 
            partnerId: partnerId 
        }, () => {
            isConfigured = true;
            showChatInterface();
            loadMessages();
            startMessagePolling();
            updateStatus();
            
            // Message explicatif
            addSkipMessage();
        });
    }
    
    // Ajouter un message de bienvenue
    function addWelcomeMessage() {
        const welcomeMessage = {
            id: 'welcome-' + Date.now(),
            type: 'system',
            content: `🎉 Parfait ${userId} ! Vous pouvez maintenant chatter avec ${partnerId}. L'extension détecte automatiquement les liens, clés CD et autres contenus utiles.`,
            timestamp: new Date().toISOString(),
            sender: 'system'
        };
        
        currentMessages.push(welcomeMessage);
        saveMessages();
        displayMessages();
    }
    
    // Ajouter un message pour la configuration sautée
    function addSkipMessage() {
        const skipMessage = {
            id: 'skip-' + Date.now(),
            type: 'system',
            content: `Mode démo activé ! Vous pouvez tester l'extension. Cliquez sur ⚙️ en haut à droite pour configurer vos vrais pseudos plus tard.`,
            timestamp: new Date().toISOString(),
            sender: 'system'
        };
        
        currentMessages.push(skipMessage);
        saveMessages();
        displayMessages();
    }
    
    // Le reste des fonctions du chat original...
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const userIdInput = document.getElementById('userId');
    const partnerIdInput = document.getElementById('partnerId');
        const clearHistoryBtn = document.getElementById('clearHistory');
        const shareCurrentTabBtn = document.getElementById('shareCurrentTab');
        const shareClipboardBtn = document.getElementById('shareClipboard');
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const generateShareCodeBtn = document.getElementById('generateShareCode');
        const shareCodeInput = document.getElementById('shareCodeInput');
        const quickSuggestions = document.getElementById('quickSuggestions');    // Variables globales
    let currentMessages = [];
    let userId = '';
    let partnerId = '';
    let contentDetector = new ContentDetector();
    
    // Initialisation
    init();
    
    function init() {
        loadSettings();
        loadMessages();
        setupEventListeners();
        startMessagePolling();
        updateStatus();
    }
    
    // Charger les paramètres sauvegardés
    function loadSettings() {
        chrome.storage.local.get(['userId', 'partnerId'], (result) => {
            if (result.userId) {
                userId = result.userId;
                userIdInput.value = userId;
            }
            if (result.partnerId) {
                partnerId = result.partnerId;
                partnerIdInput.value = partnerId;
            }
        });
    }
    
    // Charger l'historique des messages
    function loadMessages() {
        chrome.storage.local.get(['messages'], (result) => {
            currentMessages = result.messages || [];
            displayMessages();
        });
    }
    
    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Envoi de message
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Sauvegarde des paramètres
        userIdInput.addEventListener('blur', () => {
            userId = userIdInput.value.trim();
            chrome.storage.local.set({ userId });
        });
        
        partnerIdInput.addEventListener('blur', () => {
            partnerId = partnerIdInput.value.trim();
            chrome.storage.local.set({ partnerId });
        });
        
        // Actions rapides
        shareCurrentTabBtn.addEventListener('click', shareCurrentTab);
        shareClipboardBtn.addEventListener('click', shareClipboard);
        clearHistoryBtn.addEventListener('click', clearHistory);
        generateShareCodeBtn.addEventListener('click', generateShareCode);
        
        // Code de partage
        shareCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                retrieveFromShareCode();
            }
        });
        
        // Détection de contenu en temps réel
        messageInput.addEventListener('input', () => {
            detectAndSuggestContent();
        });
        
        // Afficher/masquer les paramètres
        document.querySelector('.chat-header').addEventListener('dblclick', () => {
            document.querySelector('.chat-settings').classList.toggle('show');
        });
    }
    
    // Envoyer un message
    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content || !userId) {
            if (!userId) {
                alert('Veuillez définir votre ID utilisateur dans les paramètres (double-clic sur l\'en-tête)');
            }
            return;
        }
        
        const message = {
            id: Date.now().toString(),
            type: detectMessageType(content),
            content: content,
            timestamp: new Date().toISOString(),
            sender: 'me',
            userId: userId
        };
        
        // Ajouter le message à la liste
        currentMessages.push(message);
        saveMessages();
        displayMessages();
        
        // Vider le champ de saisie
        messageInput.value = '';
        messageInput.focus();
        
        // Réinitialiser le badge
        chrome.action.setBadgeText({ text: '' });
    }
    
    // Détecter le type de message
    function detectMessageType(content) {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const keyPatterns = [
            /[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/g,
            /[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}/g,
            /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/g
        ];
        
        if (urlPattern.test(content)) return 'link';
        
        for (let pattern of keyPatterns) {
            if (pattern.test(content)) return 'key';
        }
        
        return 'text';
    }
    
    // Afficher les messages
    function displayMessages() {
        // Supprimer le message de bienvenue s'il y a des vrais messages
        if (currentMessages.length > 0) {
            const welcomeMsg = chatMessages.querySelector('.welcome-message');
            if (welcomeMsg) welcomeMsg.remove();
        }
        
        // Vider et recréer tous les messages
        const existingMessages = chatMessages.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        currentMessages.forEach(message => {
            const messageElement = createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });
        
        // Faire défiler vers le bas
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Créer un élément de message
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'me' ? 'sent' : 'received'}`;
        
        let contentHtml = '';
        
        // Utiliser le détecteur de contenu amélioré
        contentHtml = contentDetector.formatMessage(message.content);
        
        const time = new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">${contentHtml}</div>
            <div class="message-time">${time}</div>
        `;
        
        return messageDiv;
    }
    
    // Échapper le HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Partager l'onglet courant
    function shareCurrentTab() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                const content = `📄 ${tabs[0].title}\n${tabs[0].url}`;
                messageInput.value = content;
                sendMessage();
            }
        });
    }
    
    // Partager le presse-papier
    async function shareClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text.trim()) {
                messageInput.value = text.trim();
                sendMessage();
            } else {
                alert('Le presse-papier est vide');
            }
        } catch (err) {
            alert('Impossible de lire le presse-papier. Veuillez coller manuellement.');
            messageInput.focus();
        }
    }
    
    // Vider l'historique
    function clearHistory() {
        if (confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ?')) {
            currentMessages = [];
            saveMessages();
            displayMessages();
            
            // Remettre le message de bienvenue
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = 'Bienvenue dans votre mini chat ! 🎉<br>Partagez facilement des liens et des clés CD.';
            chatMessages.appendChild(welcomeDiv);
        }
    }
    
    // Sauvegarder les messages
    function saveMessages() {
        chrome.storage.local.set({ messages: currentMessages });
    }
    
    // Polling pour les nouveaux messages
    function startMessagePolling() {
        setInterval(() => {
            chrome.storage.local.get(['messages'], (result) => {
                const newMessages = result.messages || [];
                if (newMessages.length !== currentMessages.length) {
                    currentMessages = newMessages;
                    displayMessages();
                }
            });
        }, 1000);
    }
    
    // Mettre à jour le statut
    function updateStatus() {
        const isOnline = userId && partnerId;
        statusDot.className = `status-dot ${isOnline ? 'online' : ''}`;
        statusText.textContent = isOnline ? 'En ligne' : 'Hors ligne';
        
        setInterval(() => {
            const newIsOnline = userIdInput.value.trim() && partnerIdInput.value.trim();
            if (newIsOnline !== (statusDot.classList.contains('online'))) {
                statusDot.className = `status-dot ${newIsOnline ? 'online' : ''}`;
                statusText.textContent = newIsOnline ? 'En ligne' : 'Hors ligne';
            }
        }, 2000);
    }
    
    // Détecter et suggérer du contenu
    function detectAndSuggestContent() {
        const inputContent = messageInput.value;
        if (inputContent.length < 3) {
            quickSuggestions.classList.remove('show');
            return;
        }
        
        const detected = contentDetector.detectAll(inputContent);
        const suggestions = contentDetector.createQuickSuggestions(detected);
        
        if (suggestions.length > 0) {
            quickSuggestions.innerHTML = '';
            suggestions.forEach(suggestion => {
                const btn = document.createElement('button');
                btn.className = 'suggestion-btn';
                btn.textContent = suggestion.text;
                btn.onclick = () => {
                    messageInput.value = suggestion.content;
                    quickSuggestions.classList.remove('show');
                    messageInput.focus();
                };
                quickSuggestions.appendChild(btn);
            });
            quickSuggestions.classList.add('show');
        } else {
            quickSuggestions.classList.remove('show');
        }
    }
    
    // Générer un code de partage
    function generateShareCode() {
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (!lastMessage) {
            alert('Aucun message à partager');
            return;
        }
        
        const shareCode = SyncManager.generateShareCode(lastMessage);
        
        // Afficher le code de partage
        const codeDisplay = document.createElement('div');
        codeDisplay.className = 'share-code';
        codeDisplay.innerHTML = `
            <div class="share-code-label">Code de partage généré:</div>
            <div onclick="copyToClipboard('${shareCode}')" style="cursor: pointer;">${shareCode}</div>
            <div style="font-size: 9px; margin-top: 4px;">Cliquez pour copier • Expire dans 24h</div>
        `;
        
        // Insérer après les messages
        chatMessages.appendChild(codeDisplay);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        NotificationManager.show('Code de partage généré !', 'success');
    }
    
    // Récupérer un message par code de partage
    async function retrieveFromShareCode() {
        const code = shareCodeInput.value.trim().toUpperCase();
        if (!code) return;
        
        const message = await SyncManager.retrieveByShareCode(code);
        if (message) {
            currentMessages.push({
                ...message,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                sender: partnerId || 'Partagé'
            });
            saveMessages();
            displayMessages();
            shareCodeInput.value = '';
            NotificationManager.show('Message récupéré !', 'success');
        } else {
            NotificationManager.show('Code invalide ou expiré', 'error');
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