import dotenv from 'dotenv';
import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import User from './entities/User';
import Post from './entities/Post';

dotenv.config();

const main = async () => {
  const myDataSource = new DataSource({
    type: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    logging: true,
    synchronize: true, // ! only use for development
    entities: [User, Post],
  });

  await myDataSource.initialize();

  const app = express();

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`server start at http://localhost:${PORT}`);
  });
};

main().catch((e) => {
  console.log(e);
});
