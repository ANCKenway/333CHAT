// Utilitaires pour détecter et gérer les liens, clés CD et autres contenus spéciaux
class ContentDetector {
    constructor() {
        this.patterns = {
            // Patterns pour clés CD et codes de jeu
            cdKeys: [
                /\b[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}\b/g,
                /\b[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}\b/g,
                /\b[A-Z0-9]{4}[-\s][A-Z0-9]{4}[-\s][A-Z0-9]{4}[-\s][A-Z0-9]{4}\b/g,
                /\b[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}\b/g, // UUID
            ],
            
            // Patterns pour URLs
            urls: [
                /(https?:\/\/[^\s]+)/g,
                /(www\.[^\s]+\.[a-z]{2,}[^\s]*)/gi,
            ],
            
            // Patterns pour emails
            emails: [
                /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
            ],
            
            // Patterns pour codes de réduction
            promoCodes: [
                /\b(PROMO|CODE|REDUCTION|DISCOUNT)[-_]?[A-Z0-9]{3,15}\b/gi,
                /\b[A-Z]{2,}[0-9]{2,8}\b/g,
            ],
            
            // Patterns pour numéros de téléphone français
            phoneNumbers: [
                /\b(?:\+33|0)[1-9](?:[-.\s]?[0-9]{2}){4}\b/g
            ]
        };
    }
    
    // Détecter tous les types de contenus dans un texte
    detectAll(text) {
        const detected = {
            cdKeys: [],
            urls: [],
            emails: [],
            promoCodes: [],
            phoneNumbers: []
        };
        
        // Détecter chaque type de contenu
        for (const [type, patterns] of Object.entries(this.patterns)) {
            for (const pattern of patterns) {
                const matches = text.match(pattern);
                if (matches) {
                    detected[type].push(...matches.map(match => match.trim()));
                }
            }
        }
        
        // Éliminer les doublons
        for (const type in detected) {
            detected[type] = [...new Set(detected[type])];
        }
        
        return detected;
    }
    
    // Formater un message avec les contenus détectés
    formatMessage(content) {
        let formattedContent = content;
        
        // Formater les URLs
        this.patterns.urls.forEach(pattern => {
            formattedContent = formattedContent.replace(pattern, (url) => {
                const cleanUrl = url.startsWith('http') ? url : `http://${url}`;
                return `<div class="detected-content url">
                    <span class="content-type">🔗 Lien:</span>
                    <a href="${cleanUrl}" target="_blank">${url}</a>
                    <button class="copy-btn" onclick="copyToClipboard('${cleanUrl}')">Copier</button>
                </div>`;
            });
        });
        
        // Formater les clés CD
        this.patterns.cdKeys.forEach(pattern => {
            formattedContent = formattedContent.replace(pattern, (key) => {
                return `<div class="detected-content cd-key">
                    <span class="content-type">🎮 Clé CD:</span>
                    <code>${key}</code>
                    <button class="copy-btn" onclick="copyToClipboard('${key}')">Copier</button>
                </div>`;
            });
        });
        
        // Formater les emails
        this.patterns.emails.forEach(pattern => {
            formattedContent = formattedContent.replace(pattern, (email) => {
                return `<div class="detected-content email">
                    <span class="content-type">📧 Email:</span>
                    <a href="mailto:${email}">${email}</a>
                    <button class="copy-btn" onclick="copyToClipboard('${email}')">Copier</button>
                </div>`;
            });
        });
        
        // Formater les codes promo
        this.patterns.promoCodes.forEach(pattern => {
            formattedContent = formattedContent.replace(pattern, (code) => {
                return `<div class="detected-content promo-code">
                    <span class="content-type">🎫 Code promo:</span>
                    <code>${code}</code>
                    <button class="copy-btn" onclick="copyToClipboard('${code}')">Copier</button>
                </div>`;
            });
        });
        
        // Formater les numéros de téléphone
        this.patterns.phoneNumbers.forEach(pattern => {
            formattedContent = formattedContent.replace(pattern, (phone) => {
                return `<div class="detected-content phone">
                    <span class="content-type">📞 Téléphone:</span>
                    <a href="tel:${phone}">${phone}</a>
                    <button class="copy-btn" onclick="copyToClipboard('${phone}')">Copier</button>
                </div>`;
            });
        });
        
        return formattedContent;
    }
    
