import jwt from 'passport-jwt';
import { JwtPayload } from '../types/auth.js';
import passport from 'passport';
import prisma from '../utils/prisma.client';

const JwtStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;
const jwtTokenSecret = process.env.JWT_TOKEN_SECRET as string;

const opts: jwt.StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtTokenSecret,
};

passport.use(
  new JwtStrategy(opts, async function (jwt_payload: JwtPayload, done) {
    const user = await prisma.user.findFirst({
      where: {
        uuid: jwt_payload.id,
      },
      select: {
        uuid: true,
      },
    });

    if (user) {
      return done(null, jwt_payload);
    } else {
      return done(null, false);
    }
  })
);

export default passport;
