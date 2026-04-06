import {Router} from "express";
import {search, } from "./user.controller";
import {authMiddleware} from "./auth.service";

const router = Router();

router.get('/search', authMiddleware, search);

export default router;