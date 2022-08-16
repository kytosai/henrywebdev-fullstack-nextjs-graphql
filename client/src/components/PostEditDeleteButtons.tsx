import {
  PaginatedPostsResponse,
  useDeletePostMutation,
  useMeQuery,
} from '@/generated/graphql';
import { Reference } from '@apollo/client';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface PostEditDeleteButtonsProps {
  postId: string;
  postUserId: string;
}

const PostEditDeleteButtons = (props: PostEditDeleteButtonsProps) => {
  const router = useRouter();
  const { postId, postUserId } = props;
  const { data: meData } = useMeQuery();
  const [deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== postUserId) {
    return null;
  }

  const onPostDelete = async () => {
    await deletePost({
      variables: {
        id: postId,
      },
      update(cache, { data }) {
        if (data?.deletePost.success) {
          cache.modify({
            fields: {
              posts(
                existing: Pick<
                  PaginatedPostsResponse,
                  '__typename' | 'cursor' | 'hasMore' | 'totalCount'
                > & {
                  paginatedPosts: Reference[];
                },
              ) {
                const newPostsAfterDeletion = {
                  ...existing,
                  totalCount: existing.totalCount - 1,
                  paginatedPosts: existing.paginatedPosts.filter((postRefObject) => {
                    return postRefObject.__ref !== `Post:${postId}`;
                  }),
                };

                return newPostsAfterDeletion;
              },
            },
          });
        }
      },
    });

    if (router.route !== '/') {
      router.push('/');
    }
  };

  return (
    <Box>
      <NextLink href={`/post/edit/${postId}`} passHref>
        <IconButton icon={<EditIcon />} mr={4} aria-label="edit" as="a">
          Edit
        </IconButton>
      </NextLink>

      <IconButton
        icon={<DeleteIcon />}
        aria-label="delete"
        colorScheme="red"
        onClick={onPostDelete}
      >
        Delete
      </IconButton>
    </Box>
  );
};

export default PostEditDeleteButtons;
