import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronique' },
      update: {},
      create: {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Appareils électroniques et gadgets',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mode' },
      update: {},
      create: {
        name: 'Mode',
        slug: 'mode',
        description: 'Vêtements et accessoires',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'maison' },
      update: {},
      create: {
        name: 'Maison & Jardin',
        slug: 'maison',
        description: 'Articles pour la maison et le jardin',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sport' },
      update: {},
      create: {
        name: 'Sport & Loisirs',
        slug: 'sport',
        description: 'Équipements sportifs et de loisirs',
      },
    }),
  ]);

  console.log('Created categories:', categories.map(c => c.name));

  // Create sample products
  const products = [
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Le dernier iPhone avec puce A17 Pro et appareil photo professionnel',
      price: 1199.99,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      ],
      categoryId: categories[0].id,
      brand: 'Apple',
      countInStock: 25,
      rating: 4.8,
      numReviews: 156,
      isFeatured: true,
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      description: 'Ordinateur portable ultra-fin avec puce M2 et écran Retina',
      price: 1299.99,
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      ],
      categoryId: categories[0].id,
      brand: 'Apple',
      countInStock: 15,
      rating: 4.9,
      numReviews: 89,
      isFeatured: true,
    },
    {
      name: 'T-shirt Premium Coton',
      slug: 't-shirt-premium-coton',
      description: 'T-shirt en coton biologique de haute qualité, coupe moderne',
      price: 29.99,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500',
      ],
      categoryId: categories[1].id,
      brand: 'EcoWear',
      countInStock: 50,
      rating: 4.5,
      numReviews: 23,
      isFeatured: false,
    },
    {
      name: 'Chaise de Bureau Ergonomique',
      slug: 'chaise-bureau-ergonomique',
      description: 'Chaise de bureau avec support lombaire et accoudoirs réglables',
      price: 249.99,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        'https://images.unsplash.com/photo-1549497538-303791108f95?w=500',
      ],
      categoryId: categories[2].id,
      brand: 'OfficeComfort',
      countInStock: 12,
      rating: 4.3,
      numReviews: 67,
      isFeatured: false,
    },
    {
      name: 'Vélo de Route Carbon',
      slug: 'velo-route-carbon',
      description: 'Vélo de route en carbone avec groupe Shimano 105',
      price: 1899.99,
      images: [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        'https://images.unsplash.com/photo-1544191696-15693072b5a8?w=500',
      ],
      categoryId: categories[3].id,
      brand: 'SpeedCycle',
      countInStock: 8,
      rating: 4.7,
      numReviews: 34,
      isFeatured: true,
    },
    {
      name: 'Casque Audio Sans Fil',
      slug: 'casque-audio-sans-fil',
      description: 'Casque Bluetooth avec réduction de bruit active',
      price: 199.99,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
      ],
      categoryId: categories[0].id,
      brand: 'SoundTech',
      countInStock: 30,
      rating: 4.4,
      numReviews: 112,
      isFeatured: false,
    },
    {
      name: 'Robe d\'Été Florale',
      slug: 'robe-ete-florale',
      description: 'Robe légère avec motifs floraux, parfaite pour l\'été',
      price: 79.99,
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
      ],
      categoryId: categories[1].id,
      brand: 'SummerStyle',
      countInStock: 20,
      rating: 4.2,
      numReviews: 45,
      isFeatured: false,
    },
    {
      name: 'Lampe de Bureau LED',
      slug: 'lampe-bureau-led',
      description: 'Lampe LED avec intensité réglable et port USB',
      price: 59.99,
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500',
      ],
      categoryId: categories[2].id,
      brand: 'LightPro',
      countInStock: 35,
      rating: 4.6,
      numReviews: 78,
      isFeatured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nomah-ai.com' },
    update: {},
    create: {
      email: 'admin@nomah-ai.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 