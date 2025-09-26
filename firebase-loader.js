// Firebase est maintenant chargé localement, plus besoin de loader dynamique
class FirebaseLoader {
    static async loadFirebase() {
        // Attendre que Firebase soit disponible
        let attempts = 0;
        while (!window.firebase && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.firebase) {
            console.log('✅ Firebase chargé depuis les fichiers locaux');
            console.log('🔥 Firebase apps disponibles:', window.firebase.apps?.length || 0);
            return true;
        } else {
            console.error('❌ Firebase non disponible après 1 seconde d\'attente');
            throw new Error('Firebase non chargé - vérifiez les fichiers firebase-*.js');
        }
    }
    

}