import { Router } from 'express';
import { storeManagementRouter } from './storeManagement.router';
import userManagementController from '@/controllers/userManagement.controller';
import { userManagementRouter } from './userManagement.router';
import { categoryManagementRouter } from './categoryManagement.router';
import productManagementController from '@/controllers/productManagement.controller';
import { productManagementRouter } from './productManagement.router';
import { inventoryManagementRouter } from './inventoryManagemen.router';
import { discountManagementRouter } from './discountManagement.router';
import { reportManagementRouter } from './reportManagement.router';
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
