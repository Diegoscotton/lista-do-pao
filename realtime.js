/**
 * Sincronização em Tempo Real via WebSocket
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:42
 */

class RealTimeManager {
    constructor() {
        this.socket = null;
        this.listId = this.getListIdFromURL();
        this.onUpdateCallback = null;
    }

    getListIdFromURL() {
        const path = window.location.pathname;
        const matches = path.match(/\/list\/([a-zA-Z0-9-]+)/);
        return matches ? matches[1] : 'default-list';
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        this.socket = new WebSocket(`${protocol}//${host}`);

        this.socket.onopen = () => {
            console.log('✅ Conectado ao servidor de sincronização');
            this.socket.send(JSON.stringify({
                type: 'join',
                listId: this.listId
            }));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.onUpdateCallback) {
                this.onUpdateCallback(data);
            }
        };

        this.socket.onclose = () => {
            console.log('❌ Conexão perdida. Tentando reconnect em 5s...');
            setTimeout(() => this.connect(), 5000);
        };
    }

    sendUpdate(items) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'update',
                listId: this.listId,
                items: items
            }));
        }
    }

    onUpdate(callback) {
        this.onUpdateCallback = callback;
    }
}

const realtime = new RealTimeManager();
window.appRealtime = realtime;
