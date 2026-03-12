/**
 * Servidor Principal Node.js - Smart Market List
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 11/03/2026 11:30
 */
const express = require('express');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const compression = require('compression');
const setupWS = require('./ws');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Otimização de Performance
app.use(compression());

// Otimização de Segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            "font-src": ["'self'", "fonts.gstatic.com"],
        },
    },
}));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Redireciona raiz para uma nova lista única
app.get('/', (req, res) => {
    res.redirect(`/list/${uuidv4()}`);
});

// Rota amigável para listas: /list/uuid
app.get('/list/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Inicializa WebSocket
setupWS(server);

server.listen(PORT, () => {
    console.log(`🚀 Smart Market List rodando em http://localhost:${PORT}`);
});
