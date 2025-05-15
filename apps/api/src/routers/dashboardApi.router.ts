import { Router } from 'express';
import { categoryManagementRouter } from './categoryManagement.router';
import { discountManagementRouter } from './discountManagement.router';
import { inventoryManagementRouter } from './inventoryManagemen.router';
import { productManagementRouter } from './productManagement.router';
import { reportManagementRouter } from './reportManagement.router';
import { storeManagementRouter } from './storeManagement.router';
import { userManagementRouter } from './userManagement.router';
import { orderManagementRouter } from './orderManagement.router';

const apiRouter = Router();

apiRouter.use('/', storeManagementRouter());
apiRouter.use('/', userManagementRouter());
apiRouter.use('/', categoryManagementRouter());
apiRouter.use('/', productManagementRouter());
apiRouter.use('/', inventoryManagementRouter());
apiRouter.use('/', discountManagementRouter());
apiRouter.use('/', reportManagementRouter());
apiRouter.use('/', orderManagementRouter());

export default apiRouter;
