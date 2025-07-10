import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getComments = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const authorId = user?.id;
  if (!authorId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }
  try {
    const commentById = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { profile: true } },
      },orderBy:{createdAt:"desc"}
    });
    res.status(200).json(commentById);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export async function addComment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const authorId = user?.id;
    const postId = parseInt(req.params.id);
    
    const { content } = req.body;

    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const post = await prisma.post.findUnique({ where: { id:postId } });
    if (!post) {
      res.status(404).json({ message: "thread not found" });
      return;
    }
  
    const comments = await prisma.comment.create({
      data: {
        content,
        authorId,
        postId,
      },
    });

    res.status(201).json({ message: "comment created", comments });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

export async function editComment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const authorId = user?.id;
    const id = parseInt(req.params.id);
    const { content } = req.body;

    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      res.status(404).json({ message: "comment not found" });
      return;
    }

    if (comment.authorId !== user.id) {
      res.status(403).json({ message: "Tidak memiliki akses" });
      return;
    }

    const update = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    res.status(201).json({ message: "comment updated", update });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

export async function deleteComment(req: Request, res:Response) {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id);
    const authorId = user?.id;
    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      res.status(404).json({ message: "comment not found" });
      return;
    }
    if (comment.authorId !== user.id) {
      res.status(403).json({ message: "Tidak memiliki akses" });
      return;
    }
    const deleted = await prisma.comment.delete({ where: { id } })
    res.status(200).json({ message: "Deleted comment", deleted });
  } catch (error) {
    res.status(500).json({ message: "failed to delete", error });
  }
}