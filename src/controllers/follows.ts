import { Request, Response } from "express";
import { prisma } from "../prisma/client";
// Follow a user
export const followUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user;
    const followerId = currentUserId?.id;
    if (!followerId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const { followingId } = req.body;
    if (followerId === followingId) {
      res.status(400).json({ message: "You cannot follow yourself." });
      return;
    }
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      res.status(400).json({ message: "You already followed this user." });
      return;
    }
  
    const data = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    res.status(201).json({ message: "Successfully followed user.", data });
  } catch (error) {
    res.status(501).json({ message: "Failed to follow user", error });
  }
};


export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user;
    const followerId = currentUserId?.id;
    if (!followerId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const { followingId } = req.body;
    const data = await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    res.status(200).json({ message: "Successfully unfollowed user.", data });
  } catch (error) {
    res.status(501).json({ message: "Failed to unfollow user", error });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user;
    const loggedId = userId?.id;
    if (!loggedId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: loggedId },
      select: {
        email: true,
        followers: {
          select: {
            followerId: true,
            follower: {
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
                  where: { followerId: loggedId },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });
    const formatted = user?.followers.map((f) => ({
      id: f.follower.id,
      email: f.follower.email,
      profile: f.follower.profile,
      isFollowed: f.follower.followers.length > 0,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch followers", error });
  }
};


export const getFollowing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user;
    const loggedId = userId?.id;
    if (!loggedId) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: loggedId },
      select: {
        following: {
          select: {
            followingId: true,
            following: {
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
                  where: { followerId: loggedId },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    const formatted = user?.following.map((f) => ({
      id: f.following.id,
      email: f.following.email,
      profile: f.following.profile,
      isFollowed: f.following.followers.length > 0, 
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch following", error });
  }
};
