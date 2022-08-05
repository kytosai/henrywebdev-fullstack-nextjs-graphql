import dotenv from 'dotenv';
import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import User from './entities/User';
import Post from './entities/Post';
import HelloResolver from './resolvers/Hello';
import UserResolver from './resolvers/User';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { COOKIE_NAME, __prod__ } from './constants';

dotenv.config();

if (
  !process.env.MONGODB_URI ||
  !process.env.DB_NAME ||
  !process.env.DB_USERNAME_DEV ||
  !process.env.DB_PASSWORD_DEV
) {
  throw Error('env invalid');
}

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

  // session/cookie store
  const MONGODB_URI = process.env.MONGODB_URI!;
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected!');

  // setup session store
  app.use(
    session({
      name: COOKIE_NAME,
      secret: process.env.SESSION_SCECRET!,
      saveUninitialized: false, // don't save empty session, right from the start
      resave: false,
      store: MongoStore.create({ mongoUrl: MONGODB_URI }),
      cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true, // js frontend cannot access this cookie
        secure: __prod__, // cookie only work in https
        sameSite: 'lax', // protect against CRSF
      },
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver],
      validate: false,
    }),

    /*
      Add local graphql landing page
    */
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`server start at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
};

main().catch((e) => {
  console.log(e);
});
