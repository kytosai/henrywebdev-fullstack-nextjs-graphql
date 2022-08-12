import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { DataSource } from 'typeorm';
import { SESSION_COOKIE_NAME, __prod__ } from './constants';
import Post from './entities/Post';
import User from './entities/User';
import HelloResolver from './resolvers/Hello';
import PostResolver from './resolvers/Post';
import UserResolver from './resolvers/User';
import Context from './types/Context';

dotenv.config();

if (
  !process.env.MONGODB_URI ||
  !process.env.DB_NAME ||
  !process.env.DB_USERNAME_DEV ||
  !process.env.DB_PASSWORD_DEV ||
  !process.env.SESSION_SECRET
) {
  throw Error('env invalid');
}

const main = async () => {
  const myDataSource = new DataSource({
    type: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    logging: false, // for debug
    synchronize: true, // ! only use for development
    entities: [User, Post],
  });

  await myDataSource.initialize();

  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true, // ! allow receive cookie from client
    }),
  );

  // session/cookie store
  const MONGODB_URI = process.env.MONGODB_URI!;
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected!');

  /* 
    setup session store
    Doc
      - CRSF: https://viblo.asia/p/ky-thuat-tan-cong-csrf-va-cach-phong-chong-amoG84bOGz8P 
  */
  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      secret: process.env.SESSION_SECRET!,
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
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => {
      return {
        req,
        res,
      };
    },

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

  // create this page for test cookie
  app.get('/cookie', (req: any, res) => {
    req.session.test = 1;

    return res.json({
      code: 1,
    });
  });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`server start at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
};

main().catch((e) => {
  console.log(e);
});
