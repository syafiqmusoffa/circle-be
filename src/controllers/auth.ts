import { Request, Response } from "express";
import { loginSchema, registerSchema, resetSchema } from "../validations/auth";
import bcrypt from "bcrypt";
import { loginUser } from "../sevices/auth";
import { transporter } from "../utils/transporter";
import crypto from "crypto";
import {prisma} from "../prisma/client"
export async function handleRegister(req: Request, res: Response) {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const rawEmail = req.body.email || "";
    const rawUsername = req.body.username || "";
    const password = req.body.password;

    const email = rawEmail.toLowerCase().trim();
    const username = rawUsername.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      res.status(400).json({ error: "Email sudah digunakan" });
      return;
    }

    const userName = await prisma.profile.findUnique({
      where: { username },
    });

    if (userName) {
      res.status(400).json({ error: "Username sudah digunakan" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashed,
        profile: {
          create: {
            username,
          },
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            username: true,
          },
        },
      },
    });

    res.status(201).json({ message: `${username} registered`, user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to add user" });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { password } = req.body;
    const email = req.body.email?.toLowerCase();

    const result = await loginUser(email, password);
    
    res.status(200).json({ message: "Login success", ...result });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
}

export const getMe = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const id = user.id;
  const foundUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!foundUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(foundUser);
};


export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) res.status(404).json({ message: "User not found" });
  const id = user?.id;
  const token = crypto.randomBytes(32).toString("hex");
  const exp = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  await prisma.user.update({
    where: { id },
    data: { resetToken: token, resetTokenExp: exp },
  });
  const baseUrl = process.env.BASE_URL;
  const link = `${baseUrl}/reset?token=${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Reset Password",
    html: `<p>Klik link berikut untuk reset password: <a href="${link}">Reset</a></p>`,
  });

  res.json({ message: "Link reset terkirim ke email" });
};

export const resetPassword = async (req:Request, res:Response) => {
  const { token, newPassword, confirmPassword} = req.body;
  const { error } = resetSchema.validate({newPassword, confirmPassword});
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gte: new Date() },
    },
  });
  const id = user?.id;
  if (!user)
    res.status(400).json({ message: "Token invalid atau expired" });

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  res.json({ message: "Password berhasil direset" });
};