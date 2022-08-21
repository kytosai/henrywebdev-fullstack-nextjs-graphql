import { UserInputError } from 'apollo-server-core';
import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { LessThan } from 'typeorm';
import Post from '../entities/Post';
import Upvote from '../entities/Upvote';
import User from '../entities/User';
import { checkAuth } from '../middleware/checkAuth';
import Context from '../types/Context';
import CreatePostInput from '../types/CreatePostInput';
import PaginatedPostsResponse from '../types/PaginatedPosts';
import PostMutationResponse from '../types/PostMutationResponse';
import UpdatePostInput from '../types/UpdatePostInput';
import { VoteType } from './../types/VoteType';

/*
  doc: https://typegraphql.com/docs/0.17.0/enums.html#usage 
*/
registerEnumType(VoteType, {
  name: 'VoteType', // this one is mandatory
});

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
  async user(@Root() root: Post, @Ctx() context: Context) {
    const {
      dataLoaders: { userLoader },
    } = context;

    return await userLoader.load(root.userId);
  }

  @FieldResolver(() => Int)
  async voteType(@Root() root: Post, @Ctx() context: Context) {
    const {
      req,
      dataLoaders: { voteTypeLoader },
    } = context;
    const userId = req.session.userId;

    if (!userId) return 0;

    const existingVote = await voteTypeLoader.load({
      postId: root.id,
      userId,
    });

    if (!existingVote) return 0;

    return existingVote.value;
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
          id,
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
          id,
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
          id,
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

      await Upvote.delete({ postId: id }); // fix for error when user delete post have upvote item in db

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

  @Mutation(() => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('inputVoteValue', () => VoteType) inputVoteValue: VoteType,
    @Ctx() context: Context,
  ): Promise<PostMutationResponse> {
    const { req, connection } = context;

    try {
      /*
        When implementing a feature, we need to execute many sql commands such as select, intert,.. continously to complete it. This easily leads to the risk that one of our commands will fail, leading to feature not being completed, the database has been affected.

        Transaction help us to execute many sql commands continuously and if there is one error, all previous executions of sql commands will be completed aborted.

        Doc: https://typeorm.io/transactions
      */
      return await connection.transaction(async (transactionEntityManager) => {
        // check if post exists
        let post = await transactionEntityManager.findOne(Post, {
          where: [{ id: postId }],
        });
        if (!post) {
          throw new UserInputError('Post not found');
        }

        const userId = req.session.userId;

        // check if user has voted or not for this post
        const existingVote = await transactionEntityManager.findOne(Upvote, {
          where: [
            {
              postId,
              userId,
            },
          ],
        });

        if (existingVote && existingVote.value !== inputVoteValue) {
          await transactionEntityManager.save(Upvote, {
            ...existingVote,
            value: inputVoteValue,
          });

          post = await transactionEntityManager.save(Post, {
            ...post,
            points: post.points + inputVoteValue * 2,
          });
        }

        if (!existingVote) {
          const newVote = transactionEntityManager.create(Upvote, {
            postId,
            userId,
            value: inputVoteValue,
          });

          await transactionEntityManager.save(newVote);
          post.points = post.points + inputVoteValue;
          post = await transactionEntityManager.save(post);
        }

        return {
          code: 200,
          success: true,
          message: 'Post vote success',
          post,
        };
      });
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
