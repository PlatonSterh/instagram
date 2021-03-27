import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { AuthRequest } from "../middleware/auth";
import Bookmark, { BookmarkInstance } from "../models/Bookmark";
import { CommentInstance } from "../models/Comment";
import Followers from "../models/Followers";
import Like, { LikeInstance } from "../models/Like";
import Post, { PostInstance } from "../models/Post";
import User, { UserInstance } from "../models/User";

const MAX_FOLLOWING_POSTS_COUNT = 5;

interface IPost {
  id: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
}

interface IComment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

type CreateUserArgs = {
  userInput: {
    name?: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    password: string;
  };
};

type CreatePostArgs = {
  imageUrl: string;
};

type LoginArgs = {
  username: string;
  password: string;
};

type CommentArgs = {
  commentInput: {
    content: string;
    postId: number;
  };
};

type GetFollowingPostsArgs = {
  slice: number;
};

type FollowArgs = {
  followingId: number;
};

type LikePostArgs = {
  postId: number;
};

type LikeCommentArgs = {
  commentId: number;
  postId: number;
};

type IsUserLikedPostArgs = {
  userId: number;
  postId: number;
};

type IsUserLikedCommentArgs = {
  userId: number;
  postId: number;
  commentId: number;
};

type BookmarkPostArgs = {
  postId: number;
};

type GetUserBookmarkedPostsArgs = {
  userId: number;
};

type GetUserPostsArgs = {
  userId: number;
};

type GetPostCommentsArgs = {
  postId: number;
};

type GetPostByIdArgs = {
  postId: number;
};

type GetUserByIdArgs = {
  userId: number;
};

type UpdateUserDataArgs = {
  updateUserDataInput: {
    id: number;
    name?: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
  };
};

