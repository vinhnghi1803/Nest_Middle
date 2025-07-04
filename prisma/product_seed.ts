import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = [
    'Whole Milk',
    'Skim Milk',
    'Almond Milk',
    'Soy Milk',
    'Oat Milk',
    'Brown Bread',
    'White Bread',
    'Multigrain Bread',
    'Baguette',
    'Bagels',
    'Fresh Carrots',
    'Organic Carrots',
    'Sweet Potatoes',
    'Red Potatoes',
    'Yukon Potatoes',
    'Organic Broccoli',
    'Cauliflower',
    'Spinach',
    'Kale',
    'Lettuce',
    'Free-Range Eggs',
    'Egg Substitute',
    'Salted Butter',
    'Unsalted Butter',
    'Margarine',
    'Rice 5kg Bag',
    'Basmati Rice',
    'Jasmine Rice',
    'Brown Rice',
    'Sticky Rice',
    'Cooking Oil 1L',
    'Olive Oil',
    'Sunflower Oil',
    'Canola Oil',
    'Vegetable Oil',
    'Sugar 1kg',
    'Brown Sugar',
    'Powdered Sugar',
    'Coconut Sugar',
    'Stevia',
    'Salt 500g',
    'Sea Salt',
    'Himalayan Pink Salt',
    'Iodized Salt',
    'Rock Salt',
    'Yogurt (Plain)',
    'Greek Yogurt',
    'Strawberry Yogurt',
    'Blueberry Yogurt',
    'Mango Yogurt',
  ];

  const data = products.map((name) => ({
    name,
    price: (1 + Math.random() * 100).toFixed(2), // price between 1.00 and 101.00
    stock: 20 + Math.floor(Math.random() * 100), // stock between 20–120
    holding: Math.floor(Math.random() * 10), // holding between 0–9
  }));

  await prisma.product.createMany({
    data,
    skipDuplicates: true, // avoid error on rerun
  });

  console.log(`✅ Seeded ${data.length} products.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
