import dotenv from 'dotenv-safe';
import add from './math/add';
dotenv.config();
console.log('Hi');

console.log(process.env.MY_NAME);
console.log(add(2, 3));
