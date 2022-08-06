import { Response, Request } from 'express';
import { Session, SessionData } from 'express-session';

type Context = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  res: Response;
};

export default Context;
