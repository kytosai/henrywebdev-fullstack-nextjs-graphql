import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, IconButton } from '@chakra-ui/react';

const PostEditDeleteButtons = () => {
  return (
    <Box>
      <IconButton icon={<EditIcon />} mr={4} aria-label="edit">
        Edit
      </IconButton>

      <IconButton icon={<DeleteIcon />} aria-label="delete" colorScheme="red">
        Delete
      </IconButton>
    </Box>
  );
};

export default PostEditDeleteButtons;
