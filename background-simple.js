// Service worker simplifié pour l'extension Chrome
chrome.runtime.onInstalled.addListener(() => {
    console.log('Mini Chat extension installée');
    
    // Initialiser les données de base
    chrome.storage.local.set({
        messages: [],
        userId: '',
        partnerId: '',
        isOnline: false
    }).catch(error => console.error('Erreur storage:', error));
});

// Écouter les messages des content scripts et popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.action === 'getCurrentTab') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    sendResponse({
                        title: tabs[0].title,
                        url: tabs[0].url
                    });
                } else {
                    sendResponse({ error: 'Aucun onglet actif' });
                }
            });
            return true; // Permet la réponse asynchrone
        }
        
        if (request.action === 'shareCurrentPage') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    const message = {
                        id: Date.now().toString(),
                        type: 'link',
                        content: tabs[0].title,
                        url: tabs[0].url,
                        timestamp: new Date().toISOString(),
                        sender: 'me'
                    };
                    
                    // Sauvegarder le message
                    chrome.storage.local.get(['messages'], (result) => {
                        const messages = result.messages || [];
                        messages.push(message);
                        chrome.storage.local.set({ messages });
                    });
                }
            });
            return true;
        }
        
        if (request.action === 'setBadge') {
            chrome.action.setBadgeText({ text: request.text || '' });
            chrome.action.setBadgeBackgroundColor({ color: request.color || '#ff6b6b' });
            return true;
        }
        
    } catch (error) {
        console.error('Erreur dans background script:', error);
        sendResponse({ error: error.message });
    }
});

// Fonction pour simuler occasionnellement des messages du partenaire
function simulatePartnerMessage() {
    chrome.storage.local.get(['partnerId', 'messages'], (result) => {
        if (!result.partnerId) return;
        
        // Messages de démonstration
        const demoMessages = [
            "Salut ! 👋",
            "Regarde ce lien : https://example.com",
            "J'ai trouvé cette clé : ABCD-1234-EFGH-5678",
            "Ça marche bien l'extension ! 😊",
            "Tu as vu mon dernier message ?"
        ];
        
        const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
        
        const message = {
            id: Date.now().toString(),
            type: 'text',
            content: randomMessage,
            timestamp: new Date().toISOString(),
            sender: result.partnerId
        };
        
        const messages = result.messages || [];
        messages.push(message);
        chrome.storage.local.set({ messages });
        
        // Badge de notification
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#ff6b6b' });
    });
}

// Simuler un message du partenaire de temps en temps (pour démonstration)
// Utilisation de setTimeout au lieu d'alarms pour simplifier
function startSimulation() {
    setTimeout(() => {
        if (Math.random() < 0.3) { // 30% de chance
            simulatePartnerMessage();
        }
        startSimulation(); // Répéter
    }, 30000); // Toutes les 30 secondes
}

// Démarrer la simulation après 10 secondes
setTimeout(startSimulation, 10000);