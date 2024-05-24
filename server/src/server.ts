import App from './app';
import UserRoute from './routes/user.route';
import BusinessRoute from './routes/business.route';

const server = new App();

server.initializedRoutes([UserRoute, BusinessRoute]);
server.listen();
