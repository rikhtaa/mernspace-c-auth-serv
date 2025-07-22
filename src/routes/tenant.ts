import express, {
    RequestHandler,
    Request,
    Response,
    NextFunction,
} from 'express'
import { TenantController } from '../controllers/TenantController'
import { TenantService } from '../services/TenantService'
import { AppDataSource } from '../config/data-source'
import { Tenant } from '../entity/Tenant'
import logger from '../config/logger'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import listUsersValidator from '../validators/list-users-validator'
import authenticate from '../middlewares/authenticate'
import tenantValidator from '../validators/tenant-validator'
import { CreateTenantRequest } from '../types'
const router = express.Router()

const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService, logger)

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        tenantController.create(req, res, next) as unknown as RequestHandler,
)

router.get(
    '/',
    listUsersValidator,
    (req: Request, res: Response, next: NextFunction) => {
        tenantController.getAll(req, res, next) as unknown as RequestHandler
    },
)

router.get(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) => {
        tenantController.getOne(req, res, next) as unknown as RequestHandler
    },
)

router.delete(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) => {
        tenantController.deleteOne(req, res, next) as unknown as RequestHandler
    },
)
router.patch(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.update(req, res, next) as unknown as RequestHandler
    },
)

export default router
