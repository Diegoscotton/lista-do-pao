/**
 * Gerenciamento de Status de Conectividade
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:52
 */

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const statusDiv = document.getElementById('offline-status');
    if (navigator.onLine) {
        document.body.classList.remove('offline');
        console.log('🌐 Online');
    } else {
        document.body.classList.add('offline');
        console.log('🔌 Offline');
    }
}

// Inicializa status
updateOnlineStatus();
