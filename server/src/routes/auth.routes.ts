import { Router } from "express";
import * as authController from '../controllers/auth.controllers'
import { authenticate } from "../middleware/auth.middleware";

const router = Router()

router.post('/register', authController.register)
router.post('/login',    authController.login)
router.get('/me',        authenticate, authController.me)

export default router