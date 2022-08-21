import { PostWithUserInfoFragment, useVoteMutation, VoteType } from '@/generated/graphql';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment;
}

enum VoteTypeValues {
  Upvote = 1,
  Downvote = -1,
}

const UpvoteSection = (props: UpvoteSectionProps) => {
  const { post } = props;

  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [vote, { loading }] = useVoteMutation();

  const handleUpvote = async () => {
    try {
      setLoadingState('upvote-loading');

      await vote({
        variables: {
          postId: parseInt(post.id),
          inputVoteValue: VoteType.Upvote,
        },
      });

      setLoadingState('not-loading');
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownvote = async () => {
    try {
      setLoadingState('downvote-loading');

      await vote({
        variables: {
          postId: parseInt(post.id),
          inputVoteValue: VoteType.Downvote,
        },
      });

      setLoadingState('not-loading');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Flex direction="column" mr={4}>
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label="upvote"
        onClick={post.voteType === VoteTypeValues.Upvote ? undefined : handleUpvote}
        isLoading={loading && loadingState === 'upvote-loading'}
        colorScheme={post.voteType === VoteTypeValues.Upvote ? 'green' : undefined}
      ></IconButton>

      <Box textAlign="center" py={2}>
        {post.points}
      </Box>

      <IconButton
        icon={<ChevronDownIcon />}
        aria-label="downvote"
        onClick={post.voteType === VoteTypeValues.Downvote ? undefined : handleDownvote}
        isLoading={loading && loadingState === 'downvote-loading'}
        colorScheme={post.voteType === VoteTypeValues.Downvote ? 'red' : undefined}
      ></IconButton>
    </Flex>
  );
};

export default UpvoteSection;
