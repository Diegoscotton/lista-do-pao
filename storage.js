/**
 * Gerenciamento de persistência local (IndexedDB) e Estado Global
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:40
 */

const DB_NAME = 'SmartMarketListDB';
const DB_VERSION = 1;
const STORE_NAME = 'lists';
const HISTORY_STORE = 'history';

class LocalStorage {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => reject('Erro ao abrir IndexedDB');
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(HISTORY_STORE)) {
                    db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
                }
            };
        });
    }

    async saveList(listId, items) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ id: listId, items, updatedAt: Date.now() });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    }

    async getList(listId) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(listId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(null);
        });
    }

    async saveHistory(listId, history) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([HISTORY_STORE], 'readwrite');
            const store = transaction.objectStore(HISTORY_STORE);
            const request = store.put({ id: listId, items: history });
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    }

    async getHistory(listId) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([HISTORY_STORE], 'readonly');
            const store = transaction.objectStore(HISTORY_STORE);
            const request = store.get(listId);
            request.onsuccess = () => resolve(request.result ? request.result.items : []);
            request.onerror = () => reject([]);
        });
    }
}

const storage = new LocalStorage();
window.appStorage = storage;
