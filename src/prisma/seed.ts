// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  for (let i = 0; i < 10; i++) {
    const email = faker.internet.email();
    const password = "password123";
    const username = faker.internet.userName();
    const name = faker.person.fullName();

    const user = await prisma.user.create({
      data: {
        email,
        password,
        profile: {
          create: {
            username,
            name,
            bio: faker.lorem.sentence(),
            avatarUrl: faker.image.avatar(),
          },
        },
      },
    });

    for (let j = 0; j < 5; j++) {
      const imageUrl =
        Math.random() < 0.6 ? faker.image.urlPicsumPhotos() : null;

      const post = await prisma.post.create({
        data: {
          authorId: user.id,
          content: faker.lorem.paragraph(),
          imageUrl,
        },
      });

      // Add random likes to the post (0–5 likes from random users)
      const numberOfLikes = faker.number.int({ min: 0, max: 5 });
      const usersToLike = await prisma.user.findMany({
        where: {
          NOT: {
            id: user.id,
          },
        },
        take: numberOfLikes,
      });

      for (const liker of usersToLike) {
        await prisma.postLike.create({
          data: {
            postId: post.id,
            userId: liker.id,
          },
        });
      }
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
