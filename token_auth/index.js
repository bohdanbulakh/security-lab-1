const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const SESSION_KEY = 'Authorization';
const SECURITY_KEY = '2439hsfdkDe6rjyfhyikh,667fgvflyivh';

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    },
];

app.use((req, res, next) => {
    const bearer = req.get(SESSION_KEY);
    req.user = {};

    try {
        const token = /^Bearer\s+(.+)$/i.exec(bearer)?.[1];
        req.user = jwt.verify(token, SECURITY_KEY, {algorithms: ['HS256']});
    } catch (err) {
    }

    next();
});

app.get('/', (req, res) => {
    if (req.user.username) {
        return res.json({
            username: req.user.username,
            logout: 'http://localhost:3000/logout',
        });
    }
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
    delete req.user;
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const {login, password} = req.body ?? {};

    const user = users.find((user) => user.login == login && user.password == password);

    if (user) {
        const payload = {
            login: user.login,
            username: user.username,
        };
        const token = jwt.sign(payload, SECURITY_KEY, {expiresIn: '1h', algorithm: 'HS256'});

        return res.json({token});
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
