/**
 * Gerenciamento de persistência de listas em JSON
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:25
 */
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'lists');

async function ensureDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        console.error('Erro ao criar diretório de dados:', err);
    }
}

async function getList(listId) {
    const filePath = path.join(DATA_DIR, `${listId}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return null;
    }
}

async function saveList(listId, data) {
    await ensureDir();
    const filePath = path.join(DATA_DIR, `${listId}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Erro ao salvar lista ${listId}:`, err);
        return false;
    }
}

module.exports = { getList, saveList };
