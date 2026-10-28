module.exports = (err, req, res, next) => {
  console.error(`[API Error] ${req.method} ${req.url} - ${err.message}`);

  switch (err.code) {
    case 'P2002':
      return res.status(409).json({ error: 'Конфликт: запись с такими уникальными данными уже существует' });
    case 'P2025':
      return res.status(404).json({ error: 'Запрашиваемая запись не найдена' });
        case 'P2003':
      return res.status(400).json({ error: 'Ошибка связи: такого пользователя не существует' });
    default:
      res.status(err.status || 500).json({ error: err.message || 'Внутренняя ошибка сервера' });
  }
};