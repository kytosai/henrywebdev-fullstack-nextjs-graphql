import User from '../entities/User';
import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
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
      const newPost = Post.create({
        title,
        text,
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

  @Query(() => [Post])
  async posts(): Promise<Post[] | null> {
    try {
      return await Post.find();
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
  ): Promise<PostMutationResponse> {
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
  async deletePost(@Arg('id', () => ID) id: number): Promise<PostMutationResponse> {
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
