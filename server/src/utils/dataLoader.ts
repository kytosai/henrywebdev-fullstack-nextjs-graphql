import DataLoader from 'dataloader';
import { In } from 'typeorm';
import User from '../entities/User';

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

export const buildDataLoaders = () => {
  return {
    userLoader: new DataLoader<number, User | undefined>((userIds) => {
      return batchGetUsers(userIds as number[]);
    }),
  };
};
