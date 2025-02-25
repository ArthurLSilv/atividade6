
const express = require('express');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); 

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'minhachave', 
    resave: false, 
    saveUninitialized: true  
}));

const users = {
    arthur: '123',
    giovane: '321',
};

// produtos
const produtos = [
    { id: 1, nome: 'Sabonete', preco: 3.39 },
    { id: 2, nome: 'Arroz', preco: 5.99 },
    { id: 3, nome: 'Cerveja', preco: 4.59 },
    { id: 4, nome: 'Refrigerante', preco: 7.99 },
    { id: 5, nome: 'Detergente', preco: 4.69 },
];

const PORT = 8080;

//Rota principal
app.get('/', (req, res) => {
    res.send('<h1>Bem-vindo ao Carrinho de Compras</h1><a href="/login">Login</a> | <a href="/protected">Área Protegida</a>');
});

//Rota de login
app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Usuário" required>
            <input type="password" name="password" placeholder="Senha" required>
            <button type="submit">Login</button>
        </form>
    `);
});

//Lógica de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
        req.session.user = username; 
        res.redirect('/protected');
    } else {
        res.send('Usuário ou senha inválidos. <a href="/login">Tente novamente</a>');
    }
});

// Rota de logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/protected');
        }
        res.redirect('/');
    });
});

//Middleware de autenticação
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

//Rota protegida
app.get('/protected', isAuthenticated, (req, res) => {
    res.send(`<h1>Área Protegida</h1><p>Bem-vindo, ${req.session.user}!</p><a href="/produtos">Produtos</a><br><a href="/logout">Logout</a>`);
});



//Rota de produtos
app.get('/produtos', (req, res) => {
    res.send(`
        <h1>Lista de Produtos</h1>
        <ul>
            ${produtos.map((produto) => `
                <li>${produto.nome} - R$${produto.preco} <a href="/adicionar/${produto.id}">Adicionar ao Carrinho</a></li>
            `).join('')}
        </ul>
        <a href="/carrinho">Ver Carrinho</a><br>
        <a href="/protected">Voltar</a>
    `);
});

//Rota de adicionar produto
app.get('/adicionar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produto = produtos.find((p) => p.id === id);

    if (produto) {
        if (!req.session.carrinho) {
            req.session.carrinho = [];
        }
        req.session.carrinho.push(produto);
    }

    res.redirect('/produtos');
});

//Rota do carrinho
app.get('/carrinho', (req, res) => {
    const carrinho = req.session.carrinho || [];

    res.send(`
        <h1>Carrinho</h1>
        <ul>
            ${carrinho.map((produto) => `
                <li>${produto.nome} - R$${produto.preco}</li>
            `).join('')}
        </ul>
        <a href="/produtos">Continuar Comprando</a>
    `);
});

//Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
