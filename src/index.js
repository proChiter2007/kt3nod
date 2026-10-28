const express = require('express');
const { serverPort } = require('./config');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);


app.use((req, res) => res.status(404).json({ error: 'Маршрут не найден' }));

app.use(errorHandler);

app.listen(serverPort, () => {
  console.log(`Сервер запущен: http://localhost:${serverPort}`);
});