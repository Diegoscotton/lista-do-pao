/**
 * Lógica de WebSocket para sincronização em tempo real
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:27
 */
const WebSocket = require('ws');
const { getList, saveList } = require('./lists');

function setupWS(server) {
    const wss = new WebSocket.Server({ server });

    // Armazena as conexões por listId
    const rooms = new Map();

    wss.on('connection', (ws) => {
        let currentListId = null;

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'join') {
                    currentListId = data.listId;
                    if (!rooms.has(currentListId)) {
                        rooms.set(currentListId, new Set());
                    }
                    rooms.get(currentListId).add(ws);
                    
                    // Notificar todos sobre o novo usuário
                    broadcastPresence(currentListId);

                    // Enviar estado atual da lista ao ingressar
                    const listData = await getList(currentListId);
                    if (listData) {
                        ws.send(JSON.stringify({ type: 'init', items: listData.items }));
                    }
                }

                if (data.type === 'update') {
                    if (!currentListId) return;
                    
                    // Salvar no servidor
                    await saveList(currentListId, { items: data.items });

                    // Propagar para outros usuários na mesma sala
                    const clients = rooms.get(currentListId);
                    if (clients) {
                        clients.forEach(client => {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'update', items: data.items }));
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Erro no processamento de mensagem WS:', err);
            }
        });

        ws.on('close', () => {
            if (currentListId && rooms.has(currentListId)) {
                rooms.get(currentListId).delete(ws);
                broadcastPresence(currentListId);
                if (rooms.get(currentListId).size === 0) {
                    rooms.delete(currentListId);
                }
            }
        });
    });

    function broadcastPresence(listId) {
        const clients = rooms.get(listId);
        if (clients) {
            const count = clients.size;
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'presence', count }));
                }
            });
        }
    }

    console.log('✅ WebSocket Server configurado.');
}

module.exports = setupWS;
