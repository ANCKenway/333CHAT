// Content script pour détecter les liens et clés sur les pages
(function() {
    'use strict';
    
    // Patterns pour détecter les clés CD et codes
    const keyPatterns = [
        /[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/g, // Format XXXX-XXXX-XXXX-XXXX
        /[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}/g, // Format XXXXX-XXXXX-XXXXX-XXXXX
        /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/g, // UUID format
    ];
    
    // Fonction pour détecter les clés et liens
    function detectKeysAndLinks() {
        const textContent = document.body.innerText;
        const detected = {
            keys: [],
            links: []
        };
        
        // Détecter les clés
        keyPatterns.forEach(pattern => {
            const matches = textContent.match(pattern);
            if (matches) {
                detected.keys.push(...matches);
            }
        });
        
        // Détecter les liens
        const links = Array.from(document.querySelectorAll('a[href]'))
            .map(a => ({
                text: a.textContent.trim(),
                url: a.href
            }))
            .filter(link => link.text && link.url);
        
        detected.links = links;
        
        return detected;
    }
    
    // Écouter les messages du popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'detectContent') {
            const detected = detectKeysAndLinks();
            sendResponse(detected);
        }
        
        if (request.action === 'getPageInfo') {
            sendResponse({
                title: document.title,
                url: window.location.href
            });
        }
    });
    
    // Ajouter des boutons de partage rapide pour les clés détectées
    function addQuickShareButtons() {
        const keys = [];
        keyPatterns.forEach(pattern => {
            const matches = document.body.innerText.match(pattern);
            if (matches) {
                keys.push(...matches);
            }
        });
        
        if (keys.length > 0) {
            console.log('Mini Chat: Clés détectées sur cette page:', keys);
        }
    }
    
    // Initialiser quand la page est chargée
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addQuickShareButtons);
    } else {
        addQuickShareButtons();
    }
})();