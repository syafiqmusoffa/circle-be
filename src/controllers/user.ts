import { Request, Response } from "express";
import { prisma}  from "../prisma/client";
import bcrypt from "bcrypt";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const loggedId = user?.id;
    if (!loggedId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const users = await prisma.user.findMany({
      where: {
        id: { not: loggedId },
      },omit:{password:true},
      include: { profile: { omit: { id: true } } },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const editEmailUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { email } = req.body;
    await prisma.user.update({
      where: { id },
      data: { email },
    });
    res.status(200).json({ message: `User updated successfully ${email}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update User" });
  }
};
export const editPasswordUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
    res.status(200).json({ message: `User updated successfully ${password}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update User" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: `user deleted` });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete User` });
  }
};


export const getSuggestedUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user;
    const userId = currentUserId?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    const suggested = await prisma.user.findMany({
      where: {
        id: { not: userId },
        followers: {
          none: {
            followerId: userId,
          },
        },
      },omit:{password:true},
      include: { profile: { omit: { id: true } } },
      take: 4,
    });

    res.status(200).json({ message: `user suggested`, suggested });
  } catch (error) {
    res.status(500).json({ error: `Failed to suggested User` });
  }
};
