import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const newProducts = Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    return {
      name: `AutoGen Product ${id + 1000}`, // ensures no name duplication
      price: parseFloat((Math.random() * 100).toFixed(2)), // $0.00 – $100.00
      stock: 10 + Math.floor(Math.random() * 200), // 10 – 210
      holding: Math.floor(Math.random() * 10), // 0 – 9
    };
  });

  await prisma.product.createMany({
    data: newProducts,
    skipDuplicates: true,
  });

  console.log('✅ Seeded 100 more products.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
  })
  .finally(() => prisma.$disconnect());
