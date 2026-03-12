/**
 * Registro de Service Worker para PWA
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:53
 */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ ServiceWorker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Falha ao registrar ServiceWorker:', error);
            });
    });
}
