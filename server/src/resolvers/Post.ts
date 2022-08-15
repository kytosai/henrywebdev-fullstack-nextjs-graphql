import User from '../entities/User';
import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import Post from '../entities/Post';
import { checkAuth } from '../middleware/checkAuth';
import Context from '../types/Context';
import CreatePostInput from '../types/CreatePostInput';
import PostMutationResponse from '../types/PostMutationResponse';
import UpdatePostInput from '../types/UpdatePostInput';
import PaginatedPostsResponse from '../types/PaginatedPosts';
import { FindManyOptions, LessThan } from 'typeorm';

@Resolver(() => Post)
class PostResolver {
  /*
    Field resolver the same with computed (vue) or useMemo (react). It help us combine form multiple fields to create a new result
  */
  @FieldResolver(() => String)
  textSnippet(@Root() parent: Post) {
    return parent.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  async user(@Root() root: Post) {
    return await User.findOne({ where: [{ id: root.userId }] });
  }

  @Mutation(() => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg('createPostInput') createPostInput: CreatePostInput,
    @Ctx() context: Context,
  ): Promise<PostMutationResponse> {
    const { title, text } = createPostInput;
    const { req } = context;

    try {
      const userId = req.session.userId;

      const newPost = Post.create({
        title,
        text,
        userId,
      });

      const createdPost = await newPost.save();

      return {
        code: 200,
        success: true,
        message: 'post created success!',
        post: createdPost,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `interal server error ${error.message}`,
      };
    }
  }

  @Query(() => PaginatedPostsResponse, { nullable: true })
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', { nullable: true }) cursor?: string,
  ): Promise<PaginatedPostsResponse | null> {
    try {
      const totalCount = await Post.count();
      const realLimit = Math.min(10, limit);

      const findOptions: { [key: string]: any } = {
        order: {
          createdAt: 'DESC',
        },
        take: realLimit,
      };

      let lastPost: Post | null = null;
      if (cursor) {
        findOptions.where = { createdAt: LessThan(cursor) };

        // last post
        const posts = await Post.find({
          order: {
            createdAt: 'ASC',
          },
          take: 1,
        });

        lastPost = posts[0];
      }

      const posts = await Post.find(findOptions);
      const nextCursor = posts[posts.length - 1].createdAt;

      return {
        cursor: nextCursor,
        totalCount,
        hasMore: lastPost?.createdAt.toString() !== nextCursor.toString(),
        paginatedPosts: posts,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => ID) id: number): Promise<Post | null> {
    try {
      const post = await Post.findOne({
        where: {
          id: id.toString(),
        },
      });

      return post;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Mutation(() => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg('updatePostInput') updatePostInput: UpdatePostInput,
    @Ctx() context: Context,
  ): Promise<PostMutationResponse> {
    const { req } = context;

    try {
      const { id, text, title } = updatePostInput;
      const existingPost = await Post.findOne({
        where: {
          id: id.toString(),
        },
      });

      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: 'post not found',
        };
      }

      if (existingPost.userId !== req.session.userId) {
        return {
          code: 401,
          success: false,
          message: 'Unauthorized',
        };
      }

      existingPost.title = title;
      existingPost.text = text;

      await existingPost.save();

      return {
        code: 200,
        success: true,
        message: 'Post updated successfully!',
        post: existingPost,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `interal server error ${error.message}`,
      };
    }
  }

  @Mutation(() => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg('id', () => ID) id: number,
    @Ctx() context: Context,
  ): Promise<PostMutationResponse> {
    const { req } = context;

    try {
      const existingPost = await Post.findOne({
        where: {
          id: id.toString(),
        },
      });

      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: 'post not found',
        };
      }

      if (existingPost.userId !== req.session.userId) {
        return {
          code: 401,
          success: false,
          message: 'Unauthorized',
        };
      }

      await Post.delete(id);

      return {
        code: 200,
        success: true,
        message: 'Post deleted successfully!',
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `interal server error ${error.message}`,
      };
    }
  }
}

export default PostResolver;
