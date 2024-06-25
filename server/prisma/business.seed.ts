// seed script for business profiles
// required info
// country: Canada, stateAndProvince: Ontario, city: Toronto
// country: Germany, stateAndProvince: Berlin, city: Berlin
// country: United States, stateAndProvince: California, city: Los Angeles
// country: United Kingdom, stateAndProvince: England, city: London
// United kingdom, stateAndProvince: England, city: Manchester

import { BUSINESS_CATEGORIES } from './seed.data.ts/category';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supportedLocations = [
  {
    country: 'Canada',
    stateAndProvince: 'Ontario',
    city: 'Toronto',
  },
  {
    country: 'Germany',
    stateAndProvince: 'Berlin',
    city: 'Berlin',
  },
  {
    country: 'United States',
    stateAndProvince: 'California',
    city: 'Los Angeles',
  },
  {
    country: 'United Kingdom',
    stateAndProvince: 'England',
    city: 'London',
  },
  {
    country: 'United Kingdom',
    stateAndProvince: 'England',
    city: 'Manchester',
  },
];

const randomMail = () => {
  const char = 'abcdefghijklmnopqrstuvwxyz0987654321'.split('');
  let email = '';
  for (let i = 0; i < 5; i++) {
    const rand = Math.floor(Math.random() * char.length) + 1;
    email += char[rand];
  }
  const domain = '@biz.com';
  return `${email}${domain}`;
};

const randomDays = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const rand = Math.floor(Math.random() * days.length);
  return days.slice(0, rand);
};

const selectRandomCatories = (cat: { uuid: string; description: string }[]) => {
  const category = cat[Math.floor(Math.random() * cat.length)];
  return category;
};

const randomName = () => {
  // return first and last name randomly
  const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

(async () => {
  // run the seed script
  // update this userId to the user you want to associate the business profiles with
  const userId = '02ddd4cf-5077-4d45-a8c6-8102caef7989';

  try {
    // delete all business profiles
    // await prisma.business_profiles.deleteMany();

    for (let i = 0; i < 50; i++) {
      const busCat = selectRandomCatories(BUSINESS_CATEGORIES).uuid;
      const location = supportedLocations[Math.floor(Math.random() * supportedLocations.length)];

      await prisma.business_profiles.create({
        data: {
          name: randomName(),
          description: 'Business Description',
          businessCategoryUuid: busCat,
          country: location.country,
          stateAndProvince: location.stateAndProvince,
          city: location.city,
          street: '123 Main St',
          postalCode: 'M1M 1M1',
          phoneNumber: '123-456-7890',
          businessEmail: randomMail(),
          openTime: '08:00',
          closeTime: '17:00',
          daysOfOperation: randomDays(),
          websiteUrl: 'https://www.business.com',
          linkedinUrl: 'https://www.linkedin.com/business',
          instagramUrl: 'https://www.instagram.com/business',
          twitterUrl: 'https://www.twitter.com/business',
          facebookUrl: 'https://www.facebook.com/business',
          logoUrl: `BizConnect/Logo/02ddd4cf-5077-4d45-a8c6-8102caef7989/ddopblklce7i8shesqhj`,
          userUuid: userId,
        },
      });
    }
    console.log('Business profiles seeded successfully');
  } catch (e: any) {
    console.log(`Error running businesss profile seed script: ${e.message}`);
  }
})();
