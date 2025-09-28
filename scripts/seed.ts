import { db } from '../src/lib/db';
import { products } from '../src/lib/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sampleProducts = [
  {
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 delivers visible cushioning under every step.',
    price: '150.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/awjogtdnqxniqqk0wpgf/air-max-270-mens-shoes-KkLcGR.png',
    category: 'Shoes',
    brand: 'Nike',
    size: '10',
    color: 'Black/White',
    stock: 25,
  },
  {
    name: 'Nike Dri-FIT Running Shirt',
    description: 'Stay dry and comfortable with Nike Dri-FIT technology.',
    price: '35.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/16a04d6e-bcaa-4c58-ab0f-0c096d0b7181/dri-fit-miler-mens-running-top-8wbhNR.png',
    category: 'Apparel',
    brand: 'Nike',
    size: 'L',
    color: 'Navy Blue',
    stock: 50,
  },
  {
    name: 'Nike Air Force 1',
    description: 'The classic Nike Air Force 1 with timeless style.',
    price: '110.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-mens-shoes-jBrhbr.png',
    category: 'Shoes',
    brand: 'Nike',
    size: '9',
    color: 'White',
    stock: 30,
  },
  {
    name: 'Nike Pro Shorts',
    description: 'Compression shorts for training and workouts.',
    price: '30.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a195d1b8-466a-4a7d-b2d8-3b5c5c1c5c1c/pro-mens-5-shorts-2XLqhX.png',
    category: 'Apparel',
    brand: 'Nike',
    size: 'M',
    color: 'Black',
    stock: 40,
  },
  {
    name: 'Nike React Infinity Run',
    description: 'Designed to help reduce injury and keep you running.',
    price: '160.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/8439f823-86cf-4086-81d2-4f9ff9a66866/react-infinity-run-flyknit-3-mens-road-running-shoes-QMvLZX.png',
    category: 'Shoes',
    brand: 'Nike',
    size: '11',
    color: 'Grey/Orange',
    stock: 20,
  },
  {
    name: 'Nike Swoosh Sports Bra',
    description: 'Medium-support sports bra for training.',
    price: '25.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a195d1b8-466a-4a7d-b2d8-3b5c5c1c5c1c/swoosh-womens-medium-support-sports-bra-2XLqhX.png',
    category: 'Apparel',
    brand: 'Nike',
    size: 'S',
    color: 'Pink',
    stock: 35,
  },
];

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Insert sample products
    await db.insert(products).values(sampleProducts);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();