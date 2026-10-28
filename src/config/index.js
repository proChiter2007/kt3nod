require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

module.exports = {
  serverPort: process.env.PORT || 3000,
  db
};