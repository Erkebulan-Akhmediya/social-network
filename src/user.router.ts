import {Router} from "express";
import {search, getById} from "./user.controller";
import {authMiddleware} from "./auth.service";

const router = Router();

router.get('/search', authMiddleware, search);
router.get('/:id', authMiddleware, getById)

export default router;