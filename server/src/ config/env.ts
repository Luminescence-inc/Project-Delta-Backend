const inDev = process.env.NODE_ENV === 'development';

const Env = {
  PORT: process.env.PORT || 5005,
  API_URL: inDev ? process.env.API_URL : process.env.API_URL ?? `http://localhost:5005/api`,
};
export default Env;
