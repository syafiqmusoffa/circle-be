import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { date } from "joi";
import cloudinary from "../utils/cloudinary";
import { profileSchema } from "../validations/profile";

export const getProfiles = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user;
    const userId = currentUserId?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const profileUser = await prisma.profile.findMany({
      where: {
        userId: { not: userId },
      },
      include: {
        user: {
          omit: { password: true },
        },
      },
    });
    res.status(200).json(profileUser);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateProfiles = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.id;
    const files = req.files as {
      avatarUrl?: Express.Multer.File[];
      backgroundUrl?: Express.Multer.File[];
    };
    const avatarFile = files.avatarUrl?.[0] as Express.Multer.File;
    const backgroundFile = files.backgroundUrl?.[0] as Express.Multer.File;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    const { name, bio, username, avatarDeleted, bannerDeleted } = req.body;
    const normalizedUsername = username?.toLowerCase().trim();

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const { error } = profileSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    if (normalizedUsername && normalizedUsername !== profile.username) {
      const existing = await prisma.profile.findUnique({
        where: { username: normalizedUsername },
      });
      if (existing && existing.userId !== userId) {
        res.status(400).json({ message: "Username sudah digunakan" });
        return;
      }
    }

    let avatarUrl: string | null | undefined = undefined;
    let backgroundUrl: string | null | undefined = undefined;

    if (avatarDeleted === "true" && profile.avatarUrl) {
      const publicId = `circle-upload-file/${
        profile.avatarUrl.split("/").pop()?.split(".")[0]
      }`;
      await cloudinary.uploader.destroy(publicId);
      avatarUrl = null;
    }
    if (bannerDeleted === "true" && profile.backgroundUrl) {
      const publicId = `circle-upload-file/${
        profile.backgroundUrl.split("/").pop()?.split(".")[0]
      }`;
      await cloudinary.uploader.destroy(publicId);
      backgroundUrl = null;
    }

    if (files?.avatarUrl?.[0]) {
      if (profile.avatarUrl) {
        const oldPublicId = `circle-upload-file/${
          profile.avatarUrl.split("/").pop()?.split(".")[0]
        }`;
        await cloudinary.uploader.destroy(oldPublicId);
      }

      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "circle-upload-file",
              resource_type: "image",
              public_id: `avatar-${userId}-${Date.now()}`,
              crop: "thumb",
              gravity: "face",
              width: 300,
              height: 300,
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result as { secure_url: string });
            }
          );
          stream.end(avatarFile.buffer);
        }
      );

      avatarUrl = result.secure_url;
    }
    if (files?.backgroundUrl?.[0]) {
      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "circle-upload-file" },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result as { secure_url: string });
            }
          );

          stream.end(backgroundFile?.buffer);
        }
      );

      backgroundUrl = result.secure_url;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (normalizedUsername !== undefined)
      updateData.username = normalizedUsername;
    if (typeof avatarUrl !== "undefined") updateData.avatarUrl = avatarUrl;
    if (typeof backgroundUrl !== "undefined")
      updateData.backgroundUrl = backgroundUrl;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "Tidak ada perubahan data." });
      return;
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    res
      .status(200)
      .json({ message: "Updated profile", newProfile: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const updateUsername = async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id);
    
    const { username } = req.body;

    const result = await prisma.profile.update({
      where: { id },
      data: { username },
    });
    res.status(200).json({ message: `berhasil update ${username}`, result });
  } catch (error) {
    res.status(500).json({ error: "Failed to update username" });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const loggedId = user?.id;

    if (!loggedId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: loggedId },
      include: {
        user: {
          omit: { password: true },
          include: {
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const result = {
      ...profile,
      user: {
        ...profile.user,
      },
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const loggedInUserId = (req as any).user?.id;
  if (!loggedInUserId) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  if (!query) res.status(400).json({ message: "Missing search query" });

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: loggedInUserId } },
        {
          OR: [
            { profile: { name: { contains: query, mode: "insensitive" } } },
            { profile: { username: { contains: query, mode: "insensitive" } } },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          userId: true,
          username: true,
          name: true,
          bio: true,
          avatarUrl: true,
        },
      },
      followers: {
        where: { followerId: loggedInUserId },
        select: { id: true },
      },
    },
  });

  const result = users.map((user: any) => ({
    ...user,
    isFollowed: user.followers.length > 0,
  }));

  res.json(result);
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const loggedId = user?.id;

    if (!loggedId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    const { username } = req.params;
    const isSelfProfile = await prisma.profile.findFirst({
      where: {
        userId: loggedId,
        username,
      },
    });

    if (isSelfProfile) {
      res.status(400).json({
        message: "You cannot access your own profile from this endpoint",
      });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { username },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                userId: true,
                username: true,
                name: true,
                bio: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    const count = await prisma.user.findUnique({
      where: { id: profile.user.id },
      select: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    const isFollowed = await prisma.follow.findFirst({
      where: {
        followerId: loggedId,
        followingId: profile.user.id,
      },
    });

    const result = {
      ...profile,
      user: {
        ...profile.user,
        _count: count?._count ?? { followers: 0, following: 0 },
        isFollowed: !!isFollowed,
      },
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
