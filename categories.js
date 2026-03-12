/**
 * Lógica de categorias inteligentes e utilitários de itens
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:45
 */

const CATEGORY_MAP = {
    'leite': 'Laticínios',
    'queijo': 'Laticínios',
    'manteiga': 'Laticínios',
    'pão': 'Padaria',
    'bolo': 'Padaria',
    'maçã': 'Hortifruti',
    'banana': 'Hortifruti',
    'tomate': 'Hortifruti',
    'alface': 'Hortifruti',
    'carne': 'Açougue',
    'frango': 'Açougue',
    'arroz': 'Mercearia',
    'feijão': 'Mercearia',
    'macarrão': 'Mercearia',
    'cerveja': 'Bebidas',
    'refrigerante': 'Bebidas',
    'água': 'Bebidas',
    'sabão': 'Limpeza',
    'detergente': 'Limpeza',
    'shampoo': 'Higiene',
    'papel higiênico': 'Higiene'
};

const CATEGORIES = {
    detect(itemName) {
        const name = itemName.toLowerCase();
        for (const [key, category] of Object.entries(CATEGORY_MAP)) {
            if (name.includes(key)) return category;
        }
        return 'Outros';
    },

    isDuplicate(items, name) {
        return items.some(item => 
            item.name.toLowerCase().trim() === name.toLowerCase().trim() && !item.purchased
        );
    }
};

window.appCategories = CATEGORIES;
