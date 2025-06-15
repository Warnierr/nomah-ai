import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned database...');

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'USER',
    },
  });

  console.log('Created test user:', testUser.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'T-Shirts',
        slug: 't-shirts',
        image: '/images/c-tshirts.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jeans',
        slug: 'jeans',
        image: '/images/c-jeans.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Shoes',
        slug: 'shoes',
        image: '/images/c-shoes.jpg',
      },
    }),
  ]);

  console.log('Created categories:', categories.map(c => c.name));

  // Create products
  const products = await Promise.all([
    // T-Shirts (p11 and p12 images)
    prisma.product.create({
      data: {
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-t-shirt',
        description: 'Comfortable classic cotton t-shirt perfect for everyday wear',
        price: 29.99,
        images: ['/images/p11-1.jpg', '/images/p11-2.jpg'],
        categoryId: categories[0].id,
        brand: 'Nike',
        countInStock: 20,
        rating: 4.5,
        numReviews: 10,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Premium Sport T-Shirt',
        slug: 'premium-sport-t-shirt',
        description: 'High-performance sport t-shirt with moisture-wicking technology',
        price: 39.99,
        images: ['/images/p12-1.jpg', '/images/p12-2.jpg'],
        categoryId: categories[0].id,
        brand: 'Adidas',
        countInStock: 15,
        rating: 4.8,
        numReviews: 12,
      },
    }),

    // Jeans (p21 and p22 images)
    prisma.product.create({
      data: {
        name: 'Classic Fit Jeans',
        slug: 'classic-fit-jeans',
        description: 'Comfortable classic fit jeans for everyday wear',
        price: 59.99,
        images: ['/images/p21-1.jpg', '/images/p21-2.jpg'],
        categoryId: categories[1].id,
        brand: 'Levi\'s',
        countInStock: 25,
        rating: 4.6,
        numReviews: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Slim Fit Jeans',
        slug: 'slim-fit-jeans',
        description: 'Modern slim fit jeans with stretch comfort',
        price: 69.99,
        images: ['/images/p22-1.jpg', '/images/p22-2.jpg'],
        categoryId: categories[1].id,
        brand: 'Calvin Klein',
        countInStock: 18,
        rating: 4.7,
        numReviews: 8,
      },
    }),

    // Shoes (p31 and p32 images)
    prisma.product.create({
      data: {
        name: 'Running Shoes',
        slug: 'running-shoes',
        description: 'Professional running shoes with advanced cushioning',
        price: 129.99,
        images: ['/images/p31-1.jpg', '/images/p31-2.jpg'],
        categoryId: categories[2].id,
        brand: 'Nike',
        countInStock: 12,
        rating: 4.9,
        numReviews: 20,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Casual Sneakers',
        slug: 'casual-sneakers',
        description: 'Stylish and comfortable casual sneakers',
        price: 89.99,
        images: ['/images/p32-1.jpg', '/images/p32-2.jpg'],
        categoryId: categories[2].id,
        brand: 'Adidas',
        countInStock: 22,
        rating: 4.4,
        numReviews: 14,
      },
    }),
  ]);

  console.log('Created products:', products.map(p => p.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 