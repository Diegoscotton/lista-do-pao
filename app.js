/**
 * Controlador Principal do Frontend - Lista do pão
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 12/03/2026 09:30
 */

document.addEventListener('DOMContentLoaded', async () => {
    const listId = window.appRealtime.listId;
    const toastContainer = document.getElementById('toast-container');
    
    let state = {
        items: [],
        history: []
    };

    // DOM Elements
    const addBtn = document.getElementById('add-btn');
    const itemNameInput = document.getElementById('item-name');
    const itemQtyInput = document.getElementById('item-qty');
    const pendingList = document.getElementById('pending-list');
    const purchasedList = document.getElementById('purchased-list');
    const shareBtn = document.getElementById('share-btn');
    const historyBtn = document.getElementById('history-btn');
    const clearListBtn = document.getElementById('clear-list-btn');
    const suggestionsBubbles = document.getElementById('suggestions-bubbles');
    const presenceBadge = document.getElementById('presence-count');

    // Modals
    const shareModal = document.getElementById('share-modal');
    const historyModal = document.getElementById('history-modal');
    const closeShareBtn = document.querySelector('.close-share-modal');
    const closeHistoryBtn = document.querySelector('.close-modal');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const qrCanvas = document.getElementById('qr-canvas');
    const historyContent = document.getElementById('history-content');

    // Inicialização
    await window.appStorage.init();
    const localData = await window.appStorage.getList(listId);
    if (localData) {
        state.items = localData.items;
        render();
    }
    loadHistory();

    window.appRealtime.connect();

    // Eventos
    addBtn.onclick = addItem;
    itemNameInput.onkeypress = (e) => { if (e.key === 'Enter') addItem(); };

    function addItem() {
        const name = itemNameInput.value.trim();
        const qty = parseInt(itemQtyInput.value) || 1;

        if (name) {
            if (window.appCategories.isDuplicate(state.items, name)) {
                showToast('Este item já está na lista!', 'error');
                return;
            }

            const newItem = {
                id: Date.now().toString(),
                name,
                qty,
                category: window.appCategories.detect(name),
                purchased: false,
                createdAt: Date.now()
            };

            state.items.unshift(newItem);
            updateAll();
            
            itemNameInput.value = '';
            itemQtyInput.value = '1';
            itemNameInput.focus();
            showToast('Item adicionado!');
        }
    }

    clearListBtn.onclick = () => {
        if (confirm('Tem certeza que deseja limpar toda a lista?')) {
            state.items = [];
            updateAll();
            showToast('Lista limpa!');
        }
    };

    shareBtn.onclick = () => {
        new QRious({
            element: qrCanvas,
            value: window.location.href,
            size: 200,
            padding: 10
        });
        shareModal.classList.remove('hidden');
    };

    historyBtn.onclick = async () => {
        await loadHistory();
        renderHistory();
        historyModal.classList.remove('hidden');
    };

    closeShareBtn.onclick = () => shareModal.classList.add('hidden');
    closeHistoryBtn.onclick = () => historyModal.classList.add('hidden');

    copyLinkBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copiado!');
    };

    // Sincronização
    window.appRealtime.onUpdate((data) => {
        if (data.type === 'init' || data.type === 'update') {
            state.items = data.items;
            render();
            window.appStorage.saveList(listId, state.items);
        }
        if (data.type === 'presence') {
            updatePresenceDisplay(data.count);
        }
    });

    function updatePresenceDisplay(count) {
        if (count > 1) {
            presenceBadge.textContent = `${count} online`;
            presenceBadge.classList.remove('hidden');
        } else {
            presenceBadge.classList.add('hidden');
        }
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    function updateAll() {
        render();
        window.appRealtime.sendUpdate(state.items);
        window.appStorage.saveList(listId, state.items);
    }

    function render() {
        pendingList.innerHTML = '';
        purchasedList.innerHTML = '';

        state.items.forEach(item => {
            const li = createItemElement(item);
            if (item.purchased) {
                purchasedList.appendChild(li);
            } else {
                pendingList.appendChild(li);
            }
        });

        renderSuggestions();
    }

    function createItemElement(item) {
        const li = document.createElement('li');
        li.className = `item-row ${item.purchased ? 'purchased' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="checkbox-custom" ${item.purchased ? 'checked' : ''}>
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-category">${item.category}</span>
            </div>
            <div class="item-meta">
                <span class="qty-label">x${item.qty}</span>
                <button class="btn-delete">✕</button>
            </div>
        `;

        li.querySelector('.checkbox-custom').onchange = async () => {
            item.purchased = !item.purchased;
            if (item.purchased) await addToHistory(item);
            updateAll();
        };

        li.querySelector('.btn-delete').onclick = () => {
            state.items = state.items.filter(i => i.id !== item.id);
            updateAll();
            showToast(`${item.name} removido.`);
        };

        return li;
    }

    function renderSuggestions() {
        const commonItems = ['Leite', 'Pão', 'Ovos', 'Banana', 'Café', 'Arroz', 'Feijão'];
        suggestionsBubbles.innerHTML = '';
        commonItems.forEach(name => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.textContent = name;
            bubble.onclick = () => {
                itemNameInput.value = name;
                addItem();
            };
            suggestionsBubbles.appendChild(bubble);
        });
    }

    async function loadHistory() {
        const historyData = await window.appStorage.getHistory(listId);
        state.history = historyData || [];
    }

    async function addToHistory(item) {
        const historyItem = { ...item, purchasedAt: Date.now() };
        state.history.push(historyItem);
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        state.history = state.history.filter(i => i.purchasedAt > oneWeekAgo);
        await window.appStorage.saveHistory(listId, state.history);
    }

    function renderHistory() {
        if (state.history.length === 0) {
            historyContent.innerHTML = '<p style="color:#8E959F">Nenhuma compra esta semana.</p>';
            return;
        }
        const groups = state.history.reduce((acc, item) => {
            const date = new Date(item.purchasedAt).toLocaleDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(item);
            return acc;
        }, {});
        let html = '';
        for (const [date, items] of Object.entries(groups).reverse()) {
            html += `<div style="margin-bottom:16px; text-align:left">
                <h4 style="font-size:0.8rem; color:#8E959F; border-bottom:1px solid #eee; padding-bottom:4px">${date}</h4>
                <ul style="list-style:none; padding:8px 0">
                    ${items.map(i => `<li style="font-size:0.9rem; padding:2px 0">${i.name} (x${i.qty})</li>`).join('')}
                </ul>
            </div>`;
        }
        historyContent.innerHTML = html;
    }
});
