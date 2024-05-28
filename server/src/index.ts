import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRoute from './routes/user.route.js';
import businessRoute from './routes/business.route.js';
import { scheduleAJob } from './services/scheduler.service.js';

const app = express();
const port = process.env.PORT || 5005;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
  })
);
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'success',
  });
});

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  console.log('Request Headers:', req.headers);
  next();
});

const routes = [userRoute, businessRoute];

routes.forEach(route => {
  app.use('/api', route);
});

// Added the schedule to start once job server starts
app.listen(port, () => {
  console.log(`⚡️[Server]: biz-portal-api is running at http://localhost:${port}`);
  try {
    scheduleAJob();
  } catch (err) {
    console.error(err);
  }
});

export default app;
