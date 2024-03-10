import { BUSINESS_CATEGORIES } from "./seed.data.ts/category";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    const createdBusinessCategories = await prisma.business_categories.createMany({
        data: BUSINESS_CATEGORIES,
    });

    console.log('Seeded businessCategories:', createdBusinessCategories);

  } catch (error) {
    console.error(error);
    // process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();