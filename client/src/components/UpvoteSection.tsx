import { PostWithUserInfoFragment } from '@/generated/graphql';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment;
}

const UpvoteSection = (props: UpvoteSectionProps) => {
  const { post } = props;

  return (
    <Flex direction="column" mr={4}>
      <IconButton icon={<ChevronUpIcon />} aria-label="upvote"></IconButton>
      <Box textAlign="center" py={2}>
        {post.points}
      </Box>
      <IconButton icon={<ChevronDownIcon />} aria-label="downvote"></IconButton>
    </Flex>
  );
};

export default UpvoteSection;
