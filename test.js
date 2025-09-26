// Script de test pour vérifier le bon fonctionnement de l'extension Mini Chat

console.log('🧪 Tests de l\'extension Mini Chat');

// Test 1: Vérification des utilitaires
if (typeof ContentDetector !== 'undefined') {
    console.log('✅ ContentDetector chargé');
    
    const detector = new ContentDetector();
    
    // Test de détection de liens
    const testText = 'Voici un lien: https://example.com et une clé: ABCD-1234-EFGH-5678';
    const detected = detector.detectAll(testText);
    
    console.log('🔍 Contenu détecté:', detected);
    
    if (detected.urls.length > 0) {
        console.log('✅ Détection d\'URL fonctionne');
    } else {
        console.log('❌ Détection d\'URL échoue');
    }
    
    if (detected.cdKeys.length > 0) {
        console.log('✅ Détection de clé CD fonctionne');
    } else {
        console.log('❌ Détection de clé CD échoue');
    }
} else {
    console.log('❌ ContentDetector non chargé');
}

// Test 2: Vérification du stockage Chrome
if (typeof chrome !== 'undefined' && chrome.storage) {
    console.log('✅ API Chrome Storage disponible');
    
    // Test d'écriture/lecture
    chrome.storage.local.set({test: 'Mini Chat Test'}, () => {
        chrome.storage.local.get(['test'], (result) => {
            if (result.test === 'Mini Chat Test') {
                console.log('✅ Stockage Chrome fonctionne');
            } else {
                console.log('❌ Stockage Chrome échoue');
            }
        });
    });
} else {
    console.log('❌ API Chrome Storage non disponible (normal si pas dans l\'extension)');
}

// Test 3: Vérification de la structure DOM
document.addEventListener('DOMContentLoaded', () => {
    const requiredElements = [
        'messageInput',
        'sendButton', 
        'chatMessages',
        'shareCurrentTab',
        'shareClipboard'
    ];
    
    let allFound = true;
    requiredElements.forEach(id => {
        if (document.getElementById(id)) {
            console.log(`✅ Élément ${id} trouvé`);
        } else {
            console.log(`❌ Élément ${id} manquant`);
            allFound = false;
        }
    });
    
    if (allFound) {
        console.log('✅ Structure DOM complète');
    } else {
        console.log('❌ Structure DOM incomplète');
    }
});

console.log('🏁 Tests terminés - Vérifiez les résultats ci-dessus');