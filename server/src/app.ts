import dotenv from 'dotenv';
import express, { Request, Response, type Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Routes } from './types';

// init dot env
dotenv.config();

export default class App {
  public app: express.Application;
  public env: string | undefined;
  public port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT ?? 5005;
    this.initializeMiddlewares();
  }

  initDB() {
    // * initialization of the database
  }

  initializeMiddlewares() {
    // initialize server middlewares
    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    this.app.options('*', cors()); // enable pre-flight?
    this.app.use(
      bodyParser.json({
        // @ts-ignore
        // ( just so rawBody is available during WH validation)
        verify: (req: Request, res: Response, buf) => (req['rawBody'] = buf),
      })
    );
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.set('trust proxy', 1);
  }

  listen() {
    // initialize database
    this.initDB();
    // listen on server port
    this.app.listen(this.port, () => {
      console.info('Server started at http://localhost:' + this.port);
    });
  }

  //   it set to Router[] for now, later on, it would be optmized to Routes[]
  initializedRoutes(routes: Router[]) {
    // initialize all routes middleware
    routes.forEach(route => {
      this.app.use('/api', route);
    });

    this.app.get('/', (req, res) => {
      res.json({
        message: 'Welcome to Bizconnect24 API',
      });
    });

    this.app.all('*', (req, res) => {
      res.status(404);
      return res.json({ message: '404 Not Found' });
    });
  }
}
