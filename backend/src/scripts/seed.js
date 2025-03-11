const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function seed() {
  const users = [
    { email: 'guest@example.com', password: 'password123', role: 'guest' },
    { email: 'user@example.com', password: 'password123', role: 'user' },
    { email: 'premium@example.com', password: 'password123', role: 'premium' },
    { email: 'admin@example.com', password: 'password123', role: 'admin' },
  ];

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role },
      create: {
        id: randomUUID(),
        email: user.email,
        password_hash: passwordHash,
        role: user.role,
      },
    });
    console.log(`Seeded ${user.role} user: ${user.email}`);
  }

  await prisma.$disconnect();
}

seed().catch(console.error);