type UpdatePasswordArgs = {
  userId: number;
  oldPassword: string;
  newPassword: string;
};

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class InvalidInputError extends Error {
  data: ValidationError[] = [];

  constructor(message: string, data: ValidationError[]) {
    super(message);
    this.data = data;
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default {
  createUser: async ({ userInput }: CreateUserArgs) => {
    const errors: ValidationError[] = [];
    const existingUser: UserInstance = await User.findOne({
      where: { username: userInput.username },
    });
    if (existingUser) throw new Error("User exist already!");
    if (!validator.isLength(userInput.username, { max: 20 })) {
      errors.push(
        new ValidationError("Username length should be less than 20.")
      );
    }
    if (userInput.avatarUrl && !validator.isURL(userInput.avatarUrl)) {
      errors.push(new ValidationError("Avatar URL should be URL."));
    }
    if (errors.length > 0) {
      throw new InvalidInputError("Invalid input.", errors);
    }
    const hashedPassword: string = await bcrypt.hash(userInput.password, 12);
    const createdUser: UserInstance = await User.create({
      ...userInput,
      password: hashedPassword,
    });
    return createdUser;
  },
  createPost: async ({ imageUrl }: CreatePostArgs, req: AuthRequest) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const author: UserInstance = await User.findByPk(req.userId);
    if (!author) throw new Error("Author of post didn't exist.");
    const errors: ValidationError[] = [];
    if (!validator.isURL(imageUrl)) {
      errors.push(new ValidationError("Image URL should be URL."));
    }
    if (errors.length > 0) {
      throw new InvalidInputError("Invalid input.", errors);
    }

    const createdPost: { dataValues: PostInstance } = await author.createPost({
      imageUrl: imageUrl,
      likesCount: 0,
    });
    return {
      id: createdPost.dataValues.id,
      imageUrl: createdPost.dataValues.imageUrl,
      likesCount: createdPost.dataValues.likesCount,
      createdAt: createdPost.dataValues.createdAt.toISOString(),
      updatedAt: createdPost.dataValues.updatedAt.toISOString(),
    };
  },
  createComment: async (
    { commentInput: { content, postId } }: CommentArgs,
    req: AuthRequest
  ) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const post: PostInstance = await Post.findByPk(postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    const user: UserInstance = await User.findByPk(req.userId);
    if (!user) {
      throw new Error("User not found.");
    }
    const errors: ValidationError[] = [];
    if (!validator.isLength(content, { max: 1024 })) {
      errors.push(new ValidationError("Comment content is very big."));
    }
    if (errors.length > 0) {
      throw new InvalidInputError("Invalid input.", errors);
    }
    const createdComment: CommentInstance = post.createComment({
      authorName: user.username,
      content,
    });
    return createdComment;
  },
  login: async ({ username, password }: LoginArgs) => {
    const userData: UserInstance = await User.findOne({ where: { username } });
    if (!userData) {
      throw new Error("User not found.");
    }
    const isEqual: boolean = await bcrypt.compare(password, userData.password);
    if (!isEqual) {
      throw new Error("Wrong password.");
    }
    const token: string = jwt.sign(
      { userId: userData.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    return { token, userId: userData.id };
  },
  follow: async ({ followingId }: FollowArgs, req: AuthRequest) => {
    if (!req.isAuth) {
      throw new Error("Not authenticated.");
    }
    await Followers.create({ followerId: req.userId, followingId });
    return true;
  },
  getFollowingPosts: async (
    { slice }: GetFollowingPostsArgs,
    req: AuthRequest
  ) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const followings: UserInstance = await User.findOne({
      where: { id: req.userId },
      include: ["following", "followers"],
    });
    const followingsPosts: IPost[] = [];
    await Promise.all(
      followings.following.map(async (following: UserInstance) => {
        const posts: PostInstance[] = await following.getPosts();
        followingsPosts.push(
          ...posts.map((post: PostInstance) => ({
            id: post.id,
            imageUrl: post.imageUrl,
            likesCount: post.likesCount,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
          }))
        );
      })
    );
    const start: number =
      slice * MAX_FOLLOWING_POSTS_COUNT - MAX_FOLLOWING_POSTS_COUNT;
    const end: number =
      slice * MAX_FOLLOWING_POSTS_COUNT -
      MAX_FOLLOWING_POSTS_COUNT +
      MAX_FOLLOWING_POSTS_COUNT;
    followingsPosts.sort(
      (a: IPost, b: IPost) =>
        Number(new Date(a.createdAt)) - Number(new Date(b.createdAt))
    );
    return followingsPosts.slice(start, end);
  },
  likePost: async ({ postId }: LikePostArgs, req: AuthRequest) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const post: PostInstance = await Post.findByPk(postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    const like: LikeInstance = await Like.findOne({
      where: { postId, userId: req.userId },
    });
    if (like) {
      throw new Error("Like is exist already.");
    }

    await post.increment("likesCount", { by: 1 });
    const createdLike: LikeInstance = await Like.create({
      postId,
      userId: req.userId,
    });
    return createdLike;
  },
  likeComment: async (
    { commentId, postId }: LikeCommentArgs,
    req: AuthRequest
  ) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const like: LikeInstance = await Like.findOne({
      where: { commentId, postId, userId: req.userId },
    });
    if (like) {
      throw new Error("Like is exist already.");
    }

    const createdLike: LikeInstance = await Like.create({
      commentId,
      postId,
      userId: req.userId,
    });
    return createdLike;
  },
  unlikePost: async ({ postId }: LikePostArgs, req: AuthRequest) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const post: PostInstance = await Post.findByPk(postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    const like: LikeInstance = await Like.findOne({
      where: { postId, userId: req.userId },
    });
    if (!like) {
      throw new Error("Like isn't exist.");
    }

    await post.decrement("likesCount", { by: 1 });
    await like.destroy();
    return true;
  },
  unlikeComment: async (
    { commentId, postId }: LikeCommentArgs,
    req: AuthRequest
  ) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const like: LikeInstance = await Like.findOne({
      where: { commentId, postId, userId: req.userId },
    });
    if (!like) {
      throw new Error("Like isn't exist.");
    }

    await like.destroy();
    return true;
  },
  isUserLikePost: async ({ userId, postId }: IsUserLikedPostArgs) => {
    const like: LikeInstance = await Like.findOne({
      where: { userId, postId },
    });
    if (!like) {
      return false;
    }

    return true;
  },
  isUserLikeComment: async ({
    userId,
    postId,
    commentId,
  }: IsUserLikedCommentArgs) => {
    const like: LikeInstance = await Like.findOne({
      where: { userId, postId, commentId },
    });
    if (!like) {
      return false;
    }

    return true;
  },
  bookmarkPost: async ({ postId }: BookmarkPostArgs, req: AuthRequest) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const bookmark: BookmarkInstance = await Bookmark.findOne({
      where: { postId, userId: req.userId },
    });
    if (bookmark) {
      throw new Error("Bookmark is exist already.");
    }

    const createdBookmark: BookmarkInstance = await Bookmark.create({
      postId,
      userId: req.userId,
    });
    return createdBookmark;
  },
  unbookmarkPost: async ({ postId }: BookmarkPostArgs, req: AuthRequest) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const bookmark: BookmarkInstance = await Bookmark.findOne({
      where: { postId, userId: req.userId },
    });
    if (!bookmark) {
      throw new Error("Bookmark isn't exist.");
    }

    await bookmark.destroy();
    return true;
  },
  getUserBookmarkedPosts: async (args: any, req: AuthRequest) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const user: UserInstance = await User.findOne({
      where: { id: req.userId },
      include: ["bookmarked"],
    });
    if (!user) {
      throw new Error("User not found.");
    }

    const postsBookmarks: BookmarkInstance[] = user.bookmarked;
    const bookmarkedPosts: IPost[] = [];

    await Promise.all(
      postsBookmarks.map(async (postBookmark: BookmarkInstance) => {
        const postData: PostInstance = await Post.findOne({
          where: { id: postBookmark.postId },
        });
        if (postData) {
          bookmarkedPosts.push({
            id: postData.id,
            imageUrl: postData.imageUrl,
            likesCount: postData.likesCount,
            createdAt: postData.createdAt.toISOString(),
            updatedAt: postData.updatedAt.toISOString(),
          });
        }
      })
    );
    return bookmarkedPosts;
  },
  getUserPosts: async ({ userId }: GetUserPostsArgs) => {
    const user: UserInstance = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found.");
    }

    const postsData: PostInstance[] = await user.getPosts();
    const posts: IPost[] = postsData.map((postData: PostInstance) => ({
      id: postData.id,
      imageUrl: postData.imageUrl,
      likesCount: postData.likesCount,
      createdAt: postData.createdAt.toISOString(),
      updatedAt: postData.updatedAt.toISOString(),
    }));

    return posts;
  },
  getPostComments: async ({ postId }: GetPostCommentsArgs) => {
    const post: PostInstance = await Post.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error("Post not found.");
    }

    const commentsData: CommentInstance[] = await post.getComments();
    const comments: IComment[] = commentsData.map(
      (commentData: CommentInstance) => ({
        id: commentData.id,
        content: commentData.content,
        createdAt: commentData.createdAt.toISOString(),
        updatedAt: commentData.updatedAt.toISOString(),
      })
    );

    return comments;
  },
  getPostById: async ({ postId }: GetPostByIdArgs) => {
    const post: PostInstance = await Post.findOne({ where: { id: postId } });
    return post;
  },
  getUserById: async ({ userId }: GetUserByIdArgs) => {
    const user: UserInstance = await User.findOne({ where: { id: userId } });
    return { ...user, password: "" };
  },
  updateUserData: async (
    {
      updateUserDataInput: { name, username, bio, avatarUrl },
    }: UpdateUserDataArgs,
    req: AuthRequest
  ) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const existingUser: UserInstance = await User.findByPk(req.userId);
    if (!existingUser) {
      throw new Error("User not found.");
    }
    await existingUser.update({ values: { name, username, bio, avatarUrl } });
    return true;
  },
  updatePassword: async (
    { oldPassword, newPassword }: UpdatePasswordArgs,
    req: AuthRequest
  ) => {
    if (!req.isAuth) {
      throw new AuthError("Not authenticated.");
    }
    const existingUser: UserInstance = await User.findByPk(req.userId);
    if (!existingUser) {
      throw new Error("User not found.");
    }
    const password: string = existingUser.password;
    const isEquel: boolean = await bcrypt.compare(oldPassword, password);
    if (!isEquel) {
      throw new Error("Wrong password.");
    }
    const hashedPassword: string = await bcrypt.hash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    return true;
  },
};