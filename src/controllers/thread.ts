import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import cloudinary from "../utils/cloudinary";

export const getThreads = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const authorId = user?.id;
    const threads = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            profile: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: authorId,
          },
          select: {
            id: true,
          },
        },
      },
      take: 10,
    });

    const result = threads.map((thread:any) => ({
      id: thread.id,
      content: thread.content,
      imageUrl: thread.imageUrl,
      createdAt: thread.createdAt,
      likeCount: thread._count.likes,
      likeComment: thread._count.comments,
      liked: thread.likes.length > 0,
      author: thread.author,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getThreadById = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
     res.status(400).json({ message: "Invalid thread ID" });return
  }

  const user = (req as any).user;

  try {
    const thread = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            profile: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!thread) {
       res.status(404).json({ message: "Thread not found" });return
    }

    const liked = user
      ? thread.likes.some((like:any) => like.userId === user.id)
      : false;

    res.status(200).json({
      ...thread,
      liked,
      likeCount: thread._count.likes,
    });
  } catch (error) {
   res.status(500).json({ message: "Server error" });
  }
};


export async function addThread(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const authorId = user?.id;
    const { content } = req.body;

    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let imageUrl: string | undefined = undefined;

    if (req.file) {
      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "circle-upload-file" },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result as { secure_url: string });
            }
          );

          stream.end(req.file?.buffer);
        }
      );

      imageUrl = result.secure_url;
    }

    const thread = await prisma.post.create({
      data: {
        content,
        authorId,
        imageUrl,
      },
    });

    res.status(201).json({ message: "Thread created", thread });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

export async function editThread(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id);
    const authorId = user?.id;
    const { content, imageDeleted } = req.body;
    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ message: "thread not found" });
      return;
    }

    if (post.authorId !== user.id) {
      res.status(403).json({ message: "Tidak memiliki akses" });
      return;
    }

    let imageUrl: string | null | undefined = undefined;
    if (imageDeleted === "true" && post.imageUrl) {
      const publicId = `circle-upload-file/${
        post.imageUrl.split("/").pop()?.split(".")[0]
      }`;
      await cloudinary.uploader.destroy(publicId);
      imageUrl = null;
    }

    if (req.file) {
      if (post.imageUrl) {
        const oldPublicId = `circle-upload-file/${
          post.imageUrl.split("/").pop()?.split(".")[0]
        }`;
        await cloudinary.uploader.destroy(oldPublicId);
      }

      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "circle-upload-file",
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result as { secure_url: string });
            }
          );
          stream.end(req.file?.buffer);
        }
      );

      imageUrl = result.secure_url;
    }
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (typeof imageUrl !== "undefined") updateData.imageUrl = imageUrl;
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "Tidak ada perubahan data." });
      return;
    }
    const updateThread = await prisma.post.update({
      where: { id },
      data: updateData,
    });
    res.status(200).json({ message: "Updated thread", updateThread });
  } catch (error) {
    res.status(500).json({ error: "Failed to update thread" });
  }
}

export async function deletedThread(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const id = parseInt(req.params.id);
    const authorId = user?.id;
    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ message: "thread not found" });
      return;
    }
    if (post.authorId !== user.id) {
      res.status(403).json({ message: "Tidak memiliki akses" });
      return;
    }
    
    const result = await prisma.post.delete({
      where: { id },
    });
    res.status(200).json({ message: "Deleted thread", result });
  } catch (error) {
    res.status(500).json({ message: "failed to delete", error });
  }
}

export async function myThread(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const authorId = user?.id;
    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const threads = await prisma.post.findMany({ where:{authorId},
      include: {
        author: { select: { profile: true, } },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: authorId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!threads) {
      res.status(404).json({ message: "thread not found" });
      return;
    }
    const result = threads.map((thread:any) => ({
      id: thread.id,
      content: thread.content,
      imageUrl: thread.imageUrl,
      createdAt: thread.createdAt,
      likeCount: thread._count.likes,
      countComment: thread._count.comments,
      liked: thread.likes.length > 0,
      author: thread.author,
    }));
    res.status(200).json({ message: "thread :", result });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
export async function OtherThread(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const authorId = user?.id;
    if (!authorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const {username}=req.params
    const isSelfProfile = await prisma.profile.findFirst({
      where: {
        userId: authorId,
        username,
      },
    });

    if (isSelfProfile) {
      res.status(400).json({
        message: "You cannot access your own profile from this endpoint",
      });
      return;
    }
    const threads = await prisma.post.findMany({ where:{author:{profile:{username}}},
      include: {
        author: { select: { profile: true, } },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: authorId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!threads) {
      res.status(404).json({ message: "thread not found" });
      return;
    }
    const result = threads.map((thread:any) => ({
      id: thread.id,
      content: thread.content,
      imageUrl: thread.imageUrl,
      createdAt: thread.createdAt,
      likeCount: thread._count.likes,
      countComment: thread._count.comments,
      liked: thread.likes.length > 0,
      author: thread.author,
    }));
    res.status(200).json({ message: "thread :", result });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
