import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const user1 = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      password: '123456',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'bob',
      email: 'bob@example.com',
      role: 'user',
      password: '123456',
    },
  });

  // Create Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Keyboard',
      price: 49.99,
      stock: 10,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Mouse',
      price: 29.99,
      stock: 20,
    },
  });

  // Create Orders for user1
  const order1 = await prisma.order.create({
    data: {
      userId: user2.id,
      orderItems: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            total: product1.price,
          },
          {
            productId: product2.id,
            quantity: 2,
            total: product2.price.mul(2),
          },
        ],
      },
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
