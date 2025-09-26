// Service worker pour l'extension Chrome
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

// Écouter les messages des content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getCurrentTab') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                sendResponse({
                    title: tabs[0].title,
                    url: tabs[0].url
                });
            }
        });
        return true; // Permet la réponse asynchrone
    }
    
    if (request.action === 'shareCurrentPage') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
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
    }
});

// Simuler la synchronisation (en réalité, vous pourriez utiliser Firebase, WebRTC, ou un serveur)
chrome.alarms.create('syncMessages', { periodInMinutes: 0.1 }); // Toutes les 6 secondes

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncMessages') {
        // Simuler la réception de messages du partenaire
        simulatePartnerMessages();
    }
});

function simulatePartnerMessages() {
    chrome.storage.local.get(['partnerId', 'messages'], (result) => {
        if (!result.partnerId) return;
        
        // Simuler occasionnellement un message du partenaire (pour démonstration)
        if (Math.random() < 0.02) { // 2% de chance toutes les 6 secondes
            const partnerMessages = [
                "Hey ! Comment ça va ?",
                "Regarde ce lien : https://example.com",
                "J'ai trouvé cette clé CD : ABCD-1234-EFGH-5678",
                "Tu peux vérifier ça quand tu auras le temps ?",
                "Merci pour le lien de tout à l'heure ! 😊"
            ];
            
            const randomMessage = partnerMessages[Math.floor(Math.random() * partnerMessages.length)];
            
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
            
            // Notification optionnelle
            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#ff6b6b' });
        }
    });
}