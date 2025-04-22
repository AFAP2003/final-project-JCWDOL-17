import { Router } from 'express'
import { storeManagementRouter } from './storeManagement.router'
import userManagementController from '@/controllers/userManagement.controller'
import { userManagementRouter } from './userManagement.router'
import { categoryManagementRouter } from './categoryManagement.router'

const apiRouter = Router()

apiRouter.use('/',storeManagementRouter())
apiRouter.use('/',userManagementRouter())
apiRouter.use('/',categoryManagementRouter())
export default apiRouter