import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';

interface PostEditDeleteButtonsProps {
  postId: string;
}

const PostEditDeleteButtons = (props: PostEditDeleteButtonsProps) => {
  const { postId } = props;

  return (
    <Box>
      <NextLink href={`/post/edit/${postId}`} passHref>
        <IconButton icon={<EditIcon />} mr={4} aria-label="edit" as="a">
          Edit
        </IconButton>
      </NextLink>

      <IconButton icon={<DeleteIcon />} aria-label="delete" colorScheme="red">
        Delete
      </IconButton>
    </Box>
  );
};

export default PostEditDeleteButtons;
