const router = require('express').Router();
const Joi = require('joi');
const { db } = require('../config');
const validate = require('../middleware/validate');

const postCreateSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().allow('', null).optional(),
  published: Joi.boolean().default(false),
  authorId: Joi.number().integer().required(),
  tags: Joi.array().items(Joi.string()).default([])
});

router.get('/', async (req, res, next) => {
  try {
    const { search, published, authorId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filters = {};
    if (search) filters.title = { contains: search };
    if (published !== undefined) filters.published = published === 'true';
    if (authorId) filters.authorId = Number(authorId);

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: filters,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { author: true, tags: true }
      }),
      db.post.count({ where: filters })
    ]);

    res.json({
      data: posts,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await db.post.findUnique({
      where: { id: Number(req.params.id) },
      include: { author: true, tags: true }
    });
    if (!post) throw { status: 404, message: 'Пост не найден' };
    res.json(post);
  } catch (e) { next(e); }
});

router.post('/', validate(postCreateSchema), async (req, res, next) => {
  try {
    const { title, content, published, authorId, tags } = req.body;

    const tagConnections = tags.map(tagName => ({
      where: { name: tagName },
      create: { name: tagName }
    }));

    const newPost = await db.post.create({
      data: {
        title,
        content,
        published,
        authorId,
        tags: {
          connectOrCreate: tagConnections 
        }
      },
      include: { author: true, tags: true }
    });

    res.status(201).json(newPost);
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updated = await db.post.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { author: true, tags: true }
    });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.post.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;