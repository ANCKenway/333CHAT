// Test rapide pour vérifier l'affichage des expéditeurs

// Simuler quelques messages avec différents expéditeurs
const testMessages = [
    {
        id: '1',
        content: 'Salut ! Comment ça va ?',
        sender: 'me',
        timestamp: new Date().toISOString(),
        type: 'text'
    },
    {
        id: '2', 
        content: 'Ça va bien ! Et toi ?',
        sender: 'Alice',
        timestamp: new Date().toISOString(),
        type: 'text'
    },
    {
        id: '3',
        content: 'Regardez ce lien : https://example.com',
        sender: 'Bob',
        timestamp: new Date().toISOString(),
        type: 'link'
    },
    {
        id: '4',
        content: 'Merci pour le lien !',
        sender: 'me',
        timestamp: new Date().toISOString(),
        type: 'text'
    }
];

console.log('Messages de test avec expéditeurs :');
testMessages.forEach(msg => {
    console.log(`${msg.sender}: ${msg.content}`);
});

// Test CSS pour l'affichage des expéditeurs
console.log(`
Styles CSS appliqués :
- Messages de "me" : Badge violet "Vous"
- Messages d'autres : Badge bleu avec le nom
- Fond coloré pour distinguer les expéditeurs
`);