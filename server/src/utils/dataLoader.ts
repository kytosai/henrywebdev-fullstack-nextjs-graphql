import DataLoader from 'dataloader';
import { In } from 'typeorm';
import Upvote from '../entities/Upvote';
import User from '../entities/User';

interface VoteTypeCondition {
  postId: number;
  userId: number;
}

/*
  (breaking changes) In video use findByIds. But it was deprecated, use findBy method instead in conjunction with In operator
*/
const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findBy({
    id: In(userIds),
  });

  /*
    Example
      Input: [1,2] // list user id
      TRUE: users === [{id: 1}, {id: 2}]
      FALSE: users === [{id: 2}, {id: 1}] // wrong mapping with input order 
  */
  return userIds.map((userId) => {
    return users.find((user) => user.id === userId);
  });
};

const batchGetVoteTypes = async (voteTypeConditions: VoteTypeCondition[]) => {
  // const voteTypes = await Upvote.find({
  //   where: [In(voteTypeConditions)],
  // });

  const voteTypes = await Upvote.findByIds(voteTypeConditions);

  return voteTypeConditions.map((voteTypeCondition) => {
    return voteTypes.find((voteType) => {
      return (
        voteType.postId === voteTypeCondition.postId &&
        voteType.userId === voteTypeCondition.userId
      );
    });
  });
};

export const buildDataLoaders = () => {
  return {
    userLoader: new DataLoader<number, User | undefined>((userIds) => {
      return batchGetUsers(userIds as number[]);
    }),
    voteTypeLoader: new DataLoader<VoteTypeCondition, Upvote | undefined>(
      (voteTypeConditions) => {
        return batchGetVoteTypes(voteTypeConditions as VoteTypeCondition[]);
      },
    ),
  };
};
