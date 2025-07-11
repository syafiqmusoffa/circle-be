"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Seeding data...");
        for (let i = 0; i < 10; i++) {
            const email = faker_1.faker.internet.email();
            const password = "password123";
            const username = faker_1.faker.internet.userName();
            const name = faker_1.faker.person.fullName();
            const user = yield prisma.user.create({
                data: {
                    email,
                    password,
                    profile: {
                        create: {
                            username,
                            name,
                            bio: faker_1.faker.lorem.sentence(),
                            avatarUrl: faker_1.faker.image.avatar(),
                        },
                    },
                },
            });
            for (let j = 0; j < 5; j++) {
                const imageUrl = Math.random() < 0.6 ? faker_1.faker.image.urlPicsumPhotos() : null;
                const post = yield prisma.post.create({
                    data: {
                        authorId: user.id,
                        content: faker_1.faker.lorem.paragraph(),
                        imageUrl,
                    },
                });
                // Add random likes to the post (0–5 likes from random users)
                const numberOfLikes = faker_1.faker.number.int({ min: 0, max: 5 });
                const usersToLike = yield prisma.user.findMany({
                    where: {
                        NOT: {
                            id: user.id,
                        },
                    },
                    take: numberOfLikes,
                });
                for (const liker of usersToLike) {
                    yield prisma.postLike.create({
                        data: {
                            postId: post.id,
                            userId: liker.id,
                        },
                    });
                }
            }
        }
        console.log("Seeding completed.");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
