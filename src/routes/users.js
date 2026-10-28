const router = require('express').Router();
const Joi = require('joi');
const { db } = require('../config');
const validate = require('../middleware/validate');

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  return { page, limit, skip: (page - 1) * limit };
};

const userCreateSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный формат email',
    'any.required': 'Поле email обязательно'
  }),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('USER', 'ADMIN').default('USER')
});

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [users, total] = await Promise.all([
      db.user.findMany({ skip, take: limit }),
      db.user.count()
    ]);
    res.json({ data: users, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await db.user.findUnique({
      where: { id: Number(req.params.id) },
      include: { posts: { orderBy: { createdAt: 'desc' } } }
    });
    if (!user) throw { status: 404, message: 'Пользователь не найден' };
    res.json(user);
  } catch (e) { next(e); }
});

router.post('/', validate(userCreateSchema), async (req, res, next) => {
  try {
    const newUser = await db.user.create({ data: req.body });
    res.status(201).json(newUser);
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await db.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;