import { Session, SessionData } from 'express-session';

type Context = {
  req: Express.Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  res: Express.Response;
};

export default Context;