    // Détecter le type principal d'un message
    detectType(content) {
        if (!content || typeof content !== 'string') {
            return 'text';
        }
        
        // Vérifier chaque type par ordre de priorité
        for (const pattern of this.patterns.urls) {
            if (pattern.test(content)) {
                return 'url';
            }
        }
        
        for (const pattern of this.patterns.cdKeys) {
            if (pattern.test(content)) {
                return 'cdkey';
            }
        }
        
        for (const pattern of this.patterns.emails) {
            if (pattern.test(content)) {
                return 'email';
            }
        }
        
        for (const pattern of this.patterns.promoCodes) {
            if (pattern.test(content)) {
                return 'promo';
            }
        }
        
        for (const pattern of this.patterns.phoneNumbers) {
            if (pattern.test(content)) {
                return 'phone';
            }
        }
        
        return 'text';
    }
    
    // Formater le contenu selon son type
    formatContent(content, type, message = null) {
        if (!content || typeof content !== 'string') {
            return content;
        }
        
        // Gestion spéciale des messages de partage
        if (type === 'page_share' && message) {
            return `<div class="shared-page">
                <div class="share-header">🔗 Page partagée</div>
                <div class="page-title">${message.title || 'Page'}</div>
                <div class="page-url">
                    <a href="${content}" target="_blank">${content}</a>
                    <button class="copy-btn" onclick="copyToClipboard('${content}')">Copier</button>
                </div>
            </div>`;
        }
        
        if (type === 'clipboard_share' && message) {
            const detectedType = message.detectedType || 'text';
            let formattedContent = content;
            
            // Formater selon le type détecté dans le presse-papier
            if (detectedType !== 'text') {
                formattedContent = this.formatMessage(content);
            }
            
            return `<div class="shared-clipboard">
                <div class="share-header">📋 Presse-papier partagé</div>
                <div class="clipboard-content">${formattedContent}</div>
            </div>`;
        }
        
        switch (type) {
            case 'url':
            case 'cdkey':
            case 'email':
            case 'promo':
            case 'phone':
                return this.formatMessage(content);
            default:
                return content;
        }
    }
    
    // Créer des suggestions rapides basées sur le contenu détecté
    createQuickSuggestions(detected) {
        const suggestions = [];
        
        if (detected.cdKeys.length > 0) {
            suggestions.push({
                type: 'cd-key',
                text: `🎮 Partager ${detected.cdKeys.length} clé(s) CD`,
                content: detected.cdKeys.join('\n')
            });
        }
        
        if (detected.urls.length > 0) {
            suggestions.push({
                type: 'url',
                text: `🔗 Partager ${detected.urls.length} lien(s)`,
                content: detected.urls.join('\n')
            });
        }
        
        if (detected.promoCodes.length > 0) {
            suggestions.push({
                type: 'promo',
                text: `🎫 Partager ${detected.promoCodes.length} code(s) promo`,
                content: detected.promoCodes.join('\n')
            });
        }
        
        return suggestions;
    }
}

// Gestionnaire de notifications
class NotificationManager {
    static show(message, type = 'info') {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#667eea'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Gestionnaire de synchronisation amélioré
class SyncManager {
    static async shareToCloud(message) {
        // Simulation d'une API de synchronisation
        // En réalité, vous pourriez utiliser Firebase, Supabase, ou votre propre API
        try {
            // Simuler un délai réseau
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Ici vous pourriez faire un appel à votre API
            console.log('Message partagé vers le cloud:', message);
            
            NotificationManager.show('Message synchronisé avec succès!', 'success');
            return true;
        } catch (error) {
            console.error('Erreur de synchronisation:', error);
            NotificationManager.show('Erreur de synchronisation', 'error');
            return false;
        }
    }
    
    static generateShareCode(message) {
        // Générer un code de partage unique
        const code = Math.random().toString(36).substr(2, 8).toUpperCase();
        
        // Sauvegarder temporairement le message avec ce code
        chrome.storage.local.set({
            [`shareCode_${code}`]: {
                message: message,
                timestamp: Date.now(),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
            }
        });
        
        return code;
    }
    
    static async retrieveByShareCode(code) {
        return new Promise((resolve) => {
            chrome.storage.local.get([`shareCode_${code}`], (result) => {
                const data = result[`shareCode_${code}`];
                if (data && data.expires > Date.now()) {
                    resolve(data.message);
                } else {
                    resolve(null);
                }
            });
        });
    }
}

// Exporter les utilitaires pour utilisation dans popup.js
if (typeof window !== 'undefined') {
    window.ContentDetector = ContentDetector;
    window.NotificationManager = NotificationManager;
    window.SyncManager = SyncManager;
}