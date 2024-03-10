import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRoute from './routes/user.route.js';
import businessRoute from './routes/business.route.js';

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

app.use(userRoute);
app.use(businessRoute);

app.listen(port, () => {
  console.log(`⚡️[Server]: biz-portal-api is running at http://localhost:${port}`);
});

export default app;
