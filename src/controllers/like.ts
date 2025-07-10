import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const likeThread = async (req: Request, res: Response)=>{
    try {
        const currentUserId = (req as any).user;
        const userId = currentUserId?.id;
        if (!userId) {
          res.status(401).json({ message: "Unauthorized: User not found" });
          return;
        }
        const { postId } = req.body;
        const existingLike = await prisma.postLike.findUnique({
          where: {
                postId_userId: {
               postId, userId
           }
          },
        });

        if (existingLike) {
          res.status(400).json({ message: "You already liked this thread." });
          return;
        }
        
        const like = await prisma.postLike.create({ data: { userId, postId } })
        res.status(200).json({ message: "Successfully like thread.", like});
    } catch (error) {
      res.status(500).json({ message: "Failed to like thread", error });
    }
}

export const unLike = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user;
    const userId = currentUserId?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const { postId } = req.body;
    const data = await prisma.postLike.delete({
      where: {
    postId_userId:{postId, userId}
      },
    });

    res.status(200).json({ message: "Successfully unlike thread", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to unlike thread", error });
  }
};


export const getLikeThread = async (req: Request, res: Response) => {
    try {
      const currentUserId = (req as any).user;
      const userId = currentUserId?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized: User not found" });
        return;
      }
      const postId = req.body
      const thread = await prisma.post.findMany({
        where:{authorId:userId}
      })
      res.status(200).json(thread);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }