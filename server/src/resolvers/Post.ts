import { Arg, Mutation, Resolver } from 'type-graphql';
import Post from '../entities/Post';
import CreatePostInput from '../types/CreatePostInput';
import PostMutationResponse from '../types/PostMutationResponse';

@Resolver()
class PostResolver {
  @Mutation(() => PostMutationResponse)
  async createPost(
    @Arg('createPostInput') createPostInput: CreatePostInput,
  ): Promise<PostMutationResponse> {
    const { title, text } = createPostInput;

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
}

export default PostResolver;
