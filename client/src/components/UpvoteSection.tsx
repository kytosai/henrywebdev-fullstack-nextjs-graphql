import { PostWithUserInfoFragment, useVoteMutation, VoteType } from '@/generated/graphql';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import { useState } from 'react';

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment;
}

const UpvoteSection = (props: UpvoteSectionProps) => {
  const { post } = props;
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [vote, { loading }] = useVoteMutation();

  const handleUpvote = async () => {
    setLoadingState('upvote-loading');

    await vote({
      variables: {
        postId: parseInt(post.id),
        inputVoteValue: VoteType.Upvote,
      },
    });

    setLoadingState('not-loading');
  };

  const handleDownvote = async () => {
    setLoadingState('downvote-loading');

    await vote({
      variables: {
        postId: parseInt(post.id),
        inputVoteValue: VoteType.Downvote,
      },
    });

    setLoadingState('not-loading');
  };

  return (
    <Flex direction="column" mr={4}>
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label="upvote"
        onClick={handleUpvote}
        isLoading={loading && loadingState === 'upvote-loading'}
      ></IconButton>

      <Box textAlign="center" py={2}>
        {post.points}
      </Box>

      <IconButton
        icon={<ChevronDownIcon />}
        aria-label="downvote"
        onClick={handleDownvote}
        isLoading={loading && loadingState === 'downvote-loading'}
      ></IconButton>
    </Flex>
  );
};

export default UpvoteSection;
