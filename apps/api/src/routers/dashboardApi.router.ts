import { Router } from 'express'
import { storeManagementRouter } from './storeManagement.router'
import userManagementController from '@/controllers/userManagement.controller'
import { userManagementRouter } from './userManagement.router'
import { categoryManagementRouter } from './categoryManagement.router'
import productManagementController from '@/controllers/productManagement.controller'
import { productManagementRouter } from './productManagement.router'

const apiRouter = Router()

apiRouter.use('/',storeManagementRouter())
apiRouter.use('/',userManagementRouter())
apiRouter.use('/',categoryManagementRouter())
apiRouter.use('/',productManagementRouter())
export default apiRouter