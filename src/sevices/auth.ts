import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";


export async function loginUser(identifier: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { profile: { username: identifier } }],
    },
    include: { profile: true }
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Wrong password");

  const token = signToken({ id: user.id });
  return { token };
}